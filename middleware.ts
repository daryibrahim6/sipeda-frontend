import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * middleware.ts — Pass-through
 *
 * Admin route protection dilakukan sepenuhnya di sisi client
 * via requireAdminAuth() di masing-masing halaman admin.
 *
 * Alasan middleware dinonaktifkan:
 * - Supabase JS v2 menyimpan session di localStorage (bukan cookie)
 * - Middleware (Edge Runtime) hanya bisa baca cookies
 * - Tidak ada cookie Supabase yang bisa dibaca middleware
 * - Semua solusi cookie-based berpotensi race condition
 *
 * Security: requireAdminAuth() di setiap admin page sudah cukup.
 */
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};