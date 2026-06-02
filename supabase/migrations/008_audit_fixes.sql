-- 008_audit_fixes.sql — Pre-deploy audit patch (4 fixes).

-- Fix #1: Stok darah history trigger (audit trail was dead)
CREATE OR REPLACE FUNCTION public.log_stok_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.jumlah IS DISTINCT FROM NEW.jumlah THEN
    INSERT INTO public.stok_darah_history (stok_id, jumlah_lama, jumlah_baru, updated_by, keterangan)
    VALUES (OLD.id, OLD.jumlah, NEW.jumlah, NEW.updated_by, 'auto');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stok_history ON public.stok_darah;
CREATE TRIGGER trg_stok_history
  AFTER UPDATE ON public.stok_darah
  FOR EACH ROW
  EXECUTE FUNCTION public.log_stok_history();

-- Fix #2: Index created_at for count_registrasi_bulan_ini RPC performance
CREATE INDEX IF NOT EXISTS idx_registrasi_created_at
  ON public.registrasi_donor(created_at DESC);

-- Fix #3: Partial index for sisa_kuota trigger performance
CREATE INDEX IF NOT EXISTS idx_registrasi_jadwal_non_cancelled
  ON public.registrasi_donor(jadwal_id) WHERE status <> 'dibatalkan';

-- Fix #4: Create increment_article_views function if missing
CREATE OR REPLACE FUNCTION public.increment_article_views(article_id INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.artikel SET views = views + 1 WHERE id = article_id;
END;
$$;
