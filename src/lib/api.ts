/**
 * lib/api.ts — Supabase API Layer
 *
 * PENTING: Semua type didefinisikan di lib/types.ts.
 * File ini HANYA berisi fungsi-fungsi query ke Supabase.
 */

import { supabase } from './supabase';
import type {
  Location,
  Schedule,
  Article,
  SiteStats,
  BloodStockItem,
  Testimonial,
} from './types';

// ─── Re-export types yang sering dipakai ─────────────────────────────────────
export type { Location, Schedule, Article, SiteStats, Testimonial };

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

// ─── Cache untuk data jarang berubah ───────────────────────────────────────────

const cache = new Map<string, { data: unknown; expires: number }>();
function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return Promise.resolve(entry.data as T);
  }
  return fn().then(data => {
    cache.set(key, { data, expires: Date.now() + ttlMs });
    return data;
  });
}

// ─── Lokasi Donor ─────────────────────────────────────────────────────────────

export async function getLocations(): Promise<Location[]> {
  return withCache('getLocations', 120_000, async () => {
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
  });
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
      penulis, published_at, kategori_id,
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
      penulis, published_at, kategori_id,
      kategori:kategori_artikel (nama, slug)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) return null;

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
    kategori_id: (r.kategori_id as number) ?? 0,
    kategori_nama: kat?.nama ?? '',
  };
}

export async function getAllArticleSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('artikel')
    .select('slug')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  return (data ?? []).map(r => (r as { slug: string }).slug);
}

// ─── Testimonial ─────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  const { data, error } = await supabase
    .from('testimonial')
    .select('id, nama, foto, jabatan, isi, rating')
    .eq('aktif', true)
    .order('urutan', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ─── Stok Darah ──────────────────────────────────────────────────────────────

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
      id, lokasi_id, komponen_id, golongan_darah, jumlah, status, updated_at,
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
      komponen_id: r.komponen_id as number,
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
    .select('golongan_darah, jumlah, batas_kritis')
    .order('golongan_darah');

  if (error) throw error;

  const agg: Record<string, { total: number; sumBatas: number }> = {};
  for (const s of data ?? []) {
    if (!agg[s.golongan_darah]) {
      agg[s.golongan_darah] = { total: 0, sumBatas: 0 };
    }
    agg[s.golongan_darah].total += s.jumlah;
    agg[s.golongan_darah].sumBatas += s.batas_kritis;
  }

  return Object.entries(agg).map(([golongan_darah, v]) => ({
    golongan_darah,
    total: v.total,
    status:
      v.total === 0 ? 'kosong' :
      v.total < v.sumBatas * 0.3 ? 'kritis' :
      'normal',
  }));
}

// ─── Registrasi ──────────────────────────────────────────────────────────────
// FIX: Pakai anon key di client (hapus service_role).
// Insert tetap aman karena RLS membatasi per kolom.

export async function registerDonor(payload: {
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
  // Cek interval donor — minimal 56 hari sejak donor terakhir
  const { data: lastDonation } = await supabase
    .from('registrasi_donor')
    .select(`jadwal:jadwal_donor!inner(tanggal)`)
    .eq('telepon', payload.telepon)
    .eq('status_kehadiran', 'hadir')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lastDonation) {
    const jadwalArr = lastDonation.jadwal as { tanggal: string }[] | { tanggal: string } | null;
    const jadwal = Array.isArray(jadwalArr) ? jadwalArr[0] : jadwalArr;
    if (jadwal?.tanggal) {
      const lastDate = new Date(jadwal.tanggal);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 56) {
        throw new Error(
          `Jarak antar donor minimal 56 hari. Donor terakhir Anda ${diffDays} hari yang lalu (${jadwal.tanggal}). Silakan kembali pada waktu yang ditentukan.`
        );
      }
    }
  }

  // Kode registrasi di-generate oleh database via DEFAULT (sequence).
  // Tidak perlu mengirim kode_registrasi dari client.
  const { data: reg, error } = await supabase
    .from('registrasi_donor')
    .insert(payload)
    .select('kode_registrasi')
    .single();

  if (error) {
    console.error('[SIPEDA:registerDonor] Supabase error:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    if (error.code === '23505') {
      // Unique constraint violation: telepon + jadwal_id
      if (error.message?.includes('telepon') || error.message?.includes('jadwal')) {
        throw new Error('Nomor WhatsApp ini sudah terdaftar untuk jadwal tersebut.');
      }
    }
    // RLS violation — anon user tidak punya INSERT policy
    if (error.code === '42501' || error.message?.includes('row-level security')) {
      throw new Error('Sistem sedang dalam perbaikan. Silakan coba beberapa saat lagi.');
    }
    throw new Error(`Gagal mendaftar: ${error.message || 'Silakan coba lagi.'}`);
  }

  return { kode_registrasi: (reg as { kode_registrasi: string }).kode_registrasi };
}

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

  if (error) throw error;
  if (!data) return null;
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

// ─── Batalkan Registrasi (Donor-facing) ────────────────────────────────────────

export async function batalkanRegistrasi(kode: string, telepon: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase.rpc('batalkan_registrasi_by_kode', {
    p_kode: kode,
    p_telepon: telepon,
  });

  if (error) {
    console.error('[SIPEDA:batalkanRegistrasi]', error);
    return { success: false, error: error.message };
  }

  const result = data as { success: boolean; error: string | null };
  if (!result.success) {
    return { success: false, error: result.error || 'Gagal membatalkan registrasi.' };
  }

  return { success: true };
}