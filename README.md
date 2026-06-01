# SIPEDA — Sistem Informasi Pendonoran Darah

> Platform digital donor darah untuk **PMI Kabupaten Indramayu**.

[![Stack](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![Stack](https://img.shields.io/badge/Supabase-FFD000)](https://supabase.com)
[![Stack](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)

---

## Fitur Utama

- **Registrasi Donor Online** — Daftar donor tanpa datang langsung
- **Jadwal Donor** — Lihat jadwal + sisa kuota real-time
- **Stok Darah** — Cek ketersediaan darah per lokasi + komponen
- **Peta Interaktif** — Temukan lokasi donor terdekat
- **Riwayat Donor** — Cek riwayat via telepon + kode registrasi
- **Artikel & Edukasi** — Informasi seputar donor darah
- **Admin Panel** — Kelola jadwal, lokasi, stok, pengguna
- **Petugas Panel** — Catat hasil donor di lapangan
- **Rekap & Ekspor** — Excel multi-sheet untuk laporan

## Tech Stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Bahasa | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + RLS |
| CSS | Tailwind CSS 4 |
| Map | Leaflet (OpenStreetMap) |
| Icons | Lucide React |
| Deployment | Vercel |

## Memulai Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.local.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Database migrations
# Jalankan file di supabase/migrations/ di Supabase SQL Editor

# 4. Jalankan development server
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL       # Dari Supabase dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Anon key (public)
SUPABASE_SERVICE_ROLE_KEY      # Service role key (server-only)
NEXT_PUBLIC_SITE_URL           # URL publik (untuk OG metadata)
```

## Struktur Proyek

```
src/
  app/           # Next.js App Router pages
  components/    # UI & feature components
  lib/           # API clients, auth, types, utils
supabase/
  migrations/    # Database schema changes
  seed/          # Demo data
```

## Lisensi

Internal — PMI Kabupaten Indramayu.
