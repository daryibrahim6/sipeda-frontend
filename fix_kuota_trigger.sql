-- ============================================================
-- FIX: Auto-update sisa_kuota di jadwal_donor
-- saat registrasi baru masuk atau dihapus/dibatalkan.
--
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- 1. Buat fungsi yang menghitung ulang sisa_kuota
CREATE OR REPLACE FUNCTION update_sisa_kuota()
RETURNS trigger AS $$
DECLARE
  target_jadwal_id bigint;
  total_registered int;
  total_kuota int;
BEGIN
  -- Tentukan jadwal_id yang terdampak
  IF TG_OP = 'DELETE' THEN
    target_jadwal_id := OLD.jadwal_id;
  ELSE
    target_jadwal_id := NEW.jadwal_id;
  END IF;

  -- Hitung jumlah registrasi aktif (bukan dibatalkan)
  SELECT COUNT(*) INTO total_registered
  FROM registrasi_donor
  WHERE jadwal_id = target_jadwal_id
    AND (status IS NULL OR status != 'dibatalkan');

  -- Ambil kuota total
  SELECT kuota INTO total_kuota
  FROM jadwal_donor
  WHERE id = target_jadwal_id;

  -- Update sisa_kuota = kuota - jumlah_terdaftar (minimum 0)
  UPDATE jadwal_donor
  SET sisa_kuota = GREATEST(total_kuota - total_registered, 0)
  WHERE id = target_jadwal_id;

  -- Auto-set status 'penuh' jika sisa_kuota = 0
  UPDATE jadwal_donor
  SET status = CASE
    WHEN GREATEST(total_kuota - total_registered, 0) = 0 AND status = 'aktif' THEN 'penuh'
    WHEN GREATEST(total_kuota - total_registered, 0) > 0 AND status = 'penuh' THEN 'aktif'
    ELSE status
  END
  WHERE id = target_jadwal_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 2. Buat trigger pada tabel registrasi_donor
DROP TRIGGER IF EXISTS trg_update_sisa_kuota ON registrasi_donor;
CREATE TRIGGER trg_update_sisa_kuota
  AFTER INSERT OR DELETE OR UPDATE OF status
  ON registrasi_donor
  FOR EACH ROW
  EXECUTE FUNCTION update_sisa_kuota();

-- 3. Sinkronkan data existing: hitung ulang semua sisa_kuota
UPDATE jadwal_donor jd
SET sisa_kuota = jd.kuota - COALESCE(reg.cnt, 0)
FROM (
  SELECT jadwal_id, COUNT(*) AS cnt
  FROM registrasi_donor
  WHERE status IS NULL OR status != 'dibatalkan'
  GROUP BY jadwal_id
) reg
WHERE jd.id = reg.jadwal_id;

-- 4. Verifikasi
SELECT jd.id, jd.kuota, jd.sisa_kuota,
       (SELECT COUNT(*) FROM registrasi_donor rd WHERE rd.jadwal_id = jd.id AND (rd.status IS NULL OR rd.status != 'dibatalkan')) AS registrasi_aktif
FROM jadwal_donor jd
ORDER BY jd.id;
