/**
 * lib/api.ts
 *
 * Mock toggle: set NEXT_PUBLIC_USE_MOCK=true di .env.local untuk pakai data lokal.
 * Saat backend Laravel sudah siap, ubah ke false dan set NEXT_PUBLIC_API_URL.
 */

import type {
  Location, Schedule, BloodStockRow, Article,
  SiteStats, FAQ, Announcement,
  RegistrationPayload, Registration,
  ApiResponse, PaginatedResponse,
} from './types';

import {
  MOCK_STATS,
  MOCK_LOCATIONS,
  MOCK_SCHEDULES,
  MOCK_BLOOD_STOCK,
  MOCK_ARTICLES,
  MOCK_FAQS,
  MOCK_ANNOUNCEMENTS,
} from './mockData';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
const API_URL  = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// Simulasi delay jaringan di mode mock (ms)
const MOCK_DELAY = 200;

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── HTTP HELPER ─────────────────────────────────────────────────────────────
async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// ─── STATS ───────────────────────────────────────────────────────────────────
export async function getStats(): Promise<SiteStats> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_STATS;
  }
  return get<ApiResponse<SiteStats>>('/stats').then(r => r.data);
}

// ─── LOCATIONS ───────────────────────────────────────────────────────────────
export async function getLocations(): Promise<Location[]> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_LOCATIONS.filter(l => l.aktif);
  }
  return get<ApiResponse<Location[]>>('/locations').then(r => r.data);
}

export async function getLocation(id: number): Promise<Location | null> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_LOCATIONS.find(l => l.id === id) ?? null;
  }
  return get<ApiResponse<Location>>(`/locations/${id}`).then(r => r.data);
}

// ─── SCHEDULES ───────────────────────────────────────────────────────────────
export async function getSchedules(month?: number, year?: number): Promise<Schedule[]> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    let result = [...MOCK_SCHEDULES];
    if (month && year) {
      result = result.filter(s => {
        const d = new Date(s.tanggal);
        return d.getMonth() + 1 === month && d.getFullYear() === year;
      });
    } else if (month) {
      result = result.filter(s => new Date(s.tanggal).getMonth() + 1 === month);
    }
    return result.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  }

  const params: Record<string, string> = {};
  if (month) params.month = String(month);
  if (year)  params.year  = String(year);
  return get<ApiResponse<Schedule[]>>('/schedules', params).then(r => r.data);
}

export async function getSchedule(id: number): Promise<Schedule | null> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_SCHEDULES.find(s => s.id === id) ?? null;
  }
  return get<ApiResponse<Schedule>>(`/schedules/${id}`).then(r => r.data);
}

// ─── BLOOD STOCK ─────────────────────────────────────────────────────────────
export async function getBloodStock(locationId?: number): Promise<BloodStockRow[]> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    // Mock: filter per lokasi hanya bisa simulasi, return sama saja
    return MOCK_BLOOD_STOCK;
  }
  const params = locationId ? { location_id: String(locationId) } : undefined;
  return get<ApiResponse<BloodStockRow[]>>('/blood-stock', params).then(r => r.data);
}

// ─── ARTICLES ────────────────────────────────────────────────────────────────
const ARTICLES_PER_PAGE = 6;

export async function getArticles(page = 1): Promise<PaginatedResponse<Article>> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    const total   = MOCK_ARTICLES.length;
    const start   = (page - 1) * ARTICLES_PER_PAGE;
    const data    = MOCK_ARTICLES.slice(start, start + ARTICLES_PER_PAGE);
    return {
      data,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / ARTICLES_PER_PAGE),
        per_page: ARTICLES_PER_PAGE,
        total,
      },
    };
  }
  return get<PaginatedResponse<Article>>('/articles', { page: String(page) });
}

export async function getArticle(slug: string): Promise<Article | null> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_ARTICLES.find(a => a.slug === slug) ?? null;
  }
  return get<ApiResponse<Article>>(`/articles/${slug}`).then(r => r.data);
}

// ─── FAQs ─────────────────────────────────────────────────────────────────────
export async function getFAQs(): Promise<FAQ[]> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_FAQS;
  }
  return get<ApiResponse<FAQ[]>>('/faqs').then(r => r.data);
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
export async function getAnnouncements(): Promise<Announcement[]> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY);
    return MOCK_ANNOUNCEMENTS;
  }
  return get<ApiResponse<Announcement[]>>('/announcements').then(r => r.data);
}

// ─── REGISTRATIONS ────────────────────────────────────────────────────────────
export async function registerDonor(payload: RegistrationPayload): Promise<Registration> {
  if (USE_MOCK) {
    await sleep(600); // simulasi proses
    const kode = `REG-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    return {
      ...payload,
      id: Math.floor(Math.random() * 1000),
      kode_registrasi: kode,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Gagal mendaftar, coba lagi.');
  }
  const data: ApiResponse<Registration> = await res.json();
  return data.data;
}