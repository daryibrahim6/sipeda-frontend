# SIPEDA Architecture

> Stack, struktur, data flow, dan keputusan teknis.

---

## 1. Technology Stack

| Layer | Teknologi | Versi | Alasan |
|---|---|---|---|
| **Framework** | Next.js | 16.1.6 | App Router, React Server Components, SSR/SSG hybrid |
| **Bahasa** | TypeScript | ^5 | Type safety, maintainability jangka panjang |
| **Database** | Supabase (PostgreSQL) | - | Auth built-in, Realtime, RLS, gratis |
| **CSS** | Tailwind CSS | ^4 | Utility-first, cepat develop, bundle kecil |
| **Map** | Leaflet | ^1.9 | Gratis, tanpa API key, ringan |
| **Chart** | In-house (SVG/CSS) | - | Gak perlu library chart berat |
| **Icons** | Lucide React | ^0.575 | Ringan, konsisten, tree-shakeable |
| **Deployment** | Vercel | - | First-class Next.js support, edge functions |
| **Linting** | ESLint + `eslint-config-next` | ^9 | Standard Next.js opinionated config |

---

## 2. Struktur Folder

```
src/
  app/                    # Next.js App Router pages
    layout.tsx            # Root layout
    page.tsx              # Homepage
    (public pages)/
    admin/                # Admin dashboard (role-protected)
    petugas/              # Field officer panel (role-protected)
    api/                  # API routes
  components/
    layout/               # PublicShell, Navbar, Footer, Sidebar
    ui/                   # Badge, Button, Card, Modal, Input, etc.
    admin/                # Sidebar, TopBar, admin-specific components
    petugas/              # PetugasHeader, PencatatanForm, PencatatanList
    jadwal/               # JadwalClient, RegisterForm, ScheduleCard
    donor/                # DonorCard
    map/                  # LeafletMap, MapWrapper
    stok/                 # BloodStockTable
  lib/
    supabase.ts           # Public + admin Supabase clients
    supabase-browser.ts   # SSR browser client
    supabase-server.ts    # Server component client
    auth.ts               # Authentication functions
    api.ts                # Public API functions
    admin-api.ts          # Admin API functions
    petugas-api.ts        # Petugas API functions
    types.ts              # TypeScript type definitions
    constants.ts          # Labels, colors, CSS constants
    utils.ts              # Formatting, helpers, sanitization
supabase/
  migrations/             # Database migrations (14 files)
  seed/                   # Demo seed data
```

---

## 3. Database Schema (Simplified)

```
admins
├── auth_user_id (↔ Supabase Auth)
├── name, email, role [superadmin|admin|petugas_lapangan]
└── aktif (boolean)

lokasi_donor
├── kode_lokasi (unique), nama_lokasi, tipe, alamat
├── koordinat_lat, koordinat_lng
├── kontak, email, jam_operasional
└── aktif (boolean)

komponen_darah
└── kode [WB|PRC|TC|FFP], nama, deskripsi

stok_darah
├── lokasi_id → lokasi_donor
├── komponen_id → komponen_darah
├── golongan_darah, jumlah, batas_kritis
└── status [normal|kritis|kosong] (auto-set trigger)

jadwal_donor
├── lokasi_id → lokasi_donor
├── tanggal, waktu_mulai, waktu_selesai
├── kuota, sisa_kuota (auto-managed)
└── status [aktif|penuh|dibatalkan|selesai]

registrasi_donor
├── jadwal_id → jadwal_donor
├── kode_registrasi (REG-YYYY-NNNNNN, auto)
├── nama, nik, telepon, email, golongan_darah
├── status [pending|confirmed|hadir|tidak_hadir|dibatalkan]
└── UNIQUE(jadwal_id, telepon) WHERE status != dibatalkan

pencatatan_donor
├── jadwal_id → jadwal_donor
├── registrasi_id → registrasi_donor (nullable)
├── nama_pendonor, golongan_darah
├── status_donor [berhasil|gagal|tidak_memenuhi_syarat]
├── hemoglobin, tensi_sistolik, tensi_diastolik, berat_badan
└── dicatat_oleh → admins

artikel
├── judul, slug (unique), excerpt, konten (HTML)
├── kategori_id → kategori_artikel
├── status [draft|published|archived]
└── published_at, views

pengumuman
├── judul, isi, tipe [info|sukses|peringatan|darurat]
├── link, tanggal_mulai, tanggal_selesai
└── aktif (boolean)
```

---

## 4. Auth Flow

```
Browser → middleware.ts
  ├── Refresh Supabase session cookie
  ├── Cek path:
  │   ├── /admin/* → role must be admin|superadmin
  │   ├── /petugas/* → role must be petugas_lapangan|admin|superadmin
  │   └── public → allow all
  └── Redirect /login if unauthorized

Login:
  POST /login → auth.loginUnified()
    ├── Cek admins table by email
    ├── Verify password via Supabase Auth
    └── Redirect based on role:
        ├── admin/superadmin → /admin/dashboard
        └── petugas_lapangan → /petugas
```

---

## 5. Key Technical Decisions

### ✅ Next.js App Router + RSC
- **Server Components** untuk data fetching (langsung akses DB tanpa API layer)
- **Client Components** hanya untuk interaktivitas (form, map, realtime)
- **ISR/SSR** untuk halaman publik dengan revalidate interval

### ✅ Supabase sebagai Backend Tunggal
- Auth, database, realtime, dan storage dalam satu platform
- **RLS (Row Level Security)** — otorisasi di level database, bukan aplikasi
- **Service Role Key** — hanya dipakai di server-side (API routes) untuk operasi superadmin

### ✅ DB Triggers untuk Business Logic
- `update_sisa_kuota()` — otomatis update sisa_kuota saat registrasi berubah
- `update_stok_status()` — set status normal/kritis/kosong otomatis
- `increase_stok_on_donation()` — +1 WB stock saat donor berhasil
- `expire_expired_jadwal()` — auto-expire jadwal yang sudah lewat

### ✅ Kode Registrasi via DB Sequence
- Format: `REG-YYYY-NNNNNN`
- Atomic, race-condition free
- Bisa dilacak secara kronologis

### ✅ Rendering Strategy per Halaman

| Halaman | Strategy | Revalidate |
|---|---|---|
| Homepage | SSG | 60s |
| Stok Darah | SSR | 30s |
| Jadwal | SSR + Client fetch | - |
| Artikel | SSR | 120s |
| Peta | SSR | 120s |
| FAQ | SSR | 3600s |
| Admin | SSR | - |
| API /jadwal | Static JSON | 300s + on-demand revalidate |

---

## 6. Security

- **RLS** on all tables — tidak ada query dari client yang bypass policy
- **Service Role Key** (SUPABASE_SERVICE_ROLE_KEY) hanya dipakai di:
  - `/api/admin/users` — CRUD admin users
  - Gak pernah di-expose ke browser
- **DOMPurify** — sanitasi HTML artikel dari XSS
- **Middleware** — cek session + role di setiap request masuk

---

## 7. Performance Considerations

- **Leaflet tanpa API key** — gak perlu bayar, tile gratis dari OpenStreetMap
- **Chart tidak pakai library** — cukup SVG/CSS untuk data sederhana
- **Image optimization** via Next.js `<Image>` dengan remotePatterns terbatas
- **Font optimization** via `next/font` (Inter)
- **Bundle splitting** otomatis via Next.js App Router (per route chunks)

---

## 8. Rollback Plan & Operations

### 8.1 Rollback Plan (jika deploy gagal)

**Langkah 1: Identifikasi**
- Cek Vercel Dashboard → Deployments → status `Error` atau `Degraded`
- Cek Sentry dashboard untuk spike error
- Cek #monitoring channel (jika ada) atau hubungi tim

**Langkah 2: Rollback Vercel**
- Buka Vercel Dashboard → SIPEDA → Deployments
- Cari deployment terakhir yang `Ready` (hijau)
- Klik ⋮ → "Promote to Production"
- Waktu: ~2–5 menit

**Langkah 3: Rollback Database (jika migrasi bermasalah)**
- Database migration SQL ada di `supabase/migrations/` (15 file, UP only)
- Jika migrasi gagal: restore dari Supabase Backup → Database backups → Restore
- Atau: jalankan SQL reverse migration manual
- **Catatan:** Saat ini belum ada DOWN migration — perlu ditambahkan di masa depan

**Langkah 4: Verifikasi**
- Cek halaman utama dan admin login berfungsi
- Cek Sentry error rate kembali normal
- Cek UptimeRobot (jika sudah terdaftar)

### 8.2 Kontak Darurat (after-hours)

| Peran | Kontak | Keterangan |
|---|---|---|
| Admin PMI | 0811-919-8611 (WhatsApp) | Laporan masalah operasional |
| Email | pmi.indramayu@gmail.com | Laporan formal |
| Vercel Status | https://www.vercel-status.com | Cek jika Vercel down |
| Supabase Status | https://status.supabase.com | Cek jika database down |

### 8.3 Monitoring

- **Sentry** → error tracking (konfigurasi di `sentry.client.config.ts`)
- **Google Analytics** → traffic & user behavior (konfigurasi via `NEXT_PUBLIC_GA_ID`)
- **UptimeRobot (rekomendasi)** → daftar gratis di https://uptimerobot.com untuk monitoring 5-menit
- **Vercel Analytics** → built-in untuk performa

### 8.4 Pre-Deploy Checklist

Sebelum deploy ke production:
1. ✅ `npm audit` — tidak ada high/critical vulnerability
2. ✅ `npm run lint` — tidak ada error
3. ✅ `npm run typecheck` — tidak ada type error
4. ✅ Cek `.env.local` — kredensial staging sudah dirotasi
5. ✅ Cek Sentry DSN terisi (jika production)
6. ✅ Database migration sudah di-test di staging
