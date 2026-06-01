import { createClient } from '@/lib/supabase-browser';
import type { PencatatanDonor, RekapPencatatan } from './types';

const supabase = createClient();

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
