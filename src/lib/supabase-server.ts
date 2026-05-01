/**
 * lib/supabase-server.ts — Supabase client untuk Server Components, 
 * Server Actions, Route Handlers, dan Middleware.
 *
 * Menggunakan @supabase/ssr createServerClient yang:
 * - Membaca session dari cookies (bukan localStorage)
 * - Membuat instance baru per-request (no cross-request leak)
 * - Aman untuk dipakai di Node.js server environment
 *
 * PENTING: Jangan simpan hasil createClient() di module-level variable.
 * Selalu panggil createClient() di dalam fungsi request handler.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Buat Supabase server client yang membaca/menulis session via cookies.
 * Panggil ini di dalam Server Components, Server Actions, atau Route Handlers.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll dipanggil dari Server Component (read-only context).
            // Bisa diabaikan jika middleware sudah handle token refresh.
          }
        },
      },
    },
  );
}
