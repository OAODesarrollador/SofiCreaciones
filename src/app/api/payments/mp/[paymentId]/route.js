import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const paymentId = String(params?.paymentId || '').trim();

        if (!/^\d+$/.test(paymentId)) {
            return NextResponse.json({ ok: false, error: 'Invalid paymentId' }, { status: 400 });
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ ok: false, error: 'MP_ACCESS_TOKEN is not configured' }, { status: 500 });
        }

        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
            },
            cache: 'no-store',
        });

        const mpData = await mpResponse.json().catch(() => null);

        if (!mpResponse.ok) {
            if (mpResponse.status === 401 || mpResponse.status === 403) {
                return NextResponse.json(
                    { ok: false, error: 'Mercado Pago authorization failed', detail: mpData },
                    { status: mpResponse.status }
                );
            }

            if (mpResponse.status === 404) {
                return NextResponse.json(
                    { ok: false, error: 'Payment not found', id: paymentId },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { ok: false, error: 'Mercado Pago error', detail: mpData },
                { status: 500 }
            );
        }

        return NextResponse.json({
            ok: true,
            id: String(mpData.id ?? paymentId),
            status: mpData.status,
            status_detail: mpData.status_detail,
        }, { status: 200 });
    } catch (error) {
        console.error('MP payment status error:', error);
        return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
