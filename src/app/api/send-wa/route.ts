import { NextResponse } from 'next/server';
import { sendWA } from '@/lib/fonnte';
import { rateLimitMiddleware } from '@/lib/rate-limit';
import { verifyAuth } from '@/lib/api-auth';

export async function POST(request: Request) {
    const rl = await rateLimitMiddleware({ maxRequests: 5, windowMs: 60_000 })(request);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: `Terlalu banyak permintaan. Coba lagi ${rl.retryAfter} detik lagi.` },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
        );
    }

    // Auth guard: petugas, admin, atau superadmin
    const caller = await verifyAuth(request as unknown as import('next/server').NextRequest, [
        'petugas_lapangan',
        'admin',
        'superadmin',
    ]);
    if (!caller) {
        return NextResponse.json(
            { error: 'Akses ditolak. Hanya petugas, admin, atau superadmin yang dapat mengirim WA.' },
            { status: 403 },
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
