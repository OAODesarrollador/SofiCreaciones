export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdminAuthenticated } from '@/lib/auth/adminAuth';

const DELIVERY_MARKER_REGEX = /\[\[DELIVERY:(ENTREGADO|NO_ENTREGADO)\]\]/g;

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

function endOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

function addDays(date, days) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function extractDeliveryStatus(comments) {
    if (!comments || typeof comments !== 'string') {
        return { deliveryStatus: 'NO_ENTREGADO', cleanComments: comments || '' };
    }

    const match = comments.match(/\[\[DELIVERY:(ENTREGADO|NO_ENTREGADO)\]\]/);
    const deliveryStatus = match?.[1] || 'NO_ENTREGADO';
    const cleanComments = comments.replace(DELIVERY_MARKER_REGEX, '').trim();

    return { deliveryStatus, cleanComments };
}

function injectDeliveryStatus(comments, deliveryStatus) {
    const baseComments = (comments || '').replace(DELIVERY_MARKER_REGEX, '').trim();
    const marker = `[[DELIVERY:${deliveryStatus}]]`;
    return baseComments ? `${baseComments}\n${marker}` : marker;
}

export async function GET() {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const now = new Date();
        const todayStart = startOfDay(now);
        const yesterdayStart = startOfDay(addDays(now, -1));
        const yesterdayEnd = endOfDay(addDays(now, -1));

        const rows = await db.select().from(orders);
        const allOrders = rows
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((order) => {
                const d = new Date(order.date);
                const day = d >= todayStart
                    ? 'today'
                    : d >= yesterdayStart && d <= yesterdayEnd
                        ? 'yesterday'
                        : 'older';
                const { deliveryStatus, cleanComments } = extractDeliveryStatus(order.comments);
                return {
                    id: order.id,
                    date: order.date,
                    customerName: order.customerName,
                    customerPhone: order.customerPhone,
                    deliveryMethod: order.deliveryMethod,
                    deliveryAddress: order.deliveryAddress,
                    paymentMethod: order.paymentMethod,
                    total: order.total,
                    status: order.status,
                    deliveryStatus,
                    comments: cleanComments,
                    itemsDisplay: order.itemsDisplay,
                    day
                };
            });

        return NextResponse.json({ success: true, data: allOrders });
    } catch (error) {
        console.error('GET /api/admin/orders/recent error:', error);
        return NextResponse.json({ error: 'Failed to fetch recent orders' }, { status: 500 });
    }
}

export async function PATCH(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { orderId, deliveryStatus } = body || {};
        const allowed = new Set(['ENTREGADO', 'NO_ENTREGADO']);

        if (!orderId || !deliveryStatus || !allowed.has(deliveryStatus)) {
            return NextResponse.json({ error: 'orderId/deliveryStatus inválido' }, { status: 400 });
        }

        const [currentOrder] = await db.select({ comments: orders.comments })
            .from(orders)
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!currentOrder) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }

        const updatedComments = injectDeliveryStatus(currentOrder.comments, deliveryStatus);

        await db.update(orders)
            .set({ comments: updatedComments })
            .where(eq(orders.id, orderId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PATCH /api/admin/orders/recent error:', error);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
    }
}
