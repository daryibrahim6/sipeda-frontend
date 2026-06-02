/**
 * lib/api-auth.ts — Shared auth guard untuk API routes
 *
 * Memvalidasi session dari cookie/Authorization header via Supabase SSR,
 * lalu lookup role di tabel `admins`. Return admin row atau null.
 *
 * Dipakai oleh semua API routes yang butuh auth (admin/petugas/superadmin).
 */

import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from './supabase';

export type AdminRole = 'superadmin' | 'admin' | 'petugas_lapangan';

export type VerifiedAdmin = {
    id: number;
    auth_user_id: string;
    role: AdminRole;
};

/**
 * Verify caller and return admin row jika role termasuk allowedRoles.
 * Mengembalikan null jika tidak authenticated atau role tidak diizinkan.
 *
 * @param req - NextRequest (untuk akses cookies & Authorization header)
 * @param allowedRoles - List role yang diizinkan. Jika kosong, hanya cek authenticated.
 */
export async function verifyAuth(
    req: NextRequest,
    allowedRoles?: AdminRole[],
): Promise<VerifiedAdmin | null> {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return req.cookies.getAll();
                },
                setAll() {
                    // API route — tidak perlu set cookie di sini
                },
            },
        },
    );

    // 1. Ambil user dari cookie session
    const { data: { user } } = await supabase.auth.getUser();
    let authUser = user;

    // 2. Fallback: Authorization header (untuk backward compatibility)
    if (!authUser) {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
            const { data } = await supabase.auth.getUser(token);
            authUser = data.user;
        }
    }

    if (!authUser) return null;

    // 3. Lookup role di tabel admins
    const adminClient = createAdminClient();
    const { data: adminData } = await adminClient
        .from('admins')
        .select('id, auth_user_id, role')
        .eq('auth_user_id', authUser.id)
        .single();

    if (!adminData) return null;

    // 4. Check role whitelist
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(adminData.role as AdminRole)) return null;
    }

    return adminData as VerifiedAdmin;
}
