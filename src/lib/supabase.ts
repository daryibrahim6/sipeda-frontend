import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[SIPEDA] Missing env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    'Pastikan file .env.local sudah ada dan diisi dengan benar.'
  );
}

/**
 * Supabase client untuk public/browser & server components.
 * Gunakan ini di mana saja kecuali operasi admin yang butuh bypass RLS.
 */
export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // Persist session di browser (localStorage)
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Supabase admin client — bypass Row Level Security.
 * HANYA untuk Server Actions / API Routes, JANGAN pakai di client component.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('[SIPEDA] SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment');
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}