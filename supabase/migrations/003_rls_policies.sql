-- 003_rls_policies.sql — Row Level Security per tabel & role.

-- ── FUNCTION: Role checker untuk admin level ─────────────────

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;

-- ── ADMINS ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full admins" ON admins;
CREATE POLICY "Admin full admins"
  ON admins FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── LOKASI DONOR ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full lokasi" ON lokasi_donor;
DROP POLICY IF EXISTS "Public read lokasi aktif" ON lokasi_donor;

CREATE POLICY "Public read lokasi aktif"
  ON lokasi_donor FOR SELECT
  TO anon, authenticated
  USING (aktif = true);

CREATE POLICY "Admin full lokasi"
  ON lokasi_donor FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── KOMPONEN DARAH ────────────────────────────────────────────

DROP POLICY IF EXISTS "Public read komponen" ON komponen_darah;
CREATE POLICY "Public read komponen"
  ON komponen_darah FOR SELECT
  TO anon, authenticated
  USING (aktif = true);

-- ── JADWAL DONOR ──────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin full access jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Public read jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Staff read jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin insert jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin update jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin delete jadwal" ON jadwal_donor;

CREATE POLICY "Public read jadwal"
  ON jadwal_donor FOR SELECT
  TO anon, authenticated
  USING (status = ANY (ARRAY['aktif'::jadwal_status, 'penuh'::jadwal_status]));

CREATE POLICY "Staff read jadwal"
  ON jadwal_donor FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin insert jadwal"
  ON jadwal_donor FOR INSERT
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admin update jadwal"
  ON jadwal_donor FOR UPDATE
  USING (is_admin_or_superadmin());

CREATE POLICY "Admin delete jadwal"
  ON jadwal_donor FOR DELETE
  USING (is_admin_or_superadmin());

-- ── REGISTRASI DONOR ──────────────────────────────────────────

DROP POLICY IF EXISTS "Public bisa baca registrasi by kode" ON registrasi_donor;
DROP POLICY IF EXISTS "Public read registrasi by kode" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin full access registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Public insert registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Staff read registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin modify registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin delete registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Staff update kehadiran" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin read registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin update registrasi" ON registrasi_donor;

CREATE POLICY "Public insert registrasi"
  ON registrasi_donor FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff read registrasi"
  ON registrasi_donor FOR SELECT
  USING (is_admin());

CREATE POLICY "Staff update kehadiran"
  ON registrasi_donor FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin modify registrasi"
  ON registrasi_donor FOR UPDATE
  USING (is_admin_or_superadmin());

CREATE POLICY "Admin delete registrasi"
  ON registrasi_donor FOR DELETE
  USING (is_admin_or_superadmin());

-- ── PENCATATAN DONOR ──────────────────────────────────────────

DROP POLICY IF EXISTS "Admins read pencatatan" ON pencatatan_donor;
DROP POLICY IF EXISTS "Admins insert pencatatan" ON pencatatan_donor;
DROP POLICY IF EXISTS "Admin full pencatatan" ON pencatatan_donor;

CREATE POLICY "Admins read pencatatan"
  ON pencatatan_donor FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins insert pencatatan"
  ON pencatatan_donor FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admin full pencatatan"
  ON pencatatan_donor FOR ALL
  USING (is_admin_or_superadmin());

-- ── STOK DARAH ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin full access stok" ON stok_darah;
DROP POLICY IF EXISTS "Public read stok" ON stok_darah;
DROP POLICY IF EXISTS "Staff read stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin insert stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin update stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin delete stok" ON stok_darah;

CREATE POLICY "Public read stok"
  ON stok_darah FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Staff read stok"
  ON stok_darah FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin insert stok"
  ON stok_darah FOR INSERT
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admin update stok"
  ON stok_darah FOR UPDATE
  USING (is_admin_or_superadmin());

CREATE POLICY "Admin delete stok"
  ON stok_darah FOR DELETE
  USING (is_admin_or_superadmin());

-- ── STOK DARAH HISTORY ────────────────────────────────────────

DROP POLICY IF EXISTS "Admin read stok history" ON stok_darah_history;
CREATE POLICY "Admin read stok history"
  ON stok_darah_history FOR SELECT
  USING (is_admin());

-- ── KATEGORI ARTIKEL ──────────────────────────────────────────

DROP POLICY IF EXISTS "Public read kategori" ON kategori_artikel;
CREATE POLICY "Public read kategori"
  ON kategori_artikel FOR SELECT
  TO anon, authenticated
  USING (true);

-- ── ARTIKEL ───────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full artikel" ON artikel;
DROP POLICY IF EXISTS "Public read artikel published" ON artikel;

CREATE POLICY "Public read artikel published"
  ON artikel FOR SELECT
  TO anon, authenticated
  USING (status = 'published'::artikel_status);

CREATE POLICY "Admin full artikel"
  ON artikel FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── TESTIMONIAL ───────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full testimonial" ON testimonial;
DROP POLICY IF EXISTS "Public read testimonial" ON testimonial;

CREATE POLICY "Public read testimonial"
  ON testimonial FOR SELECT
  TO anon, authenticated
  USING (aktif = true);

CREATE POLICY "Admin full testimonial"
  ON testimonial FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── PENGUMUMAN ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full pengumuman" ON pengumuman;
DROP POLICY IF EXISTS "Public read pengumuman" ON pengumuman;

CREATE POLICY "Public read pengumuman"
  ON pengumuman FOR SELECT
  TO anon, authenticated
  USING (
    aktif = true
    AND tanggal_mulai <= CURRENT_DATE
    AND tanggal_selesai >= CURRENT_DATE
  );

CREATE POLICY "Admin full pengumuman"
  ON pengumuman FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── FAQ ───────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin full faq" ON faq;
DROP POLICY IF EXISTS "Public read faq" ON faq;

CREATE POLICY "Public read faq"
  ON faq FOR SELECT
  TO anon, authenticated
  USING (aktif = true);

CREATE POLICY "Admin full faq"
  ON faq FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── ADMIN LOG ─────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin read log" ON admin_log;
CREATE POLICY "Admin read log"
  ON admin_log FOR SELECT
  USING (is_admin());

-- ── PENGATURAN ────────────────────────────────────────────────

DROP POLICY IF EXISTS "Admin read pengaturan" ON pengaturan;
DROP POLICY IF EXISTS "Superadmin update pengaturan" ON pengaturan;

CREATE POLICY "Admin read pengaturan"
  ON pengaturan FOR SELECT
  USING (is_admin());

CREATE POLICY "Superadmin update pengaturan"
  ON pengaturan FOR UPDATE
  USING (get_admin_role() = 'superadmin'::admin_role)
  WITH CHECK (get_admin_role() = 'superadmin'::admin_role);
