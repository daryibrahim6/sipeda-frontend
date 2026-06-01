import { createClient } from '@/lib/supabase-browser';
import { sanitizeSearchInput } from './utils';

const supabase = createClient();

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
        const s = sanitizeSearchInput(search);
        if (s) {
            query = query.or(
                `nama.ilike.%${s}%,kode_registrasi.ilike.%${s}%,telepon.ilike.%${s}%`
            );
        }
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
