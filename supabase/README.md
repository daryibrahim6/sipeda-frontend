# SIPEDA — Supabase

Folder Supabase untuk project SIPEDA (Sistem Informasi Pendonor Darah Indramayu).

## Struktur

```
supabase/
├── migrations/             SQL migrations (apply berurutan 000 → 012)
│   ├── 000_schema_base.sql
│   ├── 001_functions.sql
│   ├── 002_triggers.sql
│   ├── 003_rls_policies.sql
│   ├── 004_views_rpc.sql
│   ├── 005_multi_tenant_cabang.sql
│   ├── 006_indexes.sql
│   ├── 007_fixes.sql
│   ├── 008_audit_fixes.sql
│   ├── 009_security_hardening.sql
│   ├── 010_database_cleanup.sql
│   ├── 011_security_hardening_v2.sql
│   └── 012_housekeeping.sql
├── seed.sql                Data demo fiktif (Indramayu)
├── VERIFICATION.sql        Audit queries — one-off, bukan migration
├── .gitignore              Exclude .temp/, branches/, *.local.sql
└── README.md               File ini
```

## Cara apply migrations ke DB baru

### Opsi A: Manual via Supabase SQL Editor (recommended untuk 1× setup)

1. Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. New query
3. Copy-paste isi migration (000 → 012 berurutan, satu-satu)
4. Run each, harus return "Success"
5. Untuk 011 dan 012, lihat catatan di masing-masing header (perlu perlakuan khusus)

### Opsi B: CLI (recommended untuk re-apply / branch / local)

```bash
# Link project (sekali)
supabase link --project-ref <PROJECT_REF>

# Push semua migration
supabase db push

# Atau apply 1 file spesifik
supabase db push --file supabase/migrations/012_housekeeping.sql
```

## Daftar migrations (ringkasan)

| File | Fase | Isi |
|------|------|-----|
| 000_schema_base | Setup awal | 16 tabel + enum + sequences |
| 001_functions | Setup awal | Helper functions (reg_status, is_admin) |
| 002_triggers | Setup awal | Audit log + auto-update timestamps |
| 003_rls_policies | Setup awal | Row Level Security untuk semua tabel |
| 004_views_rpc | Setup awal | 3 views (v_pengumuman_aktif, v_rekap_pencatatan, v_stats) |
| 005_multi_tenant_cabang | Multi-tenant | Tabel `cabang` + scoping by cabang_id |
| 006_indexes | Performa | ~60 indexes (FK, lookup, partial) |
| 007_fixes | Audit | Small bug fixes (constraint, default values) |
| 008_audit_fixes | Audit | 4 fixes dari audit awal |
| 009_security_hardening | Audit Fase 1 | 13 fixes keamanan (RLS, function security) |
| 010_database_cleanup | Audit Fase 2 | Cleanup unused + tighten permissions |
| 011_security_hardening_v2 | Audit Fase 3 | 3 TINGGI: trigger registrasi, RLS stok, second-factor batalkan |
| 012_housekeeping | Audit Fase 4 | REVOKE public exec + tighten search_path |

## Status DB (per 2026-06-03)

- **16 tables** — semua dengan RLS+FORCE RLS
- **16 functions** — 4 SECURITY DEFINER dengan `search_path=''`
- **3 views** — v_pengumuman_aktif, v_rekap_pencatatan, v_stats
- **11 triggers** — audit, guard registrasi, stok history
- **~60 indexes** — FK, lookup, partial
- **Seed data lengkap** — 3 admin, 6 lokasi, 17 jadwal, 48 registrasi, dst

## ⚠ Catatan khusus

- **011 dan 012 di-apply MANUAL** ke remote DB (tidak auto-tracked di `supabase_migrations.schema_migrations`). Re-apply manual untuk setup DB baru.
- **Tidak ada Supabase CLI config** (`config.toml` absent) karena project pakai hosted Supabase, bukan local dev. Folder `.temp/` akan muncul hanya jika `supabase start` dijalankan.

## Seed data

File `seed.sql` berisi **data fiktif** (nama pendonor, lokasi, jadwal dummy) untuk demo.
Email admin placeholder: `admin@sipeda.id` / `dary@sipeda.id` / `petugas@sipeda.id` dengan password `sipeda123` (demo only).
**Jangan gunakan seed.sql untuk production data** — ini hanya untuk local development dan demo.

## Verifikasi pasca-setup

Run `VERIFICATION.sql` di SQL Editor untuk memastikan:
1. Housekeeping items applied (3× `true`)
2. Semua SECURITY DEFINER functions punya `search_path=""`
3. Semua 16 tabel punya `force_rls=true`
