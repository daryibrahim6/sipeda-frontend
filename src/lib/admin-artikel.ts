import { createClient } from '@/lib/supabase-browser';
import { sanitizeSearchInput } from './utils';

const supabase = createClient();

export type AdminArtikel = {
    id: number;
    judul: string;
    slug: string;
    excerpt: string | null;
    konten: string;
    penulis: string;
    gambar: string | null;
    tampilkan_beranda: boolean;
    status: 'draft' | 'published' | 'archived';
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
    gambar?: string;
    kategori_id: number;
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
    if (search) {
        const s = sanitizeSearchInput(search);
        if (s) query = query.ilike('judul', `%${s}%`);
    }

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
        .select('id, judul, slug, excerpt, konten, penulis, gambar, tampilkan_beranda, status, published_at, created_at, kategori:kategori_artikel(id, nama, slug)')
        .single();
    if (error) throw error;
    return data as unknown as AdminArtikel;
}

export async function updateArtikel(id: number, payload: Partial<AdminArtikelPayload>): Promise<AdminArtikel> {
    const updates: Record<string, unknown> = { ...payload };
    if (payload.status === 'published') {
        const { data: existing } = await supabase
            .from('artikel')
            .select('published_at')
            .eq('id', id)
            .single();
        if (!existing?.published_at) {
            updates.published_at = new Date().toISOString();
        }
    }
    const { data, error } = await supabase
        .from('artikel')
        .update(updates)
        .eq('id', id)
        .select('id, judul, slug, excerpt, konten, penulis, gambar, tampilkan_beranda, status, published_at, created_at, kategori:kategori_artikel(id, nama, slug)')
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
