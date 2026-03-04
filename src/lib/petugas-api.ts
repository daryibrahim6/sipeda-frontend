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
