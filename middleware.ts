/**
 * middleware.ts — Server-side route protection + session refresh
 *
 * Dua tanggung jawab:
 * 1. Refresh session cookie Supabase (agar tidak expire)
 * 2. Proteksi route /admin/* dan /petugas/* berdasarkan role
 *
 * Role matrix:
 * ┌────────────────┬─────────────────────────────────────────────┐
 * │ Route          │ Allowed roles                               │
 * ├────────────────┼─────────────────────────────────────────────┤
 * │ /admin/login   │ Semua (bypass)                              │
 * │ /admin/*       │ admin, superadmin                           │
 * │ /petugas/login │ Semua (bypass)                              │
 * │ /petugas/*     │ petugas_lapangan, admin, superadmin         │
 * │ Lainnya        │ Semua (public)                              │
 * └────────────────┴─────────────────────────────────────────────┘
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // ── 1. Buat Supabase client dengan cookie handler ──────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies di request (untuk downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Buat response baru dengan updated cookies
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ── 2. Refresh session (WAJIB, jangan skip) ───────────────────────────
  // getClaims() memvalidasi JWT dan refresh token jika expired.
  // getUser() juga aman — ia mengambil user dari token yang sudah divalidasi.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // ── 3. Route yang tidak perlu proteksi ─────────────────────────────────
  const isLoginPage =
    pathname === '/admin/login' ||
    pathname === '/petugas/login' ||
    pathname === '/login';

  if (isLoginPage) {
    return supabaseResponse;
  }

  // ── 4. Proteksi route /admin/* dan /petugas/* ──────────────────────────
  const isAdminRoute = pathname.startsWith('/admin');
  const isPetugasRoute = pathname.startsWith('/petugas');

  if (!isAdminRoute && !isPetugasRoute) {
    // Route publik — biarkan lewat
    return supabaseResponse;
  }

  // Harus punya session
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cek role dari tabel admins
  const { data: adminData } = await supabase
    .from('admins')
    .select('role')
    .eq('auth_user_id', user.id)
    .single();

  if (!adminData) {
    // User authenticated tapi tidak terdaftar di tabel admins
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('error', 'no_access');
    return NextResponse.redirect(loginUrl);
  }

  const role = adminData.role as string;

  // /admin/* — hanya admin dan superadmin
  if (isAdminRoute && !['admin', 'superadmin'].includes(role)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(loginUrl);
  }

  // /petugas/* — petugas_lapangan, admin, dan superadmin
  if (
    isPetugasRoute &&
    !['petugas_lapangan', 'admin', 'superadmin'].includes(role)
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    loginUrl.searchParams.set('error', 'forbidden');
    return NextResponse.redirect(loginUrl);
  }

  // ── 5. Authorized — teruskan dengan cookies yang sudah di-refresh ─────
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match routes yang perlu proteksi + session refresh.
     * Exclude: static files, images, favicon.
     */
    '/admin/:path*',
    '/petugas/:path*',
    '/login',
  ],
};