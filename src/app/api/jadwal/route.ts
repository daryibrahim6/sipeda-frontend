import { NextResponse } from 'next/server';
import { getSchedules } from '@/lib/api';
import { rateLimitMiddleware } from '@/lib/rate-limit';

export async function GET(request: Request) {
    const rl = rateLimitMiddleware({ maxRequests: 30, windowMs: 60_000 })(request);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: `Terlalu banyak permintaan. Coba lagi ${rl.retryAfter} detik lagi.` },
            { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } },
        );
    }

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') ?? String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()));

    try {
        const data = await getSchedules(month, year);
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
        });
} catch (err) {
    console.error('[/api/jadwal]', err);
    return NextResponse.json(
        { error: 'Gagal memuat data jadwal.' },
        { status: 500 },
    );
}
}
