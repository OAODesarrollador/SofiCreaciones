import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'url query required' }, { status: 400 });
    }

    // Only allow a small set of hosts for safety
    const allowedHosts = ['drive.google.com', 'lh3.googleusercontent.com', 'raw.githubusercontent.com', 'i.imgur.com'];
    const parsed = new URL(url);
    if (!allowedHosts.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
    }

    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json({ error: 'failed to fetch image', status: res.status }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    const body = await res.arrayBuffer();

    return new NextResponse(Buffer.from(body), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (err) {
    console.error('image proxy error', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
