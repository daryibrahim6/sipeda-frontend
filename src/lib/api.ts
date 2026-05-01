/**
 * lib/api.ts — Supabase API Layer
 *
 * PENTING: Semua type didefinisikan di lib/types.ts.
 * File ini HANYA berisi fungsi-fungsi query ke Supabase.
 */

import { supabase } from './supabase';
import { fireAndForget } from './utils';
import type {
  Location,
  Schedule,
  Article,
  Announcement,
  SiteStats,
  BloodStockItem,
} from './types';

// ─── Re-export types yang sering dipakai ─────────────────────────────────────
export type { Location, Schedule, Article, Announcement, SiteStats };

// ─── BloodStock public (alias dari BloodStockItem) ────────────────────────────
export type BloodStock = BloodStockItem;

// ─── Stats homepage ───────────────────────────────────────────────────────────

export async function getStats(): Promise<SiteStats> {
  const { data, error } = await supabase
    .from('v_stats')
    .select('*')
    .single();

  if (error) throw error;
  return {
    total_stok: Number(data?.total_stok ?? 0),
    lokasi_aktif: Number(data?.lokasi_aktif ?? 0),
    jadwal_aktif: Number(data?.jadwal_aktif ?? 0),
    total_stok_kritis: Number(data?.total_stok_kritis ?? 0),
  };
}

// ─── Dashboard Stats — dipindahkan ke admin-api.ts (hanya dipakai admin) ─────
// Re-export untuk backward compatibility
export { getDashboardStats, getUpcomingSchedules } from './admin-api';

// ─── Lokasi Donor ─────────────────────────────────────────────────────────────

export async function getLocations(): Promise<Location[]> {
  const { data: locations, error } = await supabase
    .from('lokasi_donor')
    .select('*')
    .eq('aktif', true)
    .order('nama_lokasi');

  if (error) throw error;

  // Fetch semua stok sekaligus (bukan N+1)
  const lokasiIds = locations.map(l => l.id);
  const { data: stocks } = lokasiIds.length > 0
    ? await supabase
      .from('stok_darah')
      .select('lokasi_id, golongan_darah, jumlah, status')
      .in('lokasi_id', lokasiIds)
    : { data: [] };

  return locations.map(loc => ({
    ...loc,
    koordinat_lat: Number(loc.koordinat_lat),
    koordinat_lng: Number(loc.koordinat_lng),
    stok_ringkas: stocks
      ?.filter(s => s.lokasi_id === loc.id)
      .map(s => ({ golongan_darah: s.golongan_darah, total: s.jumlah, status: s.status })) ?? [],
  })) as Location[];
}

export async function getLocationById(id: number): Promise<Location | null> {
  const { data, error } = await supabase
    .from('lokasi_donor')
    .select('*')
    .eq('id', id)
    .eq('aktif', true)
    .single();

  if (error) return null;
  return {
    ...data,
    koordinat_lat: Number(data.koordinat_lat),
    koordinat_lng: Number(data.koordinat_lng),
  } as Location;
}

// ─── Jadwal Donor ─────────────────────────────────────────────────────────────

export async function getSchedules(month?: number, year?: number): Promise<Schedule[]> {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  const start = `${y}-${String(m).padStart(2, '0')}-01`;
  const end = new Date(y, m, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('jadwal_donor')
    .select(`
      id, lokasi_id, tanggal, waktu_mulai, waktu_selesai,
      kuota, sisa_kuota, deskripsi, status,
      lokasi:lokasi_donor (
        id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng
      )
    `)
    .gte('tanggal', start)
    .lte('tanggal', end)
    .neq('status', 'dibatalkan')
    .order('tanggal')
    .order('waktu_mulai');

  if (error) throw error;
  return (data ?? []) as unknown as Schedule[];
}

/** FIX: tersedia sebagai getScheduleById DAN getSchedule (alias) */
export async function getScheduleById(id: number): Promise<Schedule | null> {
  const { data, error } = await supabase
    .from('jadwal_donor')
    .select(`
      id, lokasi_id, tanggal, waktu_mulai, waktu_selesai,
      kuota, sisa_kuota, deskripsi, status,
      lokasi:lokasi_donor (
        id, nama_lokasi, alamat, kecamatan, koordinat_lat, koordinat_lng
      )
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as unknown as Schedule;
}

/** Alias untuk kompatibilitas import lama */
export const getSchedule = getScheduleById;

// ─── Artikel ──────────────────────────────────────────────────────────────────

export async function getArticles(
  page = 1,
  perPage = 9,
  kategoriSlug?: string,
): Promise<{ data: Article[]; total: number; totalPages: number }> {
  let query = supabase
    .from('artikel')
    .select(`
      id, judul, slug, excerpt, gambar, gambar_alt,
      penulis, published_at, views, unggulan, kategori_id,
      kategori:kategori_artikel (nama, slug)
    `, { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (kategoriSlug) {
    const { data: kat } = await supabase
      .from('kategori_artikel')
      .select('id')
      .eq('slug', kategoriSlug)
      .single();
    if (kat) query = query.eq('kategori_id', kat.id);
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const articles: Article[] = (data ?? []).map(row => {
    const r = row as Record<string, unknown>;
    const kat = r.kategori as { nama?: string } | null;
    return {
      id: r.id as number,
      judul: r.judul as string,
      slug: r.slug as string,
      excerpt: (r.excerpt as string | null) ?? null,
      gambar: (r.gambar as string | null) ?? null,
      gambar_alt: (r.gambar_alt as string | null) ?? null,
      penulis: r.penulis as string,
      published_at: (r.published_at as string | null) ?? null,
      views: (r.views as number) ?? 0,
      unggulan: (r.unggulan as boolean) ?? false,
      kategori_id: (r.kategori_id as number) ?? 0,
      kategori_nama: kat?.nama ?? '',
    };
  });

  const total = count ?? 0;
  const totalPages = Math.ceil(total / perPage);
  return { data: articles, total, totalPages };
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('artikel')
    .select(`
      id, judul, slug, excerpt, konten, gambar, gambar_alt,
      penulis, published_at, views, unggulan, kategori_id,
      kategori:kategori_artikel (nama, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) return null;

  // FIX: Atomic increment views via RPC (mencegah race condition)
  fireAndForget(
    supabase.rpc('increment_article_views', { article_id: data.id as number }),
    'increment article views',
  );

  const r = data as Record<string, unknown>;
  const kat = r.kategori as { nama?: string } | null;
  return {
    id: r.id as number,
    judul: r.judul as string,
    slug: r.slug as string,
    excerpt: (r.excerpt as string | null) ?? null,
    konten: (r.konten as string) ?? '',
    gambar: (r.gambar as string | null) ?? null,
    gambar_alt: (r.gambar_alt as string | null) ?? null,
    penulis: r.penulis as string,
    published_at: (r.published_at as string | null) ?? null,
    views: (r.views as number) ?? 0,
    unggulan: (r.unggulan as boolean) ?? false,
    kategori_id: (r.kategori_id as number) ?? 0,
    kategori_nama: kat?.nama ?? '',
  };
}

// ─── Pengumuman ───────────────────────────────────────────────────────────────

export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('v_pengumuman_aktif')
    .select('id, judul, isi, tipe, link, link_teks');

  if (error) return [];
  return (data ?? []) as Announcement[];
}

// ─── Stok Darah ──────────────────────────────────────────────────────────────

/**
 * FIX: bulk fetch — jika lokasiId tidak diberikan, fetch semua sekaligus (bukan N+1).
 */
export async function getBloodStock(lokasiId?: number): Promise<BloodStock[]> {
  let query = supabase
    .from('stok_darah')
    .select(`
      id, lokasi_id, golongan_darah, jumlah, status, updated_at,
      batas_kritis,
      komponen:komponen_darah (kode, nama)
    `)
    .order('golongan_darah');

  if (lokasiId) query = query.eq('lokasi_id', lokasiId);

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(s => {
    const r = s as Record<string, unknown>;
    const kom = r.komponen as { kode?: string; nama?: string } | null;
    return {
      id: r.id as number,
      lokasi_id: r.lokasi_id as number,
      komponen_id: 0,
      komponen_kode: kom?.kode ?? '',
      komponen_nama: kom?.nama ?? '',
      golongan_darah: r.golongan_darah as BloodStock['golongan_darah'],
      jumlah: r.jumlah as number,
      jumlah_kritis: r.batas_kritis as number,
      status: r.status as BloodStock['status'],
      terakhir_update: r.updated_at as string,
    };
  });
}

/**
 * FIX: Bulk fetch stok untuk banyak lokasi sekaligus — menghapus N+1 di stok-darah page.
 */
export async function getBloodStockByMultipleLocations(
  lokasiIds: number[],
): Promise<Record<number, BloodStock[]>> {
  if (lokasiIds.length === 0) return {};

  const { data, error } = await supabase
    .from('stok_darah')
    .select(`
      id, lokasi_id, golongan_darah, jumlah, status, updated_at,
      batas_kritis,
      komponen:komponen_darah (kode, nama)
    `)
    .in('lokasi_id', lokasiIds)
    .order('golongan_darah');

  if (error) return {};

  const result: Record<number, BloodStock[]> = {};
  for (const s of data ?? []) {
    const r = s as Record<string, unknown>;
    const kom = r.komponen as { kode?: string; nama?: string } | null;
    const item: BloodStock = {
      id: r.id as number,
      lokasi_id: r.lokasi_id as number,
      komponen_id: 0,
      komponen_kode: kom?.kode ?? '',
      komponen_nama: kom?.nama ?? '',
      golongan_darah: r.golongan_darah as BloodStock['golongan_darah'],
      jumlah: r.jumlah as number,
      jumlah_kritis: r.batas_kritis as number,
      status: r.status as BloodStock['status'],
      terakhir_update: r.updated_at as string,
    };
    const lid = r.lokasi_id as number;
    if (!result[lid]) result[lid] = [];
    result[lid].push(item);
  }
  return result;
}

export async function getBloodStockSummary(): Promise<{
  golongan_darah: string;
  total: number;
  status: 'normal' | 'kritis' | 'kosong';
}[]> {
  const { data, error } = await supabase
    .from('stok_darah')
    .select('golongan_darah, jumlah, status')
    .order('golongan_darah');

  if (error) throw error;

  const agg: Record<string, { total: number; hasKritis: boolean; hasKosong: boolean }> = {};
  for (const s of data ?? []) {
    if (!agg[s.golongan_darah]) {
      agg[s.golongan_darah] = { total: 0, hasKritis: false, hasKosong: false };
    }
    agg[s.golongan_darah].total += s.jumlah;
    if (s.status === 'kritis') agg[s.golongan_darah].hasKritis = true;
    if (s.status === 'kosong') agg[s.golongan_darah].hasKosong = true;
  }

  return Object.entries(agg).map(([golongan_darah, v]) => ({
    golongan_darah,
    total: v.total,
    status: v.hasKosong ? 'kosong' : v.hasKritis ? 'kritis' : 'normal',
  }));
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export async function getFAQ(): Promise<{
  id: number; pertanyaan: string; jawaban: string; kategori: string;
}[]> {
  const { data, error } = await supabase
    .from('faq')
    .select('id, pertanyaan, jawaban, kategori')
    .eq('aktif', true)
    .order('kategori')
    .order('urutan');

  if (error) return [];
  return data ?? [];
}

// ─── Testimonial ──────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<{
  id: number; nama: string; jabatan: string | null;
  isi: string; rating: number; foto: string | null;
}[]> {
  const { data, error } = await supabase
    .from('testimonial')
    .select('id, nama, jabatan, isi, rating, foto')
    .eq('aktif', true)
    .order('urutan');

  if (error) return [];
  return data ?? [];
}

// ─── Registrasi ──────────────────────────────────────────────────────────────

export async function createRegistrasi(payload: {
  jadwal_id: number;
  nama: string;
  nik?: string;
  email?: string;
  telepon: string;
  golongan_darah: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
  riwayat_donor: boolean;
}): Promise<{ kode_registrasi: string }> {
  // Kode registrasi di-generate oleh database via DEFAULT (sequence).
  // Tidak perlu mengirim kode_registrasi dari client.
  const { data: reg, error } = await supabase
    .from('registrasi_donor')
    .insert(payload)
    .select('kode_registrasi')
    .single();

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation: telepon + jadwal_id
      if (error.message?.includes('telepon') || error.message?.includes('jadwal')) {
        throw new Error('Nomor WhatsApp ini sudah terdaftar untuk jadwal tersebut.');
      }
    }
    throw new Error('Gagal mendaftar. Silakan coba lagi.');
  }

  return { kode_registrasi: (reg as { kode_registrasi: string }).kode_registrasi };
}

/** Alias untuk kompatibilitas (RegisterForm menggunakan registerDonor) */
export const registerDonor = createRegistrasi;

// ─── Registrasi Status (untuk tracker page) ───────────────────────────────────
// FIX: Pakai RPC function SECURITY DEFINER — anon tidak lagi bisa SELECT langsung.
// Database function hanya return data yang cocok dengan kode, tanpa expose PII lain.

export async function getRegistrasiByKode(kode: string): Promise<{
  kode_registrasi: string;
  nama: string;
  status: string;
  jadwal: {
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: { nama_lokasi: string; alamat: string; kecamatan: string };
  };
} | null> {
  const { data, error } = await supabase.rpc('lookup_registrasi_by_kode', {
    p_kode: kode,
  });

  if (error || !data) return null;
  return data as {
    kode_registrasi: string;
    nama: string;
    status: string;
    jadwal: {
      tanggal: string;
      waktu_mulai: string;
      waktu_selesai: string;
      lokasi: { nama_lokasi: string; alamat: string; kecamatan: string };
    };
  };
}

// ─── Donor History: Lookup by telepon + kode verifikasi ───────────────────────

export type DonorHistoryItem = {
  id: number;
  kode_registrasi: string;
  nama: string;
  telepon: string;
  golongan_darah: string;
  status: string;
  status_kehadiran: string | null;
  created_at: string;
  jadwal: {
    id: number;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    status: string;
    lokasi: { nama_lokasi: string; kecamatan: string };
  } | null;
};

export type DonorHistoryResult = {
  nama: string;
  telepon: string;
  golongan_darah: string;
  registrasi: DonorHistoryItem[];
  total_donor_berhasil: number;
};

// FIX: Pakai RPC function SECURITY DEFINER — semua 3 query (verify + fetch + count)
// sekarang dieksekusi di dalam satu database function yang aman.
// Anon user tidak bisa enumerate data orang lain.
export async function lookupDonorHistory(
  telepon: string,
  kode: string,
): Promise<DonorHistoryResult | null> {
  const { data, error } = await supabase.rpc('lookup_donor_history', {
    p_telepon: telepon,
    p_kode: kode,
  });

  if (error || !data) return null;

  const result = data as {
    nama: string;
    telepon: string;
    golongan_darah: string;
    registrasi: DonorHistoryItem[];
    total_donor_berhasil: number;
  };

  return {
    nama: result.nama,
    telepon: result.telepon,
    golongan_darah: result.golongan_darah,
    registrasi: result.registrasi ?? [],
    total_donor_berhasil: result.total_donor_berhasil ?? 0,
  };
}