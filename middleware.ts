import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * middleware.ts — Route Protection untuk Admin
 * 
 * PENTING: Middleware berjalan di Edge Runtime.
 * Jangan import modul Node.js biasa di sini.
 * 
 * File ini WAJIB ada di root /src/ atau root project.
 * Letakkan di: src/middleware.ts
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Hanya protect route /admin/** kecuali /admin/login
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  // Baca cookie session dari Supabase
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Forward cookies dari request ke Supabase client
        cookie: request.headers.get('cookie') ?? '',
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();

  // Kalau tidak ada session → redirect ke login
  if (!session) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('expired', '1');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Matcher: semua route /admin/** kecuali static files dan /admin/login
  matcher: [
    '/admin/((?!login).*)',
  ],
};