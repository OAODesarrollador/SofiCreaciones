import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request) {
    try {
        const { orderId } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: 'MP_ACCESS_TOKEN is not configured' }, { status: 500 });
        }

        const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
        const order = orderRows[0];

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const itemsRows = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));

        if (!itemsRows || itemsRows.length === 0) {
            return NextResponse.json({ error: 'Order items not found' }, { status: 400 });
        }

        const items = itemsRows.map((item) => ({
            title: item.productName,
            unit_price: Number(item.price),
            quantity: Number(item.quantity),
        }));

        const origin = new URL(request.url).origin;
        const frontendBaseUrl = process.env.FRONTEND_URL || origin;
        const backendBaseUrl = process.env.BACKEND_URL || origin;

        const preferencePayload = {
            items,
            external_reference: orderId,
            back_urls: {
                success: `${frontendBaseUrl}/checkout?status=success&orderId=${orderId}`,
                failure: `${frontendBaseUrl}/checkout?status=failure&orderId=${orderId}`,
                pending: `${frontendBaseUrl}/checkout?status=pending&orderId=${orderId}`,
            },
            notification_url: `${backendBaseUrl}/api/payments/mp/webhook`,
        };

        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferencePayload),
        });

        if (!mpResponse.ok) {
            const errorText = await mpResponse.text();
            return NextResponse.json({ error: 'Mercado Pago error', detail: errorText }, { status: 502 });
        }

        const mpData = await mpResponse.json();

        return NextResponse.json({ init_point: mpData.init_point, preference_id: mpData.id }, { status: 200 });
    } catch (error) {
        console.error('MP preference error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
