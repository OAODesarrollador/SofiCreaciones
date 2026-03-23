import crypto from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'admin_token';
export const ADMIN_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function toBase64Url(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function fromBase64Url(input) {
    const base = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base + '='.repeat((4 - (base.length % 4)) % 4);
    return Buffer.from(padded, 'base64');
}

function getAdminTokenSecret() {
    if (process.env.ADMIN_TOKEN_SECRET) return process.env.ADMIN_TOKEN_SECRET;
    return crypto
        .createHash('sha256')
        .update(`${process.env.ADMIN_PASSWORD || 'unset'}:admin-token-v1`)
        .digest('hex');
}

function signPayloadBase64(payloadBase64) {
    return crypto
        .createHmac('sha256', getAdminTokenSecret())
        .update(payloadBase64)
        .digest('base64url');
}

function safeEqual(a, b) {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
}

export function createAdminToken() {
    const payload = {
        v: 1,
        iat: Math.floor(Date.now() / 1000),
        role: 'admin',
    };
    const payloadBase64 = toBase64Url(JSON.stringify(payload));
    const signature = signPayloadBase64(payloadBase64);
    return `${payloadBase64}.${signature}`;
}

export function verifyAdminToken(token, maxAgeSeconds = ADMIN_TOKEN_MAX_AGE_SECONDS) {
    if (!token || typeof token !== 'string' || !token.includes('.')) return false;

    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return false;

    const expectedSignature = signPayloadBase64(payloadBase64);
    if (!safeEqual(signature, expectedSignature)) return false;

    try {
        const payloadRaw = fromBase64Url(payloadBase64).toString('utf8');
        const payload = JSON.parse(payloadRaw);
        const now = Math.floor(Date.now() / 1000);

        if (payload?.v !== 1) return false;
        if (payload?.role !== 'admin') return false;
        if (!Number.isInteger(payload?.iat)) return false;
        if (payload.iat > now + 300) return false;
        if (payload.iat + maxAgeSeconds < now) return false;

        return true;
    } catch {
        return false;
    }
}

export function isAdminAuthenticated() {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
}

export function getAdminCookieOptions() {
    return {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: ADMIN_TOKEN_MAX_AGE_SECONDS,
    };
}

