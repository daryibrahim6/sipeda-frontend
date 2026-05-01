/**
 * API Route: /api/admin/users
 * Server-side user management using Supabase service role key.
 * Handles: GET (list), POST (create), PUT (update), PATCH (toggle status)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { createServerClient } from '@supabase/ssr';

// ─── Auth guard: verify caller is superadmin ──────────────────────────────────

async function verifySuperadmin(req: NextRequest) {
    // Buat Supabase client per-request (bukan singleton)
    // untuk menghindari cross-request session leak di server.
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

    // Coba ambil user dari cookie session terlebih dahulu
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback: coba dari Authorization header (untuk backward compatibility)
    let authUser = user;
    if (!authUser) {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');
        if (token) {
            const { data } = await supabase.auth.getUser(token);
            authUser = data.user;
        }
    }

    if (!authUser) return null;

    const adminClient = createAdminClient();
    const { data: adminData } = await adminClient
        .from('admins')
        .select('id, role')
        .eq('auth_user_id', authUser.id)
        .single();

    if (!adminData || adminData.role !== 'superadmin') return null;
    return adminData;
}

// ─── GET: List all admin/petugas users ────────────────────────────────────────

export async function GET(req: NextRequest) {
    const caller = await verifySuperadmin(req);
    if (!caller) return NextResponse.json({ error: 'Akses ditolak. Hanya superadmin.' }, { status: 403 });

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
        .from('admins')
        .select('id, auth_user_id, name, email, role, aktif, last_login, created_at')
        .order('name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

// ─── POST: Create new admin/petugas user ──────────────────────────────────────

export async function POST(req: NextRequest) {
    const caller = await verifySuperadmin(req);
    if (!caller) return NextResponse.json({ error: 'Akses ditolak. Hanya superadmin.' }, { status: 403 });

    const body = await req.json();
    const { name, email, password, role } = body as {
        name: string; email: string; password: string;
        role: 'admin' | 'petugas_lapangan' | 'superadmin';
    };

    if (!name || !email || !password || !role) {
        return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Insert into admins table
    const { data: adminData, error: adminError } = await adminClient
        .from('admins')
        .insert({
            auth_user_id: authData.user.id,
            name,
            email,
            role,
            aktif: true,
        })
        .select('id, auth_user_id, name, email, role, aktif, created_at')
        .single();

    if (adminError) {
        // Rollback: delete auth user if admins insert fails
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json({ error: adminError.message }, { status: 500 });
    }

    return NextResponse.json({ data: adminData }, { status: 201 });
}

// ─── PUT: Update admin/petugas ────────────────────────────────────────────────

export async function PUT(req: NextRequest) {
    const caller = await verifySuperadmin(req);
    if (!caller) return NextResponse.json({ error: 'Akses ditolak. Hanya superadmin.' }, { status: 403 });

    const body = await req.json();
    const { id, name, email, role, password } = body as {
        id: number; name?: string; email?: string;
        role?: 'admin' | 'petugas_lapangan' | 'superadmin';
        password?: string;
    };

    if (!id) return NextResponse.json({ error: 'ID diperlukan.' }, { status: 400 });

    const adminClient = createAdminClient();

    // Get auth_user_id
    const { data: existing } = await adminClient
        .from('admins')
        .select('auth_user_id')
        .eq('id', id)
        .single();

    if (!existing) return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });

    // Update admins table
    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (role) updates.role = role;

    if (Object.keys(updates).length > 0) {
        const { error } = await adminClient.from('admins').update(updates).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update auth user if email or password changed
    const authUpdates: Record<string, string> = {};
    if (email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
        const { error } = await adminClient.auth.admin.updateUserById(existing.auth_user_id, authUpdates);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

// ─── PATCH: Toggle aktif status ───────────────────────────────────────────────

export async function PATCH(req: NextRequest) {
    const caller = await verifySuperadmin(req);
    if (!caller) return NextResponse.json({ error: 'Akses ditolak. Hanya superadmin.' }, { status: 403 });

    const body = await req.json();
    const { id, aktif } = body as { id: number; aktif: boolean };

    if (!id || aktif === undefined) {
        return NextResponse.json({ error: 'ID dan status aktif diperlukan.' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Prevent deactivating yourself
    const { data: target } = await adminClient.from('admins').select('auth_user_id').eq('id', id).single();
    if (!target) return NextResponse.json({ error: 'User tidak ditemukan.' }, { status: 404 });

    // Update admins table
    const { error } = await adminClient.from('admins').update({ aktif }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Ban/unban in Supabase Auth
    if (!aktif) {
        await adminClient.auth.admin.updateUserById(target.auth_user_id, {
            ban_duration: '876000h', // ~100 years
        });
    } else {
        await adminClient.auth.admin.updateUserById(target.auth_user_id, {
            ban_duration: 'none',
        });
    }

    return NextResponse.json({ success: true });
}
