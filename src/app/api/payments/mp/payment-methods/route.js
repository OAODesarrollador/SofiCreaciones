import { NextResponse } from 'next/server';

export async function GET() {
    try {
        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: 'MP_ACCESS_TOKEN is not configured' }, { status: 500 });
        }

        const mpResponse = await fetch('https://api.mercadopago.com/v1/payment_methods', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        if (!mpResponse.ok) {
            const errorText = await mpResponse.text();
            return NextResponse.json({ error: 'Mercado Pago error', detail: errorText }, { status: 502 });
        }

        const data = await mpResponse.json();
        return NextResponse.json({ payment_methods: data }, { status: 200 });
    } catch (error) {
        console.error('MP payment_methods error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
