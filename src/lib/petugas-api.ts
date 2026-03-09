/**
 * lib/petugas-api.ts — API layer untuk Petugas Lapangan
 * Dipakai oleh halaman /petugas untuk pencatatan kehadiran pendonor.
 */

import { supabase } from './supabase';
import type { Schedule, PencatatanDonor, StatusDonor, BloodType } from './types';

// ─── Jadwal hari ini ──────────────────────────────────────────────────────────

/**
 * Ambil jadwal yang tanggalnya HARI INI dan status aktif/selesai.
 * Petugas lapangan hanya bisa mencatat di jadwal hari ini.
 */
export async function getTodaySchedules(): Promise<Schedule[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from('jadwal_donor')
        .select('*, lokasi:lokasi_donor(id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng)')
        .eq('tanggal', today)
        .in('status', ['aktif', 'selesai'])
        .order('waktu_mulai', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as Schedule[];
}

// ─── Pencatatan CRUD ──────────────────────────────────────────────────────────

export type CreatePencatatanPayload = {
    jadwal_id: number;
    nama_pendonor: string;
    golongan_darah: BloodType | 'Tidak Tahu';
    status_donor: StatusDonor;
    catatan?: string;
};

/**
 * Catat kehadiran pendonor.
 * `dicatat_oleh` diisi otomatis dari session admin/petugas.
 */
export async function createPencatatan(
    payload: CreatePencatatanPayload,
    adminId: number,
): Promise<PencatatanDonor> {
    const { data, error } = await supabase
        .from('pencatatan_donor')
        .insert({
            ...payload,
            catatan: payload.catatan || null,
            dicatat_oleh: adminId,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as PencatatanDonor;
}

/**
 * Ambil semua pencatatan untuk jadwal tertentu.
 * Diurutkan dari yang terbaru dicatat.
 */
export async function getPencatatanByJadwal(jadwal_id: number): Promise<PencatatanDonor[]> {
    const { data, error } = await supabase
        .from('pencatatan_donor')
        .select('*')
        .eq('jadwal_id', jadwal_id)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as PencatatanDonor[];
}

/**
 * Hapus pencatatan (hanya untuk koreksi kesalahan input).
 */
export async function deletePencatatan(id: number): Promise<void> {
    const { error } = await supabase
        .from('pencatatan_donor')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
}

// ─── B3: Update pencatatan (edit) ─────────────────────────────────────────────

export type UpdatePencatatanPayload = {
    nama_pendonor?: string;
    golongan_darah?: BloodType | 'Tidak Tahu';
    status_donor?: StatusDonor;
    catatan?: string;
};

/**
 * Update pencatatan yang sudah dicatat (untuk koreksi).
 * Menyimpan updated_at otomatis.
 */
export async function updatePencatatan(
    id: number,
    payload: UpdatePencatatanPayload,
): Promise<PencatatanDonor> {
    const { data, error } = await supabase
        .from('pencatatan_donor')
        .update({
            ...payload,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data as PencatatanDonor;
}

// ─── B4: Lookup registrasi by kode ────────────────────────────────────────────

export type RegistrasiLookup = {
    id: number;
    kode_registrasi: string;
    nama: string;
    nik: string | null;
    telepon: string;
    golongan_darah: string;
    status_kehadiran: string | null;
};

/**
 * Cari data registrasi berdasarkan kode.
 * Dipakai oleh petugas untuk verifikasi kode saat pendonor datang.
 */
export async function lookupRegistrasiByKode(kode: string): Promise<RegistrasiLookup | null> {
    const { data, error } = await supabase
        .from('registrasi_donor')
        .select('id, kode_registrasi, nama, nik, telepon, golongan_darah, status_kehadiran')
        .eq('kode_registrasi', kode.trim().toUpperCase())
        .single();

    if (error) return null;
    return data as RegistrasiLookup;
}

/**
 * Tandai registrasi sebagai "hadir" setelah petugas memverifikasi.
 */
export async function markRegistrasiHadir(registrasiId: number): Promise<void> {
    const { error } = await supabase
        .from('registrasi_donor')
        .update({ status_kehadiran: 'hadir' })
        .eq('id', registrasiId);

    if (error) throw new Error(error.message);
}
