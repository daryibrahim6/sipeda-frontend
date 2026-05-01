-- ============================================================
-- SIPEDA — FIX P-09: Perketat RLS per Role
--
-- MASALAH:
-- Tabel jadwal_donor dan stok_darah menggunakan policy "FOR ALL"
-- yang hanya cek apakah user ada di tabel admins.
-- Ini berarti petugas_lapangan bisa:
--   - Membuat/menghapus jadwal donor (seharusnya admin only)
--   - Mengubah stok darah (seharusnya admin only)
--
-- PERBAIKAN:
-- Pecah "FOR ALL" menjadi policies terpisah:
--   - SELECT: semua staff (termasuk petugas)
--   - INSERT/UPDATE/DELETE: hanya admin dan superadmin
--
-- Model: mengikuti pola pencatatan_donor (02_pencatatan_schema.sql)
--        yang sudah benar dari awal.
--
-- Jalankan di: Supabase Dashboard → SQL Editor
-- ============================================================

BEGIN;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  1. JADWAL_DONOR — Pecah dari "FOR ALL" ke per-operation  ║
-- ╚════════════════════════════════════════════════════════════╝

-- Hapus policy lama yang terlalu permissive
DROP POLICY IF EXISTS "Admin full access jadwal" ON public.jadwal_donor;

-- 1a. SELECT: Semua staff bisa lihat jadwal
-- (publik juga bisa lihat jadwal aktif via policy public yang sudah ada)
CREATE POLICY "Staff read jadwal"
  ON public.jadwal_donor
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- 1b. INSERT: Hanya admin dan superadmin bisa buat jadwal
CREATE POLICY "Admin insert jadwal"
  ON public.jadwal_donor
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- 1c. UPDATE: Hanya admin dan superadmin bisa update jadwal
CREATE POLICY "Admin update jadwal"
  ON public.jadwal_donor
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- 1d. DELETE: Hanya admin dan superadmin bisa hapus jadwal
CREATE POLICY "Admin delete jadwal"
  ON public.jadwal_donor
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );


-- ╔════════════════════════════════════════════════════════════╗
-- ║  2. STOK_DARAH — Pecah dari "FOR ALL" ke per-operation    ║
-- ╚════════════════════════════════════════════════════════════╝

-- Hapus policy lama
DROP POLICY IF EXISTS "Admin full access stok" ON public.stok_darah;

-- 2a. SELECT: Semua staff bisa lihat stok
-- (publik juga bisa lihat via policy public yang sudah ada)
CREATE POLICY "Staff read stok"
  ON public.stok_darah
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- 2b. INSERT: Hanya admin/superadmin
CREATE POLICY "Admin insert stok"
  ON public.stok_darah
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- 2c. UPDATE: Hanya admin/superadmin
CREATE POLICY "Admin update stok"
  ON public.stok_darah
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- 2d. DELETE: Hanya admin/superadmin
CREATE POLICY "Admin delete stok"
  ON public.stok_darah
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );


-- ╔════════════════════════════════════════════════════════════╗
-- ║  3. VERIFIKASI                                            ║
-- ╚════════════════════════════════════════════════════════════╝

-- Cek semua policies pada tabel yang diubah
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename IN ('jadwal_donor', 'stok_darah')
ORDER BY tablename, policyname;

COMMIT;

-- ============================================================
-- EXPECTED RESULTS:
--
-- jadwal_donor:
--   - Staff read jadwal (SELECT) → semua admins
--   - Admin insert jadwal (INSERT) → admin, superadmin
--   - Admin update jadwal (UPDATE) → admin, superadmin
--   - Admin delete jadwal (DELETE) → admin, superadmin
--   + Public read policies (jika ada) tetap ada
--
-- stok_darah:
--   - Staff read stok (SELECT) → semua admins
--   - Admin insert stok (INSERT) → admin, superadmin
--   - Admin update stok (UPDATE) → admin, superadmin
--   - Admin delete stok (DELETE) → admin, superadmin
--   + Public read policies (jika ada) tetap ada
--
-- VERIFIKASI MANUAL:
-- Login sebagai petugas_lapangan → coba update jadwal → harus DITOLAK
-- Login sebagai admin → coba update jadwal → harus BERHASIL
-- ============================================================
