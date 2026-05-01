/**
 * lib/auth.ts — Supabase Auth untuk Admin & Petugas
 *
 * Menggunakan @supabase/ssr browser client agar session tersimpan
 * di cookie — bukan hanya localStorage. Ini memungkinkan middleware
 * membaca session untuk server-side route protection.
 */

import { createClient } from './supabase-browser';
import { fireAndForget } from './utils';

// ─── Shared Types ─────────────────────────────────────────────────────────────

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

// ─── Internal Helpers (not exported) ──────────────────────────────────────────

/**
 * Core login: authenticate → lookup admin record → validate role.
 * Semua public login functions memanggil ini.
 */
async function loginWithRole(
  email: string,
  password: string,
  opts: {
    allowedRoles?: string[];
    deniedRoles?: string[];
    notFoundMessage: string;
    forbiddenMessage: string;
  },
) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Email atau password salah. Silakan coba lagi.');

  const { data: adminData, error: adminError } = await supabase
    .from('admins')
    .select('id, name, email, role')
    .eq('auth_user_id', data.user.id)
    .single();

  if (adminError || !adminData) {
    await supabase.auth.signOut();
    throw new Error(opts.notFoundMessage);
  }

  const role = adminData.role as string;

  // Check denied roles (e.g., petugas blocked from admin panel)
  if (opts.deniedRoles?.includes(role)) {
    await supabase.auth.signOut();
    throw new Error(opts.forbiddenMessage);
  }

  // Check allowed roles (e.g., only petugas/admin/superadmin for /petugas)
  if (opts.allowedRoles && !opts.allowedRoles.includes(role)) {
    await supabase.auth.signOut();
    throw new Error(opts.forbiddenMessage);
  }

  // Non-blocking: update last_login
  fireAndForget(
    supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', adminData.id),
    'update last_login',
  );

  return {
    session: data.session,
    user: {
      id: adminData.id,
      name: adminData.name,
      email: adminData.email,
      role,
    },
  };
}

/**
 * Core session check: get session → lookup admin record → validate role.
 * Dipakai oleh getAdminSession dan getPetugasSession.
 */
async function getSessionByRoles(allowedRoles?: string[]) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: adminData } = await supabase
    .from('admins')
    .select('id, name, email, role')
    .eq('auth_user_id', session.user.id)
    .single();

  if (!adminData) return null;

  const role = adminData.role as string;
  if (allowedRoles && !allowedRoles.includes(role)) return null;

  return { session, user: adminData };
}

// ─── Public API: Login ────────────────────────────────────────────────────────

/** Login khusus admin panel — blokir petugas_lapangan */
export async function loginAdmin(email: string, password: string) {
  return loginWithRole(email, password, {
    deniedRoles: ['petugas_lapangan'],
    notFoundMessage: 'Akun ini tidak memiliki akses admin.',
    forbiddenMessage: 'Akun petugas lapangan tidak memiliki akses admin. Silakan login di halaman petugas.',
  });
}

/** Login unified (halaman /login) — semua role di tabel admins boleh masuk */
export async function loginUnified(email: string, password: string) {
  return loginWithRole(email, password, {
    notFoundMessage: 'Akun ini tidak terdaftar di sistem.',
    forbiddenMessage: 'Akun ini tidak memiliki akses.',
  });
}

/** Login petugas — hanya petugas_lapangan, admin, dan superadmin */
export async function loginPetugas(email: string, password: string) {
  return loginWithRole(email, password, {
    allowedRoles: ['petugas_lapangan', 'admin', 'superadmin'],
    notFoundMessage: 'Akun ini tidak memiliki akses petugas.',
    forbiddenMessage: 'Akun ini tidak memiliki akses petugas lapangan.',
  });
}

// ─── Public API: Logout ───────────────────────────────────────────────────────

export async function logoutAdmin() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

// ─── Public API: Session ──────────────────────────────────────────────────────

/** Cek session admin — hanya admin dan superadmin */
export async function getAdminSession() {
  return getSessionByRoles(['admin', 'superadmin']);
}

/** Cek session petugas — petugas_lapangan, admin, dan superadmin */
export async function getPetugasSession() {
  return getSessionByRoles(['petugas_lapangan', 'admin', 'superadmin']);
}

// ─── Public API: Client-Side Guards ───────────────────────────────────────────

export async function requireAdminAuth() {
  const sessionData = await getAdminSession();
  if (!sessionData) {
    window.location.href = '/login?expired=1';
    return null;
  }
  return sessionData;
}

export async function requirePetugasAuth() {
  const sessionData = await getPetugasSession();
  if (!sessionData) {
    window.location.href = '/login?expired=1';
    return null;
  }
  return sessionData;
}