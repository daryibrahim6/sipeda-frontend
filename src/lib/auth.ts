/**
 * lib/auth.ts
 * Mock auth — swap fungsi login() ke real API call saat backend siap.
 * Token disimpan di cookie HttpOnly-compatible (via middleware).
 */

export const AUTH_COOKIE = 'sipeda_admin_token';

// Mock credentials — ganti dengan API call ke Laravel nanti
const MOCK_USERS = [
  { email: 'admin@sipeda.id',    password: 'admin123',    name: 'Super Admin',  role: 'superadmin' as const },
  { email: 'operator@sipeda.id', password: 'operator123', name: 'Budi Santoso', role: 'operator'   as const },
];

export type AdminRole = 'superadmin' | 'admin' | 'operator';

export type AdminUser = {
  name:  string;
  email: string;
  role:  AdminRole;
  token: string;
};

// ─── Mock login ───────────────────────────────────────────────────────────────
export async function loginMock(email: string, password: string): Promise<AdminUser> {
  await new Promise(r => setTimeout(r, 600)); // simulasi latency

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Email atau password salah.');

  const token = btoa(JSON.stringify({ email: user.email, role: user.role, exp: Date.now() + 86400000 }));

  return { name: user.name, email: user.email, role: user.role, token };
}

// ─── Token helpers (client-side) ─────────────────────────────────────────────
export function saveToken(token: string, user: Omit<AdminUser, 'token'>) {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=${token}; path=/; max-age=86400; SameSite=Lax`;
  sessionStorage.setItem('sipeda_user', JSON.stringify(user));
}

export function clearToken() {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
  sessionStorage.removeItem('sipeda_user');
}

export function getUser(): Omit<AdminUser, 'token'> | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem('sipeda_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isTokenValid(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token));
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}