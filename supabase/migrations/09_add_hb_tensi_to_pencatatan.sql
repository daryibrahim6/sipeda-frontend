-- ============================================================
-- SIPEDA — Add Hemoglobin, Tensi, and Weight to pencatatan_donor
--
-- Real PMI screening checks hemoglobin level, blood pressure,
-- and weight before donation. These fields were missing from
-- the pencatatan_donor table.
--
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

BEGIN;

-- 1. Add hemoglobin (g/dL) — typical range 12.5-18
ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS hemoglobin numeric(4,1) DEFAULT NULL;

-- 2. Add blood pressure systolic (mmHg)
ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS tensi_sistolik smallint DEFAULT NULL;

-- 3. Add blood pressure diastolic (mmHg)
ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS tensi_diastolik smallint DEFAULT NULL;

-- 4. Add weight (kg) — verified at screening, different from self-report
ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS berat_badan numeric(5,1) DEFAULT NULL;

-- Verifikasi
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pencatatan_donor'
  AND column_name IN ('hemoglobin', 'tensi_sistolik', 'tensi_diastolik', 'berat_badan')
ORDER BY ordinal_position;

COMMIT;
