/**
 * lib/supabase-browser.ts — Supabase client untuk Client Components
 *
 * Menggunakan @supabase/ssr createBrowserClient yang otomatis:
 * - Menyimpan session di cookie (bukan hanya localStorage)
 * - Singleton per halaman (aman untuk re-render)
 * - Cookie accessible oleh middleware untuk server-side auth
 *
 * Gunakan ini di semua 'use client' components.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
