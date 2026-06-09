import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[SIPEDA] Missing env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    'Pastikan file .env.local sudah ada dan diisi dengan benar.'
  );
}

// Singleton — satu instance untuk seluruh app (server-side / api.ts)
let _supabase: ReturnType<typeof createSupabaseClient> | null = null;

export const supabase = (() => {
  if (_supabase) return _supabase;
  _supabase = createSupabaseClient(supabaseUrl, supabaseAnon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return _supabase;
})();

// Admin client — bypass RLS, HANYA untuk Server Actions / API Routes
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('[SIPEDA] SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di environment');
  }
  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}