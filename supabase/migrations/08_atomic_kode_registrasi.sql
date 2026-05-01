-- ============================================================
-- SIPEDA — FIX S-07: Kode Registrasi Atomic via Database Sequence
--
-- MASALAH:
-- Kode registrasi dihasilkan di client (JavaScript) menggunakan
-- Date.now() + Math.random(). Ini rentan race condition pada
-- concurrent inserts dan memerlukan retry logic yang rumit.
--
-- PERBAIKAN:
-- Buat database sequence + function yang generate kode registrasi
-- secara atomic di server. Format: REG-{YYYY}-{6_DIGIT_SEQUENCE}
-- Contoh: REG-2026-000001, REG-2026-000002, ...
--
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

BEGIN;

-- 1. Buat sequence (dimulai dari 1, reset manual per tahun jika diperlukan)
CREATE SEQUENCE IF NOT EXISTS registrasi_kode_seq
  START WITH 1
  INCREMENT BY 1
  NO MAXVALUE
  CACHE 1;

-- 2. Function untuk generate kode registrasi
CREATE OR REPLACE FUNCTION generate_kode_registrasi()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('registrasi_kode_seq');
  RETURN 'REG-' || EXTRACT(YEAR FROM NOW())::text || '-' || LPAD(seq_val::text, 6, '0');
END;
$$;

-- 3. Set DEFAULT pada kolom kode_registrasi
-- Jika kolom sudah punya default, ini akan replace-nya.
ALTER TABLE public.registrasi_donor
  ALTER COLUMN kode_registrasi SET DEFAULT generate_kode_registrasi();

-- 4. Verifikasi
SELECT generate_kode_registrasi() AS sample_kode;

COMMIT;

-- ============================================================
-- EXPECTED:
-- sample_kode = 'REG-2026-000001' (atau angka berikutnya)
--
-- CATATAN:
-- - Sequence tidak reset otomatis tiap tahun. Jika ingin reset:
--   ALTER SEQUENCE registrasi_kode_seq RESTART WITH 1;
-- - Sequence TIDAK rollback saat transaksi gagal (by design).
--   Ini berarti bisa ada gap di nomor urut, tapi itu normal
--   dan lebih baik daripada duplikasi.
-- ============================================================
