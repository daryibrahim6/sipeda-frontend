/**
 * lib/auth.ts — Supabase Auth untuk Admin
 */

import { supabase } from './supabase';

// ─── Admin login ──────────────────────────────────────────────────────────────

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error('Email atau password salah. Silakan coba lagi.');

  // Check admin record — parallel dengan fire-and-forget last_login update
  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, name, email, role')
    .eq('auth_user_id', data.user.id)
    .single();

  if (adminError || !adminData) {
    await supabase.auth.signOut();
    throw new Error('Akun ini tidak memiliki akses admin.');
  }

  // Non-blocking: update last_login tanpa tunggu response (tidak perlu await)
  supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', adminData.id)
    .then(() => { }); // fire and forget

  return {
    session: data.session,
    user: {
      id: adminData.id,
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
    },
  };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAdmin() {
  await supabase.auth.signOut();
}

// ─── Get current session ──────────────────────────────────────────────────────

export async function getAdminSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: adminData } = await supabase
    .from('admins')
    .select('id, name, email, role')
    .eq('auth_user_id', session.user.id)
    .single();

  if (!adminData) return null;
  return { session, user: adminData };
}

// ─── Check if logged in (client-side guard) ───────────────────────────────────

export async function requireAdminAuth() {
  const sessionData = await getAdminSession();
  if (!sessionData) {
    window.location.href = '/admin/login?expired=1';
    return null;
  }
  return sessionData;
}