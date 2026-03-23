import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderPayments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const STATUS_MAP = {
    approved: 'pago_confirmado',
    pending: 'pendiente_pago',
    in_process: 'pendiente_pago',
    rejected: 'cancelado',
    cancelled: 'cancelado',
};

export async function POST(request) {
    try {
        const url = new URL(request.url);
        const body = await request.json().catch(() => ({}));

        const topic = body?.type || body?.topic || url.searchParams.get('type') || url.searchParams.get('topic');
        const paymentId = body?.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id');

        if (topic && topic !== 'payment') {
            return NextResponse.json({ ok: true, ignored: true }, { status: 200 });
        }

        if (!paymentId) {
            return NextResponse.json({ error: 'payment id not found' }, { status: 400 });
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: 'MP_ACCESS_TOKEN is not configured' }, { status: 500 });
        }

        const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!paymentResponse.ok) {
            const errorText = await paymentResponse.text();
            return NextResponse.json({ error: 'Mercado Pago error', detail: errorText }, { status: 502 });
        }

        const paymentData = await paymentResponse.json();
        const orderId = paymentData.external_reference;
        const mpStatus = paymentData.status;
        const mappedStatus = STATUS_MAP[mpStatus];

        if (!orderId) {
            return NextResponse.json({ error: 'external_reference missing' }, { status: 400 });
        }

        if (!mappedStatus) {
            return NextResponse.json({ ok: true, ignored: true, status: mpStatus }, { status: 200 });
        }

        const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
        const order = orderRows[0];

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const now = new Date().toISOString();
        await db.insert(orderPayments).values({
            paymentId: String(paymentData.id),
            orderId,
            status: paymentData.status,
            statusDetail: paymentData.status_detail,
            paymentMethodId: paymentData.payment_method_id,
            amount: paymentData.transaction_amount ? Number(paymentData.transaction_amount) : null,
            createdAt: now,
            updatedAt: now,
        }).onConflictDoUpdate({
            target: orderPayments.paymentId,
            set: {
                status: paymentData.status,
                statusDetail: paymentData.status_detail,
                paymentMethodId: paymentData.payment_method_id,
                amount: paymentData.transaction_amount ? Number(paymentData.transaction_amount) : null,
                updatedAt: now,
            },
        });

        if (order.status === mappedStatus) {
            return NextResponse.json({ ok: true, idempotent: true }, { status: 200 });
        }

        if (order.status === 'pago_confirmado' && mappedStatus !== 'pago_confirmado') {
            return NextResponse.json({ ok: true, idempotent: true }, { status: 200 });
        }

        await db.update(orders).set({ status: mappedStatus }).where(eq(orders.id, orderId));

        return NextResponse.json({ ok: true, orderId, status: mappedStatus }, { status: 200 });
    } catch (error) {
        console.error('MP webhook error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
