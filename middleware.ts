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

// Marker cookie yang di-set oleh login form setelah Supabase auth berhasil.
// Supabase JS v2 menyimpan session di localStorage (bukan cookie),
// sehingga kita tidak bisa cek session Supabase langsung dari middleware.
// Solusi: set cookie 'sipeda_admin' setelah login, clear saat logout.
function hasAdminSession(request: NextRequest): boolean {
  return request.cookies.has('sipeda_admin');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya protect /admin/** kecuali /admin/login
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // Cek marker cookie — instant, tanpa network call
  if (!hasAdminSession(request)) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/((?!login).*)'],
};