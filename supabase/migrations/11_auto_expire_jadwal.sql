-- Migration 11: Auto-expire jadwal_donor
--
-- Memberikan trigger yang otomatis mengubah status jadwal menjadi
-- 'selesai' ketika tanggal kegiatan sudah lewat.
--
-- Cara kerja:
--   1. BEFORE INSERT OR UPDATE ON jadwal_donor: jika tanggal < CURRENT_DATE,
--      set status = 'selesai' secara otomatis.
--   2. Fungsi expire_expired_jadwal() + cron job: untuk jadwal yang sudah ada
--      di database dan tidak di-update, perlu cron job harian.
--
-- Cara setup cron job (via Supabase SQL Editor, butuh pg_cron extension):
--   SELECT cron.schedule(
--     'expire-jadwal-donor',
--     '0 0 * * *',  -- setiap hari jam 00:00
--     $$UPDATE public.jadwal_donor SET status = 'selesai' WHERE tanggal < CURRENT_DATE AND status NOT IN ('selesai', 'dibatalkan')$$
--   );
--
-- Jika pg_cron tidak tersedia (free tier), jalankan query di atas
-- secara manual setiap hari, atau buat Supabase Edge Function
-- dengan cron trigger dari dashboard.


-- ────────────────────────────────────────────────────────────
-- 1. Fungsi untuk auto-expire saat INSERT/UPDATE
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_jadwal_expired()
RETURNS trigger AS $$
BEGIN
  -- Jika tanggal sudah lewat, set status ke 'selesai'
  -- (kecuali sudah 'dibatalkan')
  IF NEW.tanggal < CURRENT_DATE AND NEW.status NOT IN ('selesai', 'dibatalkan') THEN
    NEW.status := 'selesai';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hapus trigger lama jika ada
DROP TRIGGER IF EXISTS trg_jadwal_expired ON public.jadwal_donor;

-- Trigger BEFORE INSERT OR UPDATE
CREATE TRIGGER trg_jadwal_expired
  BEFORE INSERT OR UPDATE OF tanggal, status
  ON public.jadwal_donor
  FOR EACH ROW
  EXECUTE FUNCTION public.check_jadwal_expired();


-- ────────────────────────────────────────────────────────────
-- 2. Fungsi untuk batch-expire jadwal lama (via cron/edge)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.expire_expired_jadwal()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int;
BEGIN
  UPDATE public.jadwal_donor
  SET status = 'selesai'
  WHERE tanggal < CURRENT_DATE
    AND status NOT IN ('selesai', 'dibatalkan');

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;
