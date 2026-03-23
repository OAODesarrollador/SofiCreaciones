import { NextResponse } from 'next/server';
import { saveOrderToSheet } from '@/lib/orders';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate basics
        if (!body.items || body.items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        // Call Sheet logic
        const result = await saveOrderToSheet(body);

        if (result.success) {
            return NextResponse.json({ message: 'Order saved' }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
