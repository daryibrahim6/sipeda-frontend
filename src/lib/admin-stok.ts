import { createClient } from '@/lib/supabase-browser';

const supabase = createClient();

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
