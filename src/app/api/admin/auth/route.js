import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, createAdminToken, getAdminCookieOptions } from '@/lib/auth/adminAuth';

export async function POST(req) {
    const body = await req.json().catch(() => ({}));
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validPassword) {
        return NextResponse.json({ error: 'Admin password is not configured' }, { status: 500 });
    }

    if (body.password === validPassword) {
        cookies().set(ADMIN_COOKIE_NAME, createAdminToken(), getAdminCookieOptions());
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
