import { createClient } from '@/lib/supabase-browser';
import { sanitizeSearchInput } from './utils';
import type { Location, LocationType } from './types';

const supabase = createClient();

export type AdminLocationPayload = {
    nama_lokasi: string;
    tipe: LocationType;
    alamat: string;
    kecamatan: string;
    kota: string;
    koordinat_lat: number;
    koordinat_lng: number;
    kontak?: string;
    email?: string;
    penanggung_jawab?: string;
    deskripsi?: string;
    aktif: boolean;
};

const LOKASI_SELECT = `
  id, kode_lokasi, nama_lokasi, tipe, alamat, kecamatan, kota,
  koordinat_lat, koordinat_lng, kontak, email, penanggung_jawab,
  foto, deskripsi, jam_operasional, fasilitas, aktif
`;

export async function getAdminLocations(opts?: {
    page?: number; perPage?: number; search?: string; status?: string;
}): Promise<{ data: Location[]; total: number }> {
    const { page = 1, perPage = 20, search = '', status } = opts ?? {};
    const from = (page - 1) * perPage;

    let query = supabase
        .from('lokasi_donor')
        .select(LOKASI_SELECT, { count: 'exact' })
        .order('nama_lokasi')
        .range(from, from + perPage - 1);

    if (status === 'aktif') query = query.eq('aktif', true);
    else if (status === 'nonaktif') query = query.eq('aktif', false);

    if (search) {
        const s = sanitizeSearchInput(search);
        if (s) {
            query = query.or(
                `nama_lokasi.ilike.%${s}%,alamat.ilike.%${s}%,kecamatan.ilike.%${s}%`
            );
        }
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const locations = (data ?? []).map(loc => ({
        ...loc,
        koordinat_lat: Number(loc.koordinat_lat),
        koordinat_lng: Number(loc.koordinat_lng),
    })) as Location[];

    return { data: locations, total: count ?? 0 };
}

export async function createLocation(payload: AdminLocationPayload): Promise<Location> {
    const kode = `LOK-${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabase
        .from('lokasi_donor')
        .insert({ ...payload, kode_lokasi: kode })
        .select(LOKASI_SELECT)
        .single();

    if (error) throw error;
    return {
        ...data,
        koordinat_lat: Number(data.koordinat_lat),
        koordinat_lng: Number(data.koordinat_lng),
    } as Location;
}

export async function updateLocation(
    id: number,
    payload: Partial<AdminLocationPayload>,
): Promise<Location> {
    const { data, error } = await supabase
        .from('lokasi_donor')
        .update(payload)
        .eq('id', id)
        .select(LOKASI_SELECT)
        .single();

    if (error) throw error;
    return {
        ...data,
        koordinat_lat: Number(data.koordinat_lat),
        koordinat_lng: Number(data.koordinat_lng),
    } as Location;
}

export async function toggleLocationStatus(id: number, aktif: boolean): Promise<void> {
    const { error } = await supabase.from('lokasi_donor').update({ aktif }).eq('id', id);
    if (error) throw error;
}
