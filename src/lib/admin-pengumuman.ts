import { createClient } from '@/lib/supabase-browser';
import { sanitizeSearchInput } from './utils';

const supabase = createClient();

export type AdminAnnouncement = {
    id: number;
    judul: string;
    isi: string;
    tipe: 'info' | 'sukses' | 'peringatan' | 'darurat';
    link: string | null;
    link_teks: string | null;
    aktif: boolean;
    created_at: string;
};

export type AdminAnnouncementPayload = {
    judul: string;
    isi: string;
    tipe: 'info' | 'sukses' | 'peringatan' | 'darurat';
    link?: string;
    link_teks?: string;
    aktif: boolean;
};

const ANNOUNCEMENT_SELECT = 'id, judul, isi, tipe, link, link_teks, aktif, created_at';

export async function getAdminAnnouncements(opts?: {
    page?: number; perPage?: number; search?: string; tipe?: string;
}): Promise<{ data: AdminAnnouncement[]; total: number }> {
    const { page = 1, perPage = 10, search = '', tipe } = opts ?? {};
    const from = (page - 1) * perPage;

    let query = supabase
        .from('pengumuman')
        .select(ANNOUNCEMENT_SELECT, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, from + perPage - 1);

    if (tipe && tipe !== 'semua') query = query.eq('tipe', tipe);
    if (search) {
        const s = sanitizeSearchInput(search);
        if (s) query = query.ilike('judul', `%${s}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: (data as unknown as AdminAnnouncement[]) ?? [], total: count ?? 0 };
}

export async function createAnnouncement(payload: AdminAnnouncementPayload): Promise<AdminAnnouncement> {
    const { data, error } = await supabase
        .from('pengumuman')
        .insert(payload)
        .select(ANNOUNCEMENT_SELECT)
        .single();
    if (error) throw error;
    return data as unknown as AdminAnnouncement;
}

export async function updateAnnouncement(id: number, payload: Partial<AdminAnnouncementPayload>): Promise<AdminAnnouncement> {
    const { data, error } = await supabase
        .from('pengumuman')
        .update(payload)
        .eq('id', id)
        .select(ANNOUNCEMENT_SELECT)
        .single();
    if (error) throw error;
    return data as unknown as AdminAnnouncement;
}

export async function deleteAnnouncement(id: number): Promise<void> {
    const { error } = await supabase.from('pengumuman').delete().eq('id', id);
    if (error) throw error;
}
