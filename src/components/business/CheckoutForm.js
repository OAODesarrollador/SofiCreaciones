'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { Copy } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { generateWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/utils';
import { MP_TRANSFER_CONFIG } from '@/lib/config';
import styles from './CheckoutForm.module.css';

const TRANSFER_STORAGE_KEY = 'lp_transfer_order_v1';
const TRANSFER_STATUS_PENDING = 'PENDIENTE_TRANSFERENCIA';
const TRANSFER_STATUS_REVIEW = 'PAGO_A_CONFIRMAR';

const createOrderId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
};

export default function CheckoutForm({ whatsappNumber }) {
    const { items, total, clearCart } = useCart();
    const router = useRouter();
    const searchParams = useSearchParams();
    const mpStatus = searchParams?.get('status');
    const mpOrderId = searchParams?.get('orderId');
    const mpPublicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
    const mpBrickRef = useRef(null);
    const mpMissingKeyRef = useRef(false);
    const mpOrderDataRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        method: 'retiro',
        address: '',
        payment: 'efectivo',
        comments: ''
    });
    const [status, setStatus] = useState('idle');
    const [finalOrder, setFinalOrder] = useState(null);
    const [mpContext, setMpContext] = useState(null);
    const [mpStage, setMpStage] = useState('idle');
    const [mpResult, setMpResult] = useState(null);
    const [mpError, setMpError] = useState(null);
    const [mpScriptLoaded, setMpScriptLoaded] = useState(false);
    const [mpModalOpen, setMpModalOpen] = useState(true);
    const [mpBrickKey, setMpBrickKey] = useState(0);
    const [mpOrderData, setMpOrderData] = useState(null);
    const [transferOrder, setTransferOrder] = useState(null);
    const [transferStatus, setTransferStatus] = useState(null);
    const [transferToast, setTransferToast] = useState(null);
    const [whatsappPreviewOpen, setWhatsappPreviewOpen] = useState(false);
    const [whatsappPreviewMessage, setWhatsappPreviewMessage] = useState('');

    const totalAmount = Number(total);
    const isTotalValid = Number.isFinite(totalAmount);
    const formattedTotal = isTotalValid ? formatPrice(totalAmount) : '--';

    useEffect(() => {
        mpOrderDataRef.current = mpOrderData;
    }, [mpOrderData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'payment' && value !== 'transferencia') {
            clearTransferState();
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showTransferToast = (message) => {
        setTransferToast(message);
        setTimeout(() => {
            setTransferToast(null);
        }, 2400);
    };

    const persistTransferState = (payload) => {
        try {
            localStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            console.warn('No se pudo persistir el pedido de transferencia', error);
        }
    };

    const clearTransferState = () => {
        setTransferOrder(null);
        setTransferStatus(null);
        setTransferToast(null);
        try {
            localStorage.removeItem(TRANSFER_STORAGE_KEY);
        } catch {
            // ignore storage errors
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        if (!isTotalValid) {
            alert('El monto total es inválido. Revisá el carrito.');
            setStatus('idle');
            return;
        }

        const orderId = createOrderId();
        const initialStatus = (formData.payment === 'mercadopago' || formData.payment === 'mercadopago_app')
            ? 'pendiente_pago'
            : formData.payment === 'transferencia'
                ? TRANSFER_STATUS_PENDING
                : 'Nuevo';
        const order = {
            id: orderId,
            date: new Date().toISOString(),
            customer: { name: formData.name, phone: formData.phone },
            delivery: { method: formData.method, address: formData.address },
            payment: { method: formData.payment },
            items,
            total,
            comments: formData.comments,
            status: initialStatus
        };

        try {
            // 1. Save to Sheets (via API)
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order)
            });

            if (!res.ok) throw new Error('Error al guardar pedido');

            if (formData.payment === 'mercadopago') {
                if (mpStatus) {
                    router.replace('/checkout');
                }
                setMpContext({ orderId });
                setMpOrderData(order);
                setMpResult(null);
                setMpError(null);
                setMpStage('idle');
                setStatus('idle');
                return;
            }

            if (formData.payment === 'mercadopago_app') {
                const prefRes = await fetch('/api/payments/mp/preference', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId })
                });

                const prefData = await prefRes.json().catch(() => ({}));
                if (!prefRes.ok || !prefData?.init_point) {
                    throw new Error(prefData?.error || 'No se pudo iniciar Mercado Pago');
                }

                setStatus('idle');
                window.location.assign(prefData.init_point);
                return;
            }

            if (formData.payment === 'transferencia') {
                setTransferOrder(order);
                setTransferStatus(TRANSFER_STATUS_PENDING);
                setStatus('idle');
                persistTransferState({ order, status: TRANSFER_STATUS_PENDING });
                return;
            }

            // 2. Prepare WhatsApp
            const message = generateWhatsAppMessage(order);

            // 3. Clear Cart and Show Success
            clearCart();
            setFinalOrder({ ...order, message });
            setStatus('success');

        } catch (error) {
            console.error(error);
            alert('Hubo un error al guardar el pedido. Por favor intenta de nuevo.');
            setStatus('idle');
        }
    };

    useEffect(() => {
        if (!mpContext || !mpScriptLoaded) return;
        if (!mpPublicKey) {
            if (!mpMissingKeyRef.current) {
                mpMissingKeyRef.current = true;
                setMpError('Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY');
                setMpStage('error');
            }
            return;
        }

        let mounted = true;

        const initBrick = async () => {
            try {
                const mp = new window.MercadoPago(mpPublicKey, { locale: 'es-AR' });
                const bricksBuilder = mp.bricks();

                const controller = await bricksBuilder.create('payment', 'mp-payment-brick', {
                    initialization: { amount: total },
                    customization: {
                        paymentMethods: {
                            creditCard: 'all',
                            debitCard: 'all',
                            prepaidCard: 'all',
                        },
                    },
                    callbacks: {
                        onReady: () => {
                            if (mounted) setMpStage('ready');
                        },
                        onSubmit: (brickData) => {
                            const payload = brickData?.formData || brickData;
                            setMpStage('processing');
                            setMpError(null);

                            return new Promise(async (resolve, reject) => {
                                try {
                                    const res = await fetch('/api/payments/mp/create', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ orderId: mpContext.orderId, formData: payload })
                                    });

                                    const data = await res.json();
                                    if (!res.ok) {
                                        const msg = data?.error || 'Error al procesar el pago';
                                        setMpError(msg);
                                        setMpStage('error');
                                        reject(new Error(msg));
                                        return;
                                    }

                                    setMpResult(data);
                                    setMpStage('result');
                                    resolve();
                                } catch (error) {
                                    setMpError('Error al procesar el pago');
                                    setMpStage('error');
                                    reject(error);
                                }
                            });
                        },
                        onError: (error) => {
                            if (mounted) {
                                setMpError(error?.message || 'Error en el formulario de pago');
                                setMpStage('error');
                            }
                        }
                    }
                });

                mpBrickRef.current = controller;
            } catch (error) {
                if (mounted) {
                    setMpError('No se pudo inicializar Mercado Pago');
                    setMpStage('error');
                }
            }
        };

        initBrick();

        return () => {
            mounted = false;
            if (mpBrickRef.current) {
                mpBrickRef.current.unmount();
                mpBrickRef.current = null;
            }
        };
    }, [mpContext, mpScriptLoaded, mpPublicKey, total, mpBrickKey]);

    useEffect(() => {
        if (mpResult?.status && !mpModalOpen) {
            setMpModalOpen(true);
        }
    }, [mpResult?.status, mpModalOpen]);

    useEffect(() => {
        if (!mpResult?.paymentId) return;
        const isPending = ['pending', 'in_process'].includes(mpResult.status);

        if (!isPending) {
            if (mpResult.status === 'approved') {
                clearCart();
            }
            return;
        }

        let active = true;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/payments/mp/${mpResult.paymentId}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!active) return;
                setMpResult(prev => ({ ...prev, ...data }));

                if (data.status && !['pending', 'in_process'].includes(data.status)) {
                    clearInterval(interval);
                    if (data.status === 'approved') {
                        clearCart();
                    }
                }
            } catch {
                // Ignore polling errors
            }
        }, 4000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [mpResult?.paymentId, mpResult?.status, clearCart]);

    useEffect(() => {
        if (mpResult?.status !== 'approved' || !mpOrderData) return;
        const message = generateWhatsAppMessage(mpOrderData);
        setWhatsappPreviewMessage(message);
        setWhatsappPreviewOpen(true);
    }, [mpResult?.status, mpOrderData]);

    useEffect(() => {
        if (status === 'success' && finalOrder?.message) {
            setWhatsappPreviewMessage(finalOrder.message);
            setWhatsappPreviewOpen(true);
        }
    }, [status, finalOrder]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem(TRANSFER_STORAGE_KEY);
            if (!raw) return;
            const saved = JSON.parse(raw);
            if (saved?.order?.payment?.method === 'transferencia' && saved?.status) {
                setTransferOrder(saved.order);
                setTransferStatus(saved.status);
                setStatus('idle');
            }
        } catch (error) {
            console.warn('No se pudo cargar el pedido de transferencia', error);
        }
    }, []);

    useEffect(() => {
        if (!transferOrder) return;
        persistTransferState({ order: transferOrder, status: transferStatus });
    }, [transferOrder, transferStatus]);

    const handleCopy = async (value, label) => {
        const textValue = String(value ?? '');
        if (!textValue) return;
        try {
            await navigator.clipboard.writeText(textValue);
            showTransferToast(`${label} copiado`);
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = textValue;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            const mountTarget = document.body || document.documentElement;
            if (!mountTarget) {
                showTransferToast('No se pudo copiar');
                return;
            }
            mountTarget.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                showTransferToast(`${label} copiado`);
            } catch {
                showTransferToast('No se pudo copiar');
            } finally {
                if (textarea.parentNode) {
                    textarea.parentNode.removeChild(textarea);
                }
            }
        }
    };

    const handleMarkTransferred = async () => {
        if (!transferOrder) return;
        setTransferStatus(TRANSFER_STATUS_REVIEW);
        setTransferOrder(prev => ({ ...prev, status: TRANSFER_STATUS_REVIEW }));
        showTransferToast('Marcado como transferido');

        const message = generateWhatsAppMessage({
            ...transferOrder,
            status: TRANSFER_STATUS_REVIEW,
        });
        setWhatsappPreviewMessage(message);
        setWhatsappPreviewOpen(true);
        clearCart();

        try {
            await fetch('/api/orders/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: transferOrder.id, status: TRANSFER_STATUS_REVIEW })
            });
        } catch {
            // backend optional; keep local state
        }
    };

    const renderStatusModal = ({ title, message, variant, orderId, paymentId, detail, onClose, closeLabel = 'Cerrar', extraActions = null, extraContent = null }) => {
        const variantClass = variant === 'ok'
            ? styles.statusOk
            : variant === 'warn'
                ? styles.statusWarn
                : variant === 'error'
                    ? styles.statusError
                    : styles.statusInfo;

        const formatStatusDetail = (value) => {
            if (!value) return null;
            const map = {
                cc_rejected_bad_filled_card_number: 'Número de tarjeta inválido.',
                cc_rejected_bad_filled_date: 'Fecha de vencimiento inválida.',
                cc_rejected_bad_filled_other: 'Datos de la tarjeta inválidos.',
                cc_rejected_bad_filled_security_code: 'Código de seguridad inválido.',
                cc_rejected_blacklist: 'La tarjeta está en lista de riesgo.',
                cc_rejected_call_for_authorize: 'El banco requiere autorización.',
                cc_rejected_card_disabled: 'La tarjeta está deshabilitada.',
                cc_rejected_card_error: 'Error con la tarjeta.',
                cc_rejected_duplicated_payment: 'Pago duplicado.',
                cc_rejected_high_risk: 'Pago rechazado por riesgo.',
                cc_rejected_insufficient_amount: 'Fondos insuficientes.',
                cc_rejected_invalid_installments: 'Cuotas inválidas.',
                cc_rejected_max_attempts: 'Máximo de intentos alcanzado.',
                cc_rejected_other_reason: 'Pago rechazado por el banco.',
                pending_contingency: 'Estamos procesando el pago. Te avisaremos cuando se acredite.',
                pending_review_manual: 'El pago está en revisión. Te avisaremos cuando se acredite.',
            };
            return map[value] || null;
        };
        const detailText = formatStatusDetail(detail);

        return (
            <div className={styles.modalOverlay}>
                <div className={styles.modalContent}>
                    <h2>{title}</h2>
                    {orderId && <p>Compra #{orderId}</p>}
                    {paymentId && <p>Pago #{paymentId}</p>}
                    <div className={`${styles.statusBadge} ${variantClass}`}>{message}</div>
                    {detailText && <p style={{ marginTop: '10px' }}>{detailText}</p>}
                    {extraContent}
                    <div className={`${styles.modalActions} ${styles.whatsappModalActions}`}>
                        {extraActions}
                        <button type="button" className={`btn btn-secondary ${styles.whatsappModalBtn}`} onClick={onClose}>
                            {closeLabel}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderWhatsAppPreviewModal = (message, { onClose, onSend } = {}) => {
        if (!whatsappPreviewOpen) return null;
        return (
            <div className={styles.modalOverlay}>
                <div className={`${styles.modalContent} ${styles.whatsappModalContent}`}>
                    <h2 className={styles.whatsappModalTitle}>Detalle para WhatsApp</h2>
                    <p>Este es el mensaje que se enviará:</p>
                    <div
                        className={styles.transferMessageBox}
                        role="textbox"
                        aria-label="Mensaje para WhatsApp"
                        tabIndex={0}
                        onClick={(e) => {
                            const range = document.createRange();
                            range.selectNodeContents(e.currentTarget);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }}
                    >
                        {message}
                    </div>
                    <div className={`${styles.modalActions} ${styles.whatsappModalActions}`}>
                        <button
                            type="button"
                            className={`btn btn-primary ${styles.whatsappBtn} ${styles.whatsappModalBtn}`}
                            onClick={() => {
                                if (onSend) onSend();
                                openWhatsApp(whatsappNumber || '5491112345678', message);
                                window.location.assign('/');
                            }}
                        >
                            Enviar WhatsApp
                        </button>
                        <button
                            type="button"
                            className={`btn btn-secondary ${styles.whatsappModalBtn}`}
                            onClick={() => {
                                setWhatsappPreviewOpen(false);
                                window.location.assign('/');
                                if (onClose) onClose();
                            }}
                        >
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (items.length === 0 && status !== 'success' && !mpStatus && !mpContext && !transferOrder) {
        return <div className={styles.container}><p>Tu carrito está vacío.</p></div>;
    }

    if (mpStatus && mpOrderId && !mpContext) {
        const statusTitle = mpStatus === 'success'
            ? 'Pago aprobado'
            : mpStatus === 'pending'
                ? 'Pago pendiente'
                : 'Pago rechazado';

        const statusMessage = mpStatus === 'success'
            ? 'Tu pago fue aprobado. Estamos preparando tu pedido.'
            : mpStatus === 'pending'
                ? 'Tu pago está pendiente de confirmación.'
                : 'Tu pago fue rechazado o cancelado.';

        const statusVariant = mpStatus === 'success'
            ? 'ok'
            : mpStatus === 'pending'
                ? 'warn'
                : 'error';

        const handleBackHome = () => {
            window.location.assign('/');
        };

        const mpMessage = mpOrderData ? generateWhatsAppMessage(mpOrderData) : '';
        return renderStatusModal({
            title: statusTitle,
            message: statusMessage,
            variant: statusVariant,
            orderId: mpOrderId,
            detail: null,
            onClose: handleBackHome,
            closeLabel: 'Volver al inicio',
            extraContent: mpMessage ? (
                <div className={styles.mpWhatsAppPreview}>
                    <p>Detalle para WhatsApp:</p>
                    <div
                        className={styles.transferMessageBox}
                        role="textbox"
                        aria-label="Mensaje para WhatsApp"
                        tabIndex={0}
                        onClick={(e) => {
                            const range = document.createRange();
                            range.selectNodeContents(e.currentTarget);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                        }}
                    >
                        {mpMessage}
                    </div>
                </div>
            ) : null,
            extraActions: mpMessage ? (
                <button
                    type="button"
                    className={`btn btn-primary ${styles.whatsappBtn} ${styles.whatsappModalBtn}`}
                    onClick={() => {
                        openWhatsApp(whatsappNumber || '+543704054127', mpMessage);
                        window.location.assign('/');
                    }}
                >
                    Enviar WhatsApp
                </button>
            ) : null,
        });
    }

    if (mpContext) {
        const statusLabel = mpResult?.status === 'approved'
            ? 'Pago aprobado'
            : mpResult?.status === 'pending'
                ? 'Pago pendiente'
                : mpResult?.status === 'in_process'
                    ? 'Pago en proceso'
                    : mpResult?.status === 'rejected'
                        ? 'Pago rechazado'
                        : mpResult?.status === 'cancelled'
                            ? 'Pago cancelado'
                            : null;
        const statusVariant = mpResult?.status === 'approved'
            ? 'ok'
            : mpResult?.status === 'pending' || mpResult?.status === 'in_process'
                ? 'warn'
                : mpResult?.status === 'rejected' || mpResult?.status === 'cancelled'
                    ? 'error'
                    : 'info';
        const statusMessage = statusLabel
            ? statusLabel
            : null;

        const handleBackHome = () => {
            window.location.assign('/');
        };

        const handleCancelPurchase = () => {
            setMpModalOpen(false);
            setMpResult(null);
            setMpError(null);
            setMpStage('idle');
            setMpContext(null);
            setMpOrderData(null);
            clearCart();
            window.location.assign('/');
        };

        return (
            <div className={styles.container}>
                <Script
                    src="https://sdk.mercadopago.com/js/v2"
                    strategy="afterInteractive"
                    onLoad={() => setMpScriptLoaded(true)}
                />
                {statusMessage && mpModalOpen && renderStatusModal({
                    title: 'Estado del pago',
                    message: statusMessage,
                    variant: statusVariant,
                    orderId: mpContext.orderId,
                    paymentId: mpResult?.paymentId,
                    detail: mpResult?.status_detail,
                    onClose: () => {
                        if (mpResult?.status === 'approved') {
                            handleBackHome();
                            return;
                        }
                        setMpModalOpen(false);
                        setMpResult(null);
                        setMpError(null);
                        setMpStage('idle');
                        setMpBrickKey(prev => prev + 1);
                    },
                    closeLabel: mpResult?.status === 'approved' ? 'Volver al inicio' : 'Cerrar',
                    extraContent: mpOrderData ? (
                        <div className={styles.mpWhatsAppPreview}>
                            <p>Detalle para WhatsApp:</p>
                            <div
                                className={styles.transferMessageBox}
                                role="textbox"
                                aria-label="Mensaje para WhatsApp"
                                tabIndex={0}
                                onClick={(e) => {
                                    const range = document.createRange();
                                    range.selectNodeContents(e.currentTarget);
                                    const selection = window.getSelection();
                                    selection.removeAllRanges();
                                    selection.addRange(range);
                                }}
                            >
                                {generateWhatsAppMessage(mpOrderData)}
                            </div>
                        </div>
                    ) : null,
                    extraActions: mpOrderData ? (
                        <button
                            type="button"
                            className={`btn btn-primary ${styles.whatsappBtn} ${styles.whatsappModalBtn}`}
                            onClick={() => {
                                const message = generateWhatsAppMessage(mpOrderData);
                                openWhatsApp(whatsappNumber || '5491112345678', message);
                                window.location.assign('/');
                            }}
                        >
                            Enviar WhatsApp
                        </button>
                    ) : null,
                })}
                <div className={styles.success} style={{ opacity: statusMessage ? 0.35 : 1 }}>
                    <h2>Pago con Mercado Pago</h2>
                    <p>Compra #{mpContext.orderId}</p>
                    {mpResult?.paymentId && <p>Pago #{mpResult.paymentId}</p>}
                    {mpError && <p style={{ color: '#e74c3c' }}>{mpError}</p>}
                    {mpStage === 'processing' && <p>Procesando pago...</p>}
                    <div id="mp-payment-brick" style={{ marginTop: '16px' }} />
                    <div className={styles.modalActions}>
                        <button type="button" className={`btn btn-danger ${styles.cancelBtn}`} onClick={handleCancelPurchase}>
                            Anular compra y volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (transferOrder) {
        const referenceText = `PEDIDO #${transferOrder.id}`;
        const statusLabel = transferStatus === TRANSFER_STATUS_REVIEW
            ? 'Pago informado - En revisión'
            : 'Pendiente de transferencia';

        return (
            <div className={styles.container}>
                {renderWhatsAppPreviewModal(whatsappPreviewMessage, {
                    onSend: clearTransferState,
                    onClose: clearTransferState,
                })}
                <div className={styles.transferPanel}>
                    <h2>Transferencia (Mercado Pago)</h2>
                    <p>Compra #{transferOrder.id}</p>
                    <div className={styles.transferStatus}>{statusLabel}</div>

                    <div className={styles.transferGrid}>
                        <div className={styles.transferItem}>
                            <span className={styles.transferLabel}>Alias</span>
                            <div className={styles.transferValueRow}>
                                <span className={`${styles.transferValue} ${styles.selectable}`}>{MP_TRANSFER_CONFIG.MP_ALIAS}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(MP_TRANSFER_CONFIG.MP_ALIAS, 'Alias')}
                                    aria-label="Copiar alias"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.transferItem}>
                            <span className={styles.transferLabel}>CVU</span>
                            <div className={styles.transferValueRow}>
                                <span className={`${styles.transferValue} ${styles.selectable}`}>{MP_TRANSFER_CONFIG.MP_CVU}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(MP_TRANSFER_CONFIG.MP_CVU, 'CVU')}
                                    aria-label="Copiar CVU"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.transferItem}>
                            <span className={styles.transferLabel}>Titular</span>
                            <div className={styles.transferValueRow}>
                                <span className={`${styles.transferValue} ${styles.selectable}`}>{MP_TRANSFER_CONFIG.MP_TITULAR}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(MP_TRANSFER_CONFIG.MP_TITULAR, 'Titular')}
                                    aria-label="Copiar titular"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        {MP_TRANSFER_CONFIG.MP_BANK_NAME && (
                            <div className={styles.transferItem}>
                                <span className={styles.transferLabel}>Banco</span>
                                <div className={styles.transferValueRow}>
                                    <span className={`${styles.transferValue} ${styles.selectable}`}>{MP_TRANSFER_CONFIG.MP_BANK_NAME}</span>
                                    <button
                                        type="button"
                                        className={styles.copyButton}
                                        onClick={() => handleCopy(MP_TRANSFER_CONFIG.MP_BANK_NAME, 'Banco')}
                                        aria-label="Copiar banco"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className={styles.transferItem}>
                            <span className={styles.transferLabel}>Monto exacto</span>
                            <div className={styles.transferValueRow}>
                                <span className={`${styles.transferValue} ${styles.selectable}`}>{formattedTotal}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(formattedTotal, 'Monto')}
                                    aria-label="Copiar monto"
                                    disabled={!isTotalValid}
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                        <div className={styles.transferItem}>
                            <span className={styles.transferLabel}>Referencia</span>
                            <div className={styles.transferValueRow}>
                                <span className={`${styles.transferValue} ${styles.selectable}`}>{referenceText}</span>
                                <button
                                    type="button"
                                    className={styles.copyButton}
                                    onClick={() => handleCopy(referenceText, 'Referencia')}
                                    aria-label="Copiar referencia"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.transferActions}>
                        <button
                            type="button"
                            className={`btn btn-primary ${styles.transferActionBtn}`}
                            onClick={handleMarkTransferred}
                            aria-label="Ya transferí"
                            disabled={transferStatus === TRANSFER_STATUS_REVIEW}
                        >
                            Ya transferí
                        </button>
                        <button
                            type="button"
                            className={`btn btn-secondary ${styles.transferSecondaryBtn}`}
                            onClick={clearTransferState}
                            aria-label="Cambiar método de pago"
                        >
                            Cambiar método
                        </button>
                    </div>

                    {transferToast && (
                        <div className={styles.transferToast} role="status">
                            {transferToast}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'success' && finalOrder) {
        const handleCancelAll = () => {
            setFinalOrder(null);
            setFormData({ name: '', phone: '', method: 'retiro', address: '', payment: 'efectivo', comments: '' });
            setStatus('idle');
            router.push('/');
        };

        const handleWhatsApp = () => {
            setWhatsappPreviewMessage(finalOrder.message);
            setWhatsappPreviewOpen(true);
        };

        return (
            <div className={styles.container}>
                {renderWhatsAppPreviewModal(whatsappPreviewMessage, { onClose: () => {} })}
                <div className={styles.success}>
                    <h2>¡Compra Confirmada!</h2>
                    <p>Tu compra #{finalOrder.id} ha sido registrada.</p>
                    <p>Para finalizar, envíanos el detalle por WhatsApp:</p>

                    <div className={styles.buttonGroup}>
                        <button
                            className={`btn btn-primary ${styles.whatsappBtn}`}
                            onClick={handleWhatsApp}
                        >
                            Enviar a WhatsApp
                        </button>
                        <button
                            className={`btn btn-danger ${styles.cancelBtn}`}
                            onClick={handleCancelAll}
                        >
                            Cancelar Todo
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className="section-title">Finalizar Compra</h1>
            <div className={styles.layout}>
                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.group}>
                        <label className={styles.label}>Nombre Completo</label>
                        <input required name="name" className={styles.input} value={formData.name} onChange={handleChange} />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Teléfono</label>
                        <input required name="phone" type="tel" className={styles.input} value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Forma de Envío o Retiro</label>
                        <div className={styles.radioGroup}>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="method" value="retiro" checked={formData.method === 'retiro'} onChange={handleChange} />
                                Retiro en Local
                            </label>
                            <label className={styles.radioLabel}>
                                <input type="radio" name="method" value="envio" checked={formData.method === 'envio'} onChange={handleChange} />
                                Envío a Domicilio
                            </label>
                        </div>
                    </div>

                    {formData.method === 'envio' && (
                        <div className={styles.group}>
                            <label className={styles.label}>Dirección de Envío</label>
                            <input required name="address" className={styles.input} placeholder="Calle, Número, Barrio..." value={formData.address} onChange={handleChange} />
                        </div>
                    )}

                    <div className={styles.group}>
                        <label className={styles.label}>Forma de Pago</label>
                        <select name="payment" className={styles.select} value={formData.payment} onChange={handleChange}>
                            <option value="efectivo">Efectivo</option>
                            <option value="transferencia">Transferencia</option>
                            <option value="mercadopago">Tarjeta de Crédito/Débito</option>
                            <option value="mercadopago_app">Mercado Pago</option>
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label className={styles.label}>Comentarios (Opcional)</label>
                        <textarea name="comments" className={styles.textarea} value={formData.comments} onChange={handleChange} />
                    </div>

                    <div className={styles.summary}>
                        <div className={`${styles.row} ${styles.total}`}>
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={status === 'submitting'}>
                            {status === 'submitting' ? 'Procesando...' : 'Finalizar Compra'}
                        </button>
                        <button type="button" className={`btn btn-secondary ${styles.backBtn}`} onClick={() => router.push('/')}>
                            Volver al inicio
                        </button>
                    </div>
                </form>

                <aside className={styles.sidebar}>
                    <div className={`${styles.sidebarTitle} section-title`}>Detalle de la compra</div>
                    <div className={styles.itemList}>
                        {items.map((item, idx) => (
                            <div key={`${item.id || item.nombre}-${idx}`} className={styles.itemRow}>
                                <div className={styles.itemName}>
                                    {item.nombre}
                                    <span className={styles.itemQty}> × {item.quantity}</span>
                                </div>
                                <div className={styles.itemPrice}>
                                    {formatPrice(item.precio * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={styles.summary}>
                        <div className={styles.row}>
                            <span>Total</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
