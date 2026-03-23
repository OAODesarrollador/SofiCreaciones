import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderPayments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';

const STATUS_MAP = {
    approved: 'pago_confirmado',
    pending: 'pendiente_pago',
    in_process: 'pendiente_pago',
    rejected: 'cancelado',
    cancelled: 'cancelado',
};

function getMappedStatus(mpStatus) {
    return STATUS_MAP[mpStatus] || null;
}

export async function POST(request) {
    try {
        const { orderId, formData } = await request.json();

        if (!orderId || !formData) {
            return NextResponse.json({ error: 'orderId and formData are required' }, { status: 400 });
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: 'MP_ACCESS_TOKEN is not configured' }, { status: 500 });
        }

        const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
        const order = orderRows[0];

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const transactionAmount = Number(
            formData.transaction_amount ??
            formData.transactionAmount ??
            formData.amount
        );

        if (!Number.isFinite(transactionAmount)) {
            return NextResponse.json({ error: 'transaction_amount is required' }, { status: 400 });
        }

        if (Number(order.total) !== transactionAmount) {
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
        }

        const existingPayments = await db.select().from(orderPayments).where(eq(orderPayments.orderId, orderId));
        const hasApproved = existingPayments.some(p => p.status === 'approved');
        if (hasApproved) {
            return NextResponse.json({ error: 'Order already paid' }, { status: 409 });
        }

        const idempotencyKey = formData.token
            ? `${orderId}-${formData.token}`
            : `order-${orderId}-${crypto.randomUUID()}`;

        const paymentBody = {
            ...formData,
            transaction_amount: transactionAmount,
            external_reference: orderId,
            description: `Pedido #${orderId}`,
        };

        const backendBaseUrl = process.env.BACKEND_URL;
        if (backendBaseUrl && /^https?:\/\//i.test(backendBaseUrl) && !/localhost|127\.0\.0\.1/i.test(backendBaseUrl)) {
            paymentBody.notification_url = `${backendBaseUrl}/api/payments/mp/webhook`;
        }

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(paymentBody),
        });

        const mpData = await mpResponse.json().catch(() => null);

        if (!mpResponse.ok) {
            return NextResponse.json({ error: 'Mercado Pago error', detail: mpData }, { status: 502 });
        }

        const now = new Date().toISOString();
        await db.insert(orderPayments).values({
            paymentId: String(mpData.id),
            orderId,
            status: mpData.status,
            statusDetail: mpData.status_detail,
            paymentMethodId: mpData.payment_method_id,
            amount: transactionAmount,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoUpdate({
            target: orderPayments.paymentId,
            set: {
                status: mpData.status,
                statusDetail: mpData.status_detail,
                paymentMethodId: mpData.payment_method_id,
                amount: transactionAmount,
                updatedAt: now,
            },
        });

        const mappedStatus = getMappedStatus(mpData.status);
        if (mappedStatus) {
            if (!(order.status === 'pago_confirmado' && mappedStatus !== 'pago_confirmado')) {
                await db.update(orders).set({ status: mappedStatus }).where(eq(orders.id, orderId));
            }
        }

        return NextResponse.json({
            paymentId: String(mpData.id),
            status: mpData.status,
            status_detail: mpData.status_detail,
        }, { status: 200 });
    } catch (error) {
        console.error('MP create payment error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
