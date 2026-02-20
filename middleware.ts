import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya jaga route /admin (kecuali /admin/login)
  if (!pathname.startsWith('/admin')) return NextResponse.next();
  if (pathname === '/admin/login')    return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validasi token (decode base64 sederhana)
  try {
    const payload = JSON.parse(atob(token));
    if (!payload.exp || payload.exp < Date.now()) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('expired', '1');
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete(AUTH_COOKIE);
      return res;
    }
  } catch {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};