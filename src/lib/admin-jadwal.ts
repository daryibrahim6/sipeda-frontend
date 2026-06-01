import { createClient } from '@/lib/supabase-browser';
import type { Schedule } from './types';

const supabase = createClient();

export type AdminSchedulePayload = {
    lokasi_id: number;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    kuota: number;
    deskripsi?: string;
    status: 'aktif' | 'penuh' | 'dibatalkan' | 'selesai';
};

/** Fetch jadwal untuk dashboard admin (upcoming N entries) */
export async function getUpcomingSchedules(limit = 5): Promise<Schedule[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('jadwal_donor')
    .select(`
      id, lokasi_id, tanggal, waktu_mulai, waktu_selesai,
      kuota, sisa_kuota, deskripsi, status,
      lokasi:lokasi_donor (
        id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng
      )
    `)
    .eq('status', 'aktif')
    .gte('tanggal', today)
    .order('tanggal')
    .order('waktu_mulai')
    .limit(limit);

  if (error) return [];
  return (data ?? []) as unknown as Schedule[];
}

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
