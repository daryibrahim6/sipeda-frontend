/**
 * lib/admin-api.ts — Admin-only Supabase API Layer
 * Semua fungsi ini memerlukan sesi admin yang terautentikasi.
 */

import { supabase } from './supabase';
import type { Schedule } from './types';

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminSchedulePayload = {
    lokasi_id: number;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    kuota: number;
    deskripsi?: string;
    status: 'aktif' | 'penuh' | 'dibatalkan' | 'selesai';
};

export type AdminRegistrasi = {
    id: number;
    kode_registrasi: string;
    jadwal_id: number;
    nama: string;
    email: string | null;
    telepon: string;
    golongan_darah: string;
    riwayat_donor: boolean;
    status: 'pending' | 'confirmed' | 'hadir' | 'tidak_hadir' | 'dibatalkan';
    created_at: string;
    jadwal: { tanggal: string; lokasi: { nama_lokasi: string } };
};

export type AdminStokRow = {
    id: number;
    lokasi_id: number;
    komponen_id: number;
    golongan_darah: string;
    jumlah: number;
    batas_kritis: number;
    status: 'normal' | 'kritis' | 'kosong';
    komponen: { kode: string; nama: string };
    lokasi: { nama_lokasi: string };
};

// ─── Jadwal CRUD ─────────────────────────────────────────────────────────────

/** Ambil SEMUA jadwal (semua status, semua tanggal) untuk admin */
export async function getAdminSchedules(opts?: {
    page?: number; perPage?: number; status?: string;
}): Promise<{ data: Schedule[]; total: number }> {
    const { page = 1, perPage = 20, status } = opts ?? {};
    const from = (page - 1) * perPage;

    let query = supabase
        .from('jadwal_donor')
        .select(`
      id, lokasi_id, tanggal, waktu_mulai, waktu_selesai,
      kuota, sisa_kuota, deskripsi, status,
      lokasi:lokasi_donor (id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng)
    `, { count: 'exact' })
        .order('tanggal', { ascending: false })
        .order('waktu_mulai')
        .range(from, from + perPage - 1);

    if (status && status !== 'semua') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data ?? []) as unknown as Schedule[], total: count ?? 0 };
}

export async function createSchedule(payload: AdminSchedulePayload): Promise<Schedule> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Tidak terautentikasi');

    const { data: admin, error: adminErr } = await supabase
        .from('admins').select('id').eq('auth_user_id', user.id).single();

    // SECURITY: Jangan fallback ke ID apapun — kalau bukan admin, tolak.
    if (adminErr || !admin) throw new Error('Akun ini tidak terdaftar sebagai admin.');

    const { data, error } = await supabase
        .from('jadwal_donor')
        .insert({ ...payload, sisa_kuota: payload.kuota, created_by: admin.id })
        .select(`
      id, lokasi_id, tanggal, waktu_mulai, waktu_selesai, kuota, sisa_kuota, deskripsi, status,
      lokasi:lokasi_donor (id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng)
    `)
        .single();

    if (error) throw error;
    return data as unknown as Schedule;
}

export async function updateSchedule(
    id: number,
    payload: Partial<AdminSchedulePayload>,
): Promise<Schedule> {
    const { data, error } = await supabase
        .from('jadwal_donor')
        .update(payload)
        .eq('id', id)
        .select(`
      id, lokasi_id, tanggal, waktu_mulai, waktu_selesai, kuota, sisa_kuota, deskripsi, status,
      lokasi:lokasi_donor (id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng)
    `)
        .single();

    if (error) throw error;
    return data as unknown as Schedule;
}

export async function deleteSchedule(id: number): Promise<void> {
    const { error } = await supabase.from('jadwal_donor').delete().eq('id', id);
    if (error) throw error;
}

// ─── Registrasi ───────────────────────────────────────────────────────────────

export async function getAdminRegistrasi(opts?: {
    page?: number; perPage?: number; search?: string; status?: string;
}): Promise<{ data: AdminRegistrasi[]; total: number }> {
    const { page = 1, perPage = 10, search = '', status } = opts ?? {};
    const from = (page - 1) * perPage;

    let query = supabase
        .from('registrasi_donor')
        .select(`
      id, kode_registrasi, jadwal_id, nama, email, telepon,
      golongan_darah, riwayat_donor, status, created_at,
      jadwal:jadwal_donor (tanggal, lokasi:lokasi_donor (nama_lokasi))
    `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1);

    if (status && status !== 'semua') query = query.eq('status', status);
    if (search) {
        query = query.or(
            `nama.ilike.%${search}%,kode_registrasi.ilike.%${search}%,telepon.ilike.%${search}%`
        );
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as unknown as AdminRegistrasi[]) ?? [], total: count ?? 0 };
}

export async function updateRegistrasiStatus(
    id: number,
    status: AdminRegistrasi['status'],
): Promise<void> {
    const { error } = await supabase.from('registrasi_donor').update({ status }).eq('id', id);
    if (error) throw error;
}

// ─── Stok Darah ───────────────────────────────────────────────────────────────

export async function getAdminStok(lokasiId?: number): Promise<AdminStokRow[]> {
    let query = supabase
        .from('stok_darah')
        .select(`
      id, lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, status,
      komponen:komponen_darah (kode, nama),
      lokasi:lokasi_donor (nama_lokasi)
    `)
        .order('lokasi_id')
        .order('komponen_id')
        .order('golongan_darah');

    if (lokasiId) query = query.eq('lokasi_id', lokasiId);

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as AdminStokRow[]) ?? [];
}

export async function updateStokDarah(id: number, jumlah: number): Promise<void> {
    const { error } = await supabase.from('stok_darah').update({ jumlah }).eq('id', id);
    if (error) throw error;
}

// ─── Artikel CRUD ─────────────────────────────────────────────────────────────

export type AdminArtikel = {
    id: number;
    judul: string;
    slug: string;
    excerpt: string | null;
    konten: string;
    penulis: string;
    gambar: string | null;
    unggulan: boolean;
    tampilkan_beranda: boolean;
    status: 'draft' | 'published' | 'archived';
    views: number;
    published_at: string | null;
    created_at: string;
    kategori: { id: number; nama: string; slug: string };
};

export type AdminArtikelPayload = {
    judul: string;
    slug: string;
    excerpt?: string;
    konten: string;
    penulis: string;
    kategori_id: number;
    unggulan?: boolean;
    tampilkan_beranda?: boolean;
    status: 'draft' | 'published' | 'archived';
};

export async function getAdminArtikel(opts?: {
    page?: number; perPage?: number; search?: string; status?: string;
}): Promise<{ data: AdminArtikel[]; total: number }> {
    const { page = 1, perPage = 10, search = '', status } = opts ?? {};
    const from = (page - 1) * perPage;

    let query = supabase
        .from('artikel')
        .select('id, judul, slug, excerpt, konten, penulis, gambar, unggulan, tampilkan_beranda, status, views, published_at, created_at, kategori:kategori_artikel(id, nama, slug)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1);

    if (status && status !== 'semua') query = query.eq('status', status);
    if (search) query = query.ilike('judul', `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as unknown as AdminArtikel[]) ?? [], total: count ?? 0 };
}

export async function createArtikel(payload: AdminArtikelPayload): Promise<AdminArtikel> {
    const { data, error } = await supabase
        .from('artikel')
        .insert({
            ...payload,
            published_at: payload.status === 'published' ? new Date().toISOString() : null,
        })
        .select('id, judul, slug, excerpt, konten, penulis, gambar, unggulan, tampilkan_beranda, status, views, published_at, created_at, kategori:kategori_artikel(id, nama, slug)')
        .single();
    if (error) throw error;
    return data as unknown as AdminArtikel;
}

export async function updateArtikel(id: number, payload: Partial<AdminArtikelPayload>): Promise<AdminArtikel> {
    const updates: Record<string, unknown> = { ...payload };
    if (payload.status === 'published') updates.published_at = new Date().toISOString();
    const { data, error } = await supabase
        .from('artikel')
        .update(updates)
        .eq('id', id)
        .select('id, judul, slug, excerpt, konten, penulis, gambar, unggulan, tampilkan_beranda, status, views, published_at, created_at, kategori:kategori_artikel(id, nama, slug)')
        .single();
    if (error) throw error;
    return data as unknown as AdminArtikel;
}

export async function deleteArtikel(id: number): Promise<void> {
    const { error } = await supabase.from('artikel').delete().eq('id', id);
    if (error) throw error;
}

export async function getKategoriArtikel(): Promise<{ id: number; nama: string; slug: string }[]> {
    const { data, error } = await supabase
        .from('kategori_artikel')
        .select('id, nama, slug')
        .order('nama');
    if (error) throw error;
    return data ?? [];
}

// ─── Pencatatan Donor (Admin) ─────────────────────────────────────────────────

import type { PencatatanDonor, RekapPencatatan } from './types';

/**
 * Ambil rekap pencatatan per jadwal (dari view v_rekap_pencatatan).
 */
export async function getRekapPencatatan(): Promise<RekapPencatatan[]> {
    const { data, error } = await supabase
        .from('v_rekap_pencatatan')
        .select('*')
        .order('tanggal', { ascending: false });
    if (error) throw error;
    return (data ?? []) as RekapPencatatan[];
}

/**
 * Ambil detail pencatatan untuk jadwal tertentu (admin view).
 */
export async function getAdminPencatatan(jadwal_id: number): Promise<PencatatanDonor[]> {
    const { data, error } = await supabase
        .from('pencatatan_donor')
        .select('*, jadwal:jadwal_donor(tanggal, waktu_mulai, waktu_selesai, lokasi:lokasi_donor(nama_lokasi))')
        .eq('jadwal_id', jadwal_id)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as PencatatanDonor[];
}
