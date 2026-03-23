import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema';
import { isAdminAuthenticated } from '@/lib/auth/adminAuth';

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

function startOfWeek(date) {
    const d = startOfDay(date);
    const day = d.getDay(); // 0-6
    const diff = day === 0 ? -6 : 1 - day; // monday start
    return addDays(d, diff);
}

function addMonths(date, months) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

function getRange(period) {
    const now = new Date();
    const today = startOfDay(now);

    if (period === 'week') {
        const start = startOfWeek(today);
        const end = endOfDay(addDays(start, 6));
        return { start, end };
    }

    if (period === 'quarter') {
        const month = today.getMonth();
        const quarterStartMonth = month - (month % 3);
        const start = new Date(today.getFullYear(), quarterStartMonth, 1);
        const end = endOfDay(addDays(addMonths(start, 3), -1));
        return { start, end };
    }

    if (period === 'year') {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = endOfDay(new Date(today.getFullYear(), 11, 31));
        return { start, end };
    }

    // Default: current month
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = endOfDay(new Date(today.getFullYear(), today.getMonth() + 1, 0));
    return { start, end };
}

function dateKey(date, period) {
    const d = new Date(date);
    if (period === 'year') {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (period === 'quarter') {
        const ws = startOfWeek(d);
        return ws.toISOString().slice(0, 10);
    }
    return d.toISOString().slice(0, 10);
}

function buildBuckets(start, end, period) {
    const buckets = [];

    if (period === 'year') {
        const cursor = new Date(start.getFullYear(), 0, 1);
        for (let i = 0; i < 12; i += 1) {
            const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
            const label = cursor.toLocaleDateString('es-AR', { month: 'short' });
            buckets.push({ key, label, value: 0 });
            cursor.setMonth(cursor.getMonth() + 1);
        }
        return buckets;
    }

    if (period === 'quarter') {
        let cursor = startOfWeek(start);
        while (cursor <= end) {
            const key = cursor.toISOString().slice(0, 10);
            const label = cursor.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
            buckets.push({ key, label, value: 0 });
            cursor = addDays(cursor, 7);
        }
        return buckets;
    }

    let cursor = startOfDay(start);
    while (cursor <= end) {
        const key = cursor.toISOString().slice(0, 10);
        const label = cursor.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        buckets.push({ key, label, value: 0 });
        cursor = addDays(cursor, 1);
    }
    return buckets;
}

export async function GET(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get('period') || 'month';
        const allowed = new Set(['week', 'month', 'quarter', 'year']);
        const safePeriod = allowed.has(period) ? period : 'month';

        const { start, end } = getRange(safePeriod);
        const [allOrders, allItems] = await Promise.all([
            db.select().from(orders),
            db.select().from(orderItems)
        ]);

        const ordersInRange = allOrders.filter((order) => {
            const date = new Date(order.date);
            return !Number.isNaN(date.getTime()) && date >= start && date <= end;
        });

        const orderIds = new Set(ordersInRange.map((order) => order.id));
        const itemsInRange = allItems.filter((item) => orderIds.has(item.orderId));

        const totalsByProduct = {};
        let totalUnits = 0;
        for (const item of itemsInRange) {
            const name = item.productName || 'Sin nombre';
            const qty = Number(item.quantity) || 0;
            totalsByProduct[name] = (totalsByProduct[name] || 0) + qty;
            totalUnits += qty;
        }

        const sortedProducts = Object.entries(totalsByProduct)
            .map(([name, quantity]) => ({ name, quantity }))
            .sort((a, b) => b.quantity - a.quantity);

        const topFiveProducts = sortedProducts.slice(0, 5).map((item) => ({
            ...item,
            percentage: totalUnits > 0 ? Number(((item.quantity / totalUnits) * 100).toFixed(1)) : 0
        }));

        const topFiveUnits = topFiveProducts.reduce((sum, item) => sum + item.quantity, 0);
        const otherUnits = Math.max(0, totalUnits - topFiveUnits);

        const buckets = buildBuckets(start, end, safePeriod);
        const byKey = Object.fromEntries(buckets.map((b) => [b.key, 0]));
        for (const order of ordersInRange) {
            const d = new Date(order.date);
            const key = dateKey(d, safePeriod);
            if (key in byKey) {
                byKey[key] += Number(order.total) || 0;
            }
        }

        const salesSeries = buckets.map((bucket) => ({
            label: bucket.label,
            value: byKey[bucket.key] || 0
        }));

        const totalsByPayment = {};
        let totalRevenue = 0;
        for (const order of ordersInRange) {
            const method = order.paymentMethod || 'desconocido';
            const amount = Number(order.total) || 0;
            totalsByPayment[method] = (totalsByPayment[method] || 0) + amount;
            totalRevenue += amount;
        }

        const paymentMethods = Object.entries(totalsByPayment)
            .map(([method, amount]) => ({
                method,
                amount,
                percentage: totalRevenue > 0 ? Number(((amount / totalRevenue) * 100).toFixed(1)) : 0
            }))
            .sort((a, b) => b.amount - a.amount);

        return NextResponse.json({
            success: true,
            data: {
                period: safePeriod,
                range: {
                    start: start.toISOString(),
                    end: end.toISOString()
                },
                topProducts: topFiveProducts,
                otherProducts: {
                    quantity: otherUnits,
                    percentage: totalUnits > 0 ? Number(((otherUnits / totalUnits) * 100).toFixed(1)) : 0
                },
                totals: {
                    unitsSold: totalUnits,
                    orders: ordersInRange.length,
                    revenue: totalRevenue
                },
                salesSeries,
                paymentMethods
            }
        });
    } catch (error) {
        console.error('GET /api/admin/statistics/sales error:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}
