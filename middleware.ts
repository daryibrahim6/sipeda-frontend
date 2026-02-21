import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * middleware.ts — Route Protection untuk Admin
 *
 * Menggunakan cookie parsing manual karena @supabase/ssr
 * tidak tersedia / menyebabkan bundle issue di Edge Runtime.
 *
 * Supabase menyimpan session di cookie bernama:
 * sb-<ref>-auth-token   (format lama)
 * sbat-<ref>            (format baru pkce)
 * Kalau salah satu ada → user dianggap sudah login.
 */

const SUPABASE_REF = 'aevkwrwoogefmyxszkpb';

function hasSupabaseSession(request: NextRequest): boolean {
  const cookieHeader = request.headers.get('cookie') ?? '';

  // Supabase cookie formats
  const patterns = [
    `sb-${SUPABASE_REF}-auth-token`,
    `sbat-${SUPABASE_REF}`,
    `sb-access-token`,
  ];

  return patterns.some(p => cookieHeader.includes(p));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya protect /admin/** kecuali /admin/login
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // Fast cookie check — tidak perlu network call ke Supabase
  if (!hasSupabaseSession(request)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/((?!login).*)'],
};