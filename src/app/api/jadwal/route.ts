import { NextResponse } from 'next/server';
import { getSchedules } from '@/lib/api';

export async function GET(request: Request) {
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
        return NextResponse.json([], { status: 200 });
    }
}
