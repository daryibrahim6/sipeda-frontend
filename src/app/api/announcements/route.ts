import { NextResponse } from 'next/server';
import { getAnnouncements } from '@/lib/api';

export const revalidate = 60;

export async function GET() {
  const data = await getAnnouncements();
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' },
  });
}
