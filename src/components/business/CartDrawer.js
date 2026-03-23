'use client';

import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartDrawer() {
    const { items, isOpen, setIsOpen, updateQuantity, removeFromCart, total } = useCart();

    if (!isOpen) return null;

    return (
        <div className={`${styles.overlay} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(false)}>
            <div className={styles.drawer} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Tu Compra</h2>
                    <button className={`btn btn-ghost ${styles.closeBtn}`} onClick={() => setIsOpen(false)}>
                        <X />
                    </button>
                </div>

                <div className={styles.items}>
                    {items.length === 0 ? (
                        <p className={styles.empty}>Tu carrito está vacío.</p>
                    ) : (
                        items.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} className={styles.item}>
                                <div className={styles.itemDetails}>
                                    <span className={styles.itemName}>{item.nombre}</span>
                                    <div className={styles.controls}>
                                        <button className={`btn btn-outline ${styles.qtyBtn}`} onClick={() => updateQuantity(item.id, item.isCombo, -1)}>
                                            <span className={styles.qtySymbol}>-</span>
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button className={`btn btn-outline ${styles.qtyBtn}`} onClick={() => updateQuantity(item.id, item.isCombo, 1)}>
                                            <span className={styles.qtySymbol}>+</span>
                                        </button>
                                        <span className={styles.itemPrice}>{formatPrice(item.precio * item.quantity)}</span>
                                        <button className={`btn btn-danger ${styles.removeBtn}`} onClick={() => removeFromCart(item.id, item.isCombo)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className={styles.footer}>
                        <div className={styles.totalRow}>
                            <span>Total:</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                        <Link href="/checkout" className={`btn btn-primary ${styles.checkoutBtn}`} onClick={() => setIsOpen(false)}>
                            Iniciar Compra
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
