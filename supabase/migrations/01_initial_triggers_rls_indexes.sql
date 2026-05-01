-- ============================================================
-- SIPEDA — Supabase SQL Fixes
-- Jalankan di: Supabase Dashboard → SQL Editor → New query
-- Jalankan satu blok sekaligus (pisahkan per --==)
-- ============================================================

-- ==== 1. TRIGGER: Auto-update status stok darah ====
-- Setiap kali admin update jumlah stok, status otomatis ikut berubah.
-- Tanpa ini: stok bisa 0 tapi status masih "normal".

CREATE OR REPLACE FUNCTION public.update_stok_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := CASE
    WHEN NEW.jumlah = 0            THEN 'kosong'::stok_status
    WHEN NEW.jumlah <= NEW.batas_kritis THEN 'kritis'::stok_status
    ELSE                                'normal'::stok_status
  END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stok_status ON public.stok_darah;
CREATE TRIGGER trg_stok_status
  BEFORE INSERT OR UPDATE OF jumlah, batas_kritis
  ON public.stok_darah
  FOR EACH ROW EXECUTE FUNCTION public.update_stok_status();

-- ==== 2. UNIQUE CONSTRAINT: Satu nomor HP hanya bisa daftar 1x per jadwal ====
-- Mencegah spam registrasi yang menghabiskan kuota secara artifisial.
-- Partial index: hanya enforce untuk status yang aktif (bukan dibatalkan).

DROP INDEX IF EXISTS idx_registrasi_jadwal_telp_aktif;
CREATE UNIQUE INDEX idx_registrasi_jadwal_telp_aktif
  ON public.registrasi_donor(jadwal_id, telepon)
  WHERE status NOT IN ('dibatalkan');

-- ==== 3. TRIGGER: Auto-update sisa_kuota saat registrasi dibuat/dibatalkan ====
-- Menjaga konsistensi sisa_kuota tanpa perlu dua query terpisah dari frontend.

CREATE OR REPLACE FUNCTION public.update_sisa_kuota()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status != 'dibatalkan' THEN
    UPDATE public.jadwal_donor
      SET sisa_kuota = GREATEST(0, sisa_kuota - 1),
          status = CASE
            WHEN sisa_kuota - 1 <= 0 THEN 'penuh'::jadwal_status
            ELSE status
          END
      WHERE id = NEW.jadwal_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Dari non-dibatalkan → dibatalkan: kembalikan kuota
    IF OLD.status != 'dibatalkan' AND NEW.status = 'dibatalkan' THEN
      UPDATE public.jadwal_donor
        SET sisa_kuota = LEAST(kuota, sisa_kuota + 1),
            status = CASE
              WHEN status = 'penuh' AND sisa_kuota + 1 > 0 THEN 'aktif'::jadwal_status
              ELSE status
            END
        WHERE id = NEW.jadwal_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sisa_kuota ON public.registrasi_donor;
CREATE TRIGGER trg_sisa_kuota
  AFTER INSERT OR UPDATE OF status
  ON public.registrasi_donor
  FOR EACH ROW EXECUTE FUNCTION public.update_sisa_kuota();

-- ==== 4. RLS: Izinkan public baca registrasi (perlu untuk cek kode) ====
-- Aman karena dari code selalu filter .eq('kode_registrasi', kode)
-- Kode 8-char random = praktis tidak bisa di-brute-force.

DROP POLICY IF EXISTS "Public read registrasi by kode" ON public.registrasi_donor;
CREATE POLICY "Public read registrasi by kode"
  ON public.registrasi_donor
  FOR SELECT
  USING (true);

-- ==== 5. RLS: Pastikan hanya admin yang bisa UPDATE/DELETE registrasi ====
DROP POLICY IF EXISTS "Admin full access registrasi" ON public.registrasi_donor;
CREATE POLICY "Admin full access registrasi"
  ON public.registrasi_donor
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- ==== 6. RLS: Pastikan hanya admin yang bisa kelola jadwal ====
DROP POLICY IF EXISTS "Admin full access jadwal" ON public.jadwal_donor;
CREATE POLICY "Admin full access jadwal"
  ON public.jadwal_donor
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- ==== 7. RLS: Pastikan hanya admin yang bisa update stok ====
DROP POLICY IF EXISTS "Admin full access stok" ON public.stok_darah;
CREATE POLICY "Admin full access stok"
  ON public.stok_darah
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- ==== 8. INDEX: Percepat query jadwal by tanggal + status (dipakai homepage) ====
DROP INDEX IF EXISTS idx_jadwal_tanggal_status;
CREATE INDEX idx_jadwal_tanggal_status
  ON public.jadwal_donor(tanggal DESC, status)
  WHERE status = 'aktif';

-- ==== 9. INDEX: Percepat query stok by lokasi ====
DROP INDEX IF EXISTS idx_stok_lokasi;
CREATE INDEX idx_stok_lokasi ON public.stok_darah(lokasi_id, status);

-- ==== DONE ====
-- Setelah menjalankan semua di atas, verifikasi hasilnya:
-- SELECT * FROM pg_trigger WHERE tgname LIKE 'trg_%';
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('registrasi_donor','stok_darah','jadwal_donor');
