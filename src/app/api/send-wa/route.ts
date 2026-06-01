import { NextResponse } from 'next/server';
import { sendWA } from '@/lib/fonnte';
import { rateLimitMiddleware } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const rl = rateLimitMiddleware({ maxRequests: 5, windowMs: 60_000 })(request);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak permintaan. Coba lagi ${rl.retryAfter} detik lagi.` },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
    );
  }

  try {
    const { phone, message } = await request.json();

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'phone and message are required' },
        { status: 400 },
      );
    }

    const result = await sendWA(phone, message);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[/api/send-wa]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
