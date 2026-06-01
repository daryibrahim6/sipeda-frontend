-- ============================================================
-- SIPEDA — Triggers (002)
-- Semua trigger pada tabel, mengacu pada fungsi di 001_functions.sql.
-- ============================================================

-- ── Trigger: auto-update status stok ─────────────────────────

DROP TRIGGER IF EXISTS trg_stok_status ON public.stok_darah;
CREATE TRIGGER trg_stok_status
  BEFORE INSERT OR UPDATE OF jumlah, batas_kritis
  ON public.stok_darah
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stok_status();

-- ── Trigger: auto-update sisa kuota ──────────────────────────

DROP TRIGGER IF EXISTS trg_registrasi_kuota ON public.registrasi_donor;
DROP TRIGGER IF EXISTS registrasi_kuota_trigger ON public.registrasi_donor;
DROP TRIGGER IF EXISTS trg_sisa_kuota ON public.registrasi_donor;
DROP TRIGGER IF EXISTS trg_update_sisa_kuota ON public.registrasi_donor;

CREATE TRIGGER trg_registrasi_kuota
  AFTER INSERT OR DELETE OR UPDATE OF status
  ON public.registrasi_donor
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sisa_kuota();

-- ── Trigger: auto-expire jadwal ──────────────────────────────

DROP TRIGGER IF EXISTS trg_jadwal_expired ON public.jadwal_donor;
CREATE TRIGGER trg_jadwal_expired
  BEFORE INSERT OR UPDATE OF tanggal, status
  ON public.jadwal_donor
  FOR EACH ROW
  EXECUTE FUNCTION public.check_jadwal_expired();

-- ── Trigger: auto-increase stok saat donor berhasil ─────────

DROP TRIGGER IF EXISTS trg_increase_stok_on_donation ON public.pencatatan_donor;
CREATE TRIGGER trg_increase_stok_on_donation
  AFTER INSERT
  ON public.pencatatan_donor
  FOR EACH ROW
  EXECUTE FUNCTION public.increase_stok_on_donation();

-- ── Updated_at triggers ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trigger_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER trg_jadwal_updated_at
  BEFORE UPDATE ON jadwal_donor
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER trg_lokasi_updated_at
  BEFORE UPDATE ON lokasi_donor
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER trg_artikel_updated_at
  BEFORE UPDATE ON artikel
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();

CREATE TRIGGER trg_registrasi_updated_at
  BEFORE UPDATE ON registrasi_donor
  FOR EACH ROW EXECUTE FUNCTION public.trigger_updated_at();
