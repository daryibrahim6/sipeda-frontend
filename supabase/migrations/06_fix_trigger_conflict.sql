-- ============================================================
-- SIPEDA — FIX: Konflik Trigger sisa_kuota
--
-- MASALAH:
-- Ada 3 trigger pada registrasi_donor yang memanggil fungsi
-- yang SAMA (update_sisa_kuota), menyebabkan setiap INSERT
-- memicu function 3 KALI dan setiap UPDATE juga 3 KALI.
--
-- Trigger aktif saat ini:
--   1. registrasi_kuota_trigger  (INSERT, UPDATE)
--   2. trg_sisa_kuota            (INSERT, UPDATE)
--   3. trg_update_sisa_kuota     (INSERT, DELETE, UPDATE)
--
-- ANALISIS:
-- ┌─────────────────┬──────────────────┬────────────────────┐
-- │                 │ Versi A          │ Versi B            │
-- │                 │ (supabase_fixes) │ (fix_kuota_trigger)│
-- ├─────────────────┼──────────────────┼────────────────────┤
-- │ Logic           │ Increment/       │ Full recount       │
-- │                 │ Decrement (+1/-1)│ dari tabel         │
-- ├─────────────────┼──────────────────┼────────────────────┤
-- │ Idempoten?      │ ❌ TIDAK         │ ✅ YA              │
-- │ (aman fire 2x?) │ -1 jadi -2      │ count tetap sama   │
-- ├─────────────────┼──────────────────┼────────────────────┤
-- │ Handle DELETE?  │ ❌ TIDAK         │ ✅ YA              │
-- ├─────────────────┼──────────────────┼────────────────────┤
-- │ Self-healing?   │ ❌ TIDAK         │ ✅ YA              │
-- │ (koreksi drift) │ drift menumpuk   │ selalu akurat      │
-- ├─────────────────┼──────────────────┼────────────────────┤
-- │ Performa        │ Lebih cepat      │ Sedikit lebih      │
-- │                 │ (no extra query) │ lambat (COUNT)     │
-- └─────────────────┴──────────────────┴────────────────────┘
--
-- KEPUTUSAN: Pertahankan Versi B (full recount)
--
-- Alasan:
-- 1. IDEMPOTEN — walaupun ada bug trigger ganda, hasilnya tetap benar
-- 2. SELF-HEALING — jika ada data drift dari bug sebelumnya, akan
--    otomatis terkoreksi saat trigger berikutnya fire
-- 3. HANDLE DELETE — Versi A tidak menangani DELETE sama sekali
-- 4. PERFORMA — Untuk skala PMI kabupaten (maks ~200 registrasi/jadwal),
--    overhead COUNT(*) dengan index negligible (~0.1ms)
--
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

BEGIN;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 1: Hapus SEMUA trigger duplikat                     ║
-- ╚════════════════════════════════════════════════════════════╝

-- Hapus ketiga trigger yang saling bentrok
DROP TRIGGER IF EXISTS registrasi_kuota_trigger ON public.registrasi_donor;
DROP TRIGGER IF EXISTS trg_sisa_kuota ON public.registrasi_donor;
DROP TRIGGER IF EXISTS trg_update_sisa_kuota ON public.registrasi_donor;


-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 2: Buat fungsi definitif (Versi B — full recount)   ║
-- ║  Diperbaiki: gabungkan 2 UPDATE jadi 1 untuk efisiensi    ║
-- ╚════════════════════════════════════════════════════════════╝

CREATE OR REPLACE FUNCTION public.update_sisa_kuota()
RETURNS trigger AS $$
DECLARE
  v_jadwal_id bigint;
  v_total_registered int;
  v_total_kuota int;
  v_sisa int;
BEGIN
  -- Tentukan jadwal_id yang terdampak
  IF TG_OP = 'DELETE' THEN
    v_jadwal_id := OLD.jadwal_id;
  ELSE
    v_jadwal_id := NEW.jadwal_id;
  END IF;

  -- Hitung jumlah registrasi aktif (bukan dibatalkan)
  SELECT COUNT(*) INTO v_total_registered
  FROM public.registrasi_donor
  WHERE jadwal_id = v_jadwal_id
    AND (status IS NULL OR status != 'dibatalkan');

  -- Ambil kuota total dari jadwal
  SELECT kuota INTO v_total_kuota
  FROM public.jadwal_donor
  WHERE id = v_jadwal_id;

  -- Hitung sisa (minimum 0)
  v_sisa := GREATEST(v_total_kuota - v_total_registered, 0);

  -- Update sisa_kuota DAN status dalam satu statement
  -- (diperbaiki dari versi B asli yang pakai 2 UPDATE terpisah)
  UPDATE public.jadwal_donor
  SET
    sisa_kuota = v_sisa,
    status = CASE
      WHEN v_sisa = 0 AND status = 'aktif' THEN 'penuh'::jadwal_status
      WHEN v_sisa > 0 AND status = 'penuh' THEN 'aktif'::jadwal_status
      ELSE status  -- 'selesai', 'dibatalkan' tidak diubah
    END
  WHERE id = v_jadwal_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 3: Buat SATU trigger definitif                      ║
-- ╚════════════════════════════════════════════════════════════╝

-- Nama trigger: trg_registrasi_kuota (nama baru, bersih dari konflik)
-- Events: INSERT, DELETE, UPDATE OF status
-- Timing: AFTER (agar row sudah committed saat COUNT dijalankan)

CREATE TRIGGER trg_registrasi_kuota
  AFTER INSERT OR DELETE OR UPDATE OF status
  ON public.registrasi_donor
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sisa_kuota();

-- Komentar pada trigger untuk dokumentasi
COMMENT ON TRIGGER trg_registrasi_kuota ON public.registrasi_donor IS
  'Auto-update sisa_kuota dan status pada jadwal_donor. '
  'Menggunakan full recount (idempoten). '
  'Satu-satunya trigger untuk kuota — jangan buat duplikat.';


-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 4: Sinkronkan semua sisa_kuota yang mungkin drift   ║
-- ╚════════════════════════════════════════════════════════════╝

-- Karena trigger lama mungkin sudah menyebabkan data drift
-- (fire 3x = decrement 3x), koreksi SEMUA jadwal sekaligus.

-- 4a. Update jadwal yang punya registrasi
UPDATE public.jadwal_donor jd
SET
  sisa_kuota = GREATEST(jd.kuota - COALESCE(reg.cnt, 0), 0),
  status = CASE
    WHEN GREATEST(jd.kuota - COALESCE(reg.cnt, 0), 0) = 0 AND jd.status = 'aktif'
      THEN 'penuh'::jadwal_status
    WHEN GREATEST(jd.kuota - COALESCE(reg.cnt, 0), 0) > 0 AND jd.status = 'penuh'
      THEN 'aktif'::jadwal_status
    ELSE jd.status
  END
FROM (
  SELECT jadwal_id, COUNT(*) AS cnt
  FROM public.registrasi_donor
  WHERE status IS NULL OR status != 'dibatalkan'
  GROUP BY jadwal_id
) reg
WHERE jd.id = reg.jadwal_id;

-- 4b. Jadwal tanpa registrasi: pastikan sisa_kuota = kuota
UPDATE public.jadwal_donor jd
SET sisa_kuota = jd.kuota
WHERE NOT EXISTS (
  SELECT 1 FROM public.registrasi_donor r
  WHERE r.jadwal_id = jd.id
    AND (r.status IS NULL OR r.status != 'dibatalkan')
)
AND jd.sisa_kuota != jd.kuota;


-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 5: Verifikasi                                       ║
-- ╚════════════════════════════════════════════════════════════╝

-- 5a. Pastikan hanya ada 1 trigger kuota (+ registrasi_updated_at yang unrelated)
SELECT tgname AS trigger_name,
       CASE tgtype::int & 2  WHEN 2 THEN 'BEFORE' ELSE 'AFTER' END AS timing,
       CASE tgtype::int & 28
         WHEN 4  THEN 'INSERT'
         WHEN 8  THEN 'DELETE'
         WHEN 16 THEN 'UPDATE'
         WHEN 12 THEN 'INSERT+DELETE'
         WHEN 20 THEN 'INSERT+UPDATE'
         WHEN 24 THEN 'DELETE+UPDATE'
         WHEN 28 THEN 'INSERT+DELETE+UPDATE'
       END AS events,
       p.proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
JOIN pg_class c ON c.oid = t.tgrelid
WHERE c.relname = 'registrasi_donor'
  AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 5b. Verifikasi akurasi: bandingkan sisa_kuota dengan hitung manual
-- Jika kolom "selisih" = 0 untuk semua baris, data sudah akurat
SELECT
  jd.id AS jadwal_id,
  jd.tanggal,
  jd.kuota,
  jd.sisa_kuota AS sisa_kuota_di_db,
  jd.kuota - COALESCE(reg.cnt, 0) AS sisa_kuota_seharusnya,
  jd.sisa_kuota - (jd.kuota - COALESCE(reg.cnt, 0)) AS selisih,
  jd.status
FROM public.jadwal_donor jd
LEFT JOIN (
  SELECT jadwal_id, COUNT(*) AS cnt
  FROM public.registrasi_donor
  WHERE status IS NULL OR status != 'dibatalkan'
  GROUP BY jadwal_id
) reg ON reg.jadwal_id = jd.id
ORDER BY jd.tanggal DESC;

COMMIT;

-- ============================================================
-- EXPECTED RESULTS:
--
-- Step 5a: Hanya ada 2 trigger:
--   - trg_registrasi_kuota (INSERT+DELETE+UPDATE) → update_sisa_kuota
--   - registrasi_updated_at (UPDATE) → handle_updated_at
--
-- Step 5b: Kolom "selisih" harus = 0 untuk SEMUA baris.
--   Jika ada yang != 0, berarti ada data corruption yang lebih dalam.
--
-- CLEANUP FILE SQL LAMA:
-- Setelah menjalankan fix ini, update file SQL supaya konsisten:
--   - supabase_fixes.sql → hapus blok TRIGGER di baris 39-74
--   - fix_kuota_trigger.sql → tandai sebagai "superseded by fix_trigger_conflict"
-- ============================================================
