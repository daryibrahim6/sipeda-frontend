-- ============================================================
-- SIPEDA — Security Hardening (009)
-- FORCE RLS, TO clause fixes, WITH CHECK fixes, search_path
-- ============================================================

-- ── 1. FORCE ROW LEVEL SECURITY ─────────────────────────────
-- Mencegah postgres (table owner) bypass RLS

ALTER TABLE admins               FORCE ROW LEVEL SECURITY;
ALTER TABLE lokasi_donor         FORCE ROW LEVEL SECURITY;
ALTER TABLE komponen_darah       FORCE ROW LEVEL SECURITY;
ALTER TABLE jadwal_donor         FORCE ROW LEVEL SECURITY;
ALTER TABLE registrasi_donor     FORCE ROW LEVEL SECURITY;
ALTER TABLE pencatatan_donor     FORCE ROW LEVEL SECURITY;
ALTER TABLE stok_darah           FORCE ROW LEVEL SECURITY;
ALTER TABLE stok_darah_history   FORCE ROW LEVEL SECURITY;
ALTER TABLE kategori_artikel     FORCE ROW LEVEL SECURITY;
ALTER TABLE artikel              FORCE ROW LEVEL SECURITY;
ALTER TABLE testimonial          FORCE ROW LEVEL SECURITY;
ALTER TABLE pengumuman           FORCE ROW LEVEL SECURITY;
ALTER TABLE faq                  FORCE ROW LEVEL SECURITY;
ALTER TABLE admin_log            FORCE ROW LEVEL SECURITY;
ALTER TABLE pengaturan           FORCE ROW LEVEL SECURITY;
ALTER TABLE cabang               FORCE ROW LEVEL SECURITY;

-- ── 2. FIX ADMIN POLICIES — tambah TO authenticated ──────────
-- Semua policy yang pakai is_admin() / is_admin_or_superadmin()
-- harus TO authenticated agar tidak dievaluasi untuk anon.

-- ADMINS
DROP POLICY IF EXISTS "Admin full admins" ON admins;
CREATE POLICY "Admin full admins"
  ON admins FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- JADWAL DONOR
DROP POLICY IF EXISTS "Staff read jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin insert jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin update jadwal" ON jadwal_donor;
DROP POLICY IF EXISTS "Admin delete jadwal" ON jadwal_donor;

CREATE POLICY "Staff read jadwal"
  ON jadwal_donor FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin insert jadwal"
  ON jadwal_donor FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admin update jadwal"
  ON jadwal_donor FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin());

CREATE POLICY "Admin delete jadwal"
  ON jadwal_donor FOR DELETE
  TO authenticated
  USING (is_admin_or_superadmin());

-- REGISTRASI DONOR
DROP POLICY IF EXISTS "Staff read registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Staff update kehadiran" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin modify registrasi" ON registrasi_donor;
DROP POLICY IF EXISTS "Admin delete registrasi" ON registrasi_donor;

CREATE POLICY "Staff read registrasi"
  ON registrasi_donor FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Staff update kehadiran"
  ON registrasi_donor FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin modify registrasi"
  ON registrasi_donor FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin());

CREATE POLICY "Admin delete registrasi"
  ON registrasi_donor FOR DELETE
  TO authenticated
  USING (is_admin_or_superadmin());

-- PENCATATAN DONOR
DROP POLICY IF EXISTS "Admins read pencatatan" ON pencatatan_donor;
DROP POLICY IF EXISTS "Admins insert pencatatan" ON pencatatan_donor;
DROP POLICY IF EXISTS "Admin full pencatatan" ON pencatatan_donor;

CREATE POLICY "Admins read pencatatan"
  ON pencatatan_donor FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins insert pencatatan"
  ON pencatatan_donor FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin full pencatatan"
  ON pencatatan_donor FOR ALL
  TO authenticated
  USING (is_admin_or_superadmin());

-- STOK DARAH
DROP POLICY IF EXISTS "Staff read stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin insert stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin update stok" ON stok_darah;
DROP POLICY IF EXISTS "Admin delete stok" ON stok_darah;

CREATE POLICY "Staff read stok"
  ON stok_darah FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin insert stok"
  ON stok_darah FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admin update stok"
  ON stok_darah FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin())
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Admin delete stok"
  ON stok_darah FOR DELETE
  TO authenticated
  USING (is_admin_or_superadmin());

-- STOK DARAH HISTORY
DROP POLICY IF EXISTS "Admin read stok history" ON stok_darah_history;
CREATE POLICY "Admin read stok history"
  ON stok_darah_history FOR SELECT
  TO authenticated
  USING (is_admin());

-- ARTIKEL
DROP POLICY IF EXISTS "Admin full artikel" ON artikel;
CREATE POLICY "Admin full artikel"
  ON artikel FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- TESTIMONIAL
DROP POLICY IF EXISTS "Admin full testimonial" ON testimonial;
CREATE POLICY "Admin full testimonial"
  ON testimonial FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- PENGUMUMAN
DROP POLICY IF EXISTS "Admin full pengumuman" ON pengumuman;
CREATE POLICY "Admin full pengumuman"
  ON pengumuman FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- FAQ
DROP POLICY IF EXISTS "Admin full faq" ON faq;
CREATE POLICY "Admin full faq"
  ON faq FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ADMIN LOG
DROP POLICY IF EXISTS "Admin read log" ON admin_log;
CREATE POLICY "Admin read log"
  ON admin_log FOR SELECT
  TO authenticated
  USING (is_admin());

-- PENGATURAN
DROP POLICY IF EXISTS "Admin read pengaturan" ON pengaturan;
DROP POLICY IF EXISTS "Superadmin update pengaturan" ON pengaturan;

CREATE POLICY "Admin read pengaturan"
  ON pengaturan FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Superadmin update pengaturan"
  ON pengaturan FOR UPDATE
  TO authenticated
  USING (get_admin_role() = 'superadmin'::admin_role)
  WITH CHECK (get_admin_role() = 'superadmin'::admin_role);

-- CABANG (dari migration 005)
DROP POLICY IF EXISTS "Admin read cabang" ON cabang;
DROP POLICY IF EXISTS "Superadmin insert cabang" ON cabang;
DROP POLICY IF EXISTS "Superadmin update cabang" ON cabang;
DROP POLICY IF EXISTS "Superadmin delete cabang" ON cabang;

CREATE POLICY "Admin read cabang"
  ON cabang FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Superadmin insert cabang"
  ON cabang FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Superadmin update cabang"
  ON cabang FOR UPDATE
  TO authenticated
  USING (is_admin_or_superadmin())
  WITH CHECK (is_admin_or_superadmin());

CREATE POLICY "Superadmin delete cabang"
  ON cabang FOR DELETE
  TO authenticated
  USING (is_admin_or_superadmin());

-- ── 3. FIX SECURITY DEFINER RPC — search_path = '' ──────────
-- Mencegah search-path injection pada function yang dipanggil anon.
-- Migration 008 sudah melakukannya untuk log_stok_history.

CREATE OR REPLACE FUNCTION public.lookup_registrasi_by_kode(p_kode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result jsonb;
BEGIN
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'kode_registrasi', r.kode_registrasi,
    'nama', r.nama,
    'status', r.status,
    'status_kehadiran', r.status_kehadiran,
    'golongan_darah', r.golongan_darah,
    'created_at', r.created_at,
    'jadwal', jsonb_build_object(
      'tanggal', j.tanggal,
      'waktu_mulai', j.waktu_mulai,
      'waktu_selesai', j.waktu_selesai,
      'kuota', j.kuota,
      'sisa_kuota', j.sisa_kuota,
      'status', j.status,
      'lokasi', jsonb_build_object(
        'nama_lokasi', l.nama_lokasi,
        'alamat', l.alamat,
        'kecamatan', l.kecamatan
      )
    )
  )
  INTO result
  FROM public.registrasi_donor r
  JOIN public.jadwal_donor j ON j.id = r.jadwal_id
  JOIN public.lokasi_donor l ON l.id = j.lokasi_id
  WHERE r.kode_registrasi = upper(trim(p_kode));

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.lookup_donor_history(
  p_telepon text,
  p_kode text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_verify record;
  v_registrasi jsonb;
  v_total_berhasil int;
BEGIN
  IF p_telepon IS NULL OR length(trim(p_telepon)) < 8 THEN RETURN NULL; END IF;
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN RETURN NULL; END IF;

  SELECT id, nama, telepon, golongan_darah
  INTO v_verify
  FROM public.registrasi_donor
  WHERE telepon = trim(p_telepon)
    AND kode_registrasi = upper(trim(p_kode));

  IF v_verify IS NULL THEN RETURN NULL; END IF;

  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'kode_registrasi', r.kode_registrasi,
      'nama', r.nama,
      'telepon', r.telepon,
      'golongan_darah', r.golongan_darah,
      'status', r.status,
      'status_kehadiran', r.status_kehadiran,
      'created_at', r.created_at,
      'jadwal', CASE WHEN j.id IS NOT NULL THEN
        jsonb_build_object(
          'id', j.id,
          'tanggal', j.tanggal,
          'waktu_mulai', j.waktu_mulai,
          'waktu_selesai', j.waktu_selesai,
          'status', j.status,
          'lokasi', jsonb_build_object(
            'nama_lokasi', l.nama_lokasi,
            'kecamatan', l.kecamatan
          )
        )
        ELSE NULL
      END
    )
    ORDER BY r.created_at DESC
  )
  INTO v_registrasi
  FROM public.registrasi_donor r
  LEFT JOIN public.jadwal_donor j ON j.id = r.jadwal_id
  LEFT JOIN public.lokasi_donor l ON l.id = j.lokasi_id
  WHERE r.telepon = trim(p_telepon);

  SELECT COUNT(*)
  INTO v_total_berhasil
  FROM public.pencatatan_donor p
  WHERE p.status_donor = 'berhasil'
    AND (
      (p.registrasi_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.registrasi_donor r
        WHERE r.id = p.registrasi_id AND r.telepon = trim(p_telepon)
      ))
      OR
      (p.registrasi_id IS NULL AND p.nama_pendonor = v_verify.nama)
    );

  RETURN jsonb_build_object(
    'nama', v_verify.nama,
    'telepon', v_verify.telepon,
    'golongan_darah', v_verify.golongan_darah,
    'registrasi', COALESCE(v_registrasi, '[]'::jsonb),
    'total_donor_berhasil', v_total_berhasil
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.batalkan_registrasi_by_kode(p_kode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status text;
  v_jadwal_tanggal date;
  result jsonb;
BEGIN
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak valid.');
  END IF;

  SELECT r.status, j.tanggal INTO v_status, v_jadwal_tanggal
  FROM public.registrasi_donor r
  JOIN public.jadwal_donor j ON j.id = r.jadwal_id
  WHERE r.kode_registrasi = upper(trim(p_kode));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak ditemukan.');
  END IF;

  IF v_jadwal_tanggal < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tidak bisa membatalkan registrasi yang sudah lewat.');
  END IF;

  IF v_status NOT IN ('pending', 'confirmed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Registrasi dengan status "' || v_status || '" tidak bisa dibatalkan.'
    );
  END IF;

  UPDATE public.registrasi_donor
  SET status = 'dibatalkan', updated_at = now()
  WHERE kode_registrasi = upper(trim(p_kode))
    AND status IN ('pending', 'confirmed');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gagal membatalkan registrasi. Coba lagi.');
  END IF;

  RETURN jsonb_build_object('success', true, 'error', null);
END;
$$;

CREATE OR REPLACE FUNCTION public.count_registrasi_bulan_ini()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COUNT(*)::int
  FROM public.registrasi_donor
  WHERE created_at >= date_trunc('month', CURRENT_DATE);
$$;
