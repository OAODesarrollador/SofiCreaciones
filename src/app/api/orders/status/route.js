import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';

export async function POST(request) {
    try {
        const body = await request.json();
        const { orderId, status } = body || {};

        if (!orderId || !status) {
            return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
        }

        await db.update(orders).set({ status }).where(eq(orders.id, orderId));

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
