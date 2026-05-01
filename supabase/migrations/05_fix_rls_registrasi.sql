-- ============================================================
-- SIPEDA — FIX: RLS registrasi_donor
-- MASALAH: USING (true) memungkinkan siapa pun baca SEMUA data
-- SOLUSI: Lock down RLS + buat RPC functions SECURITY DEFINER
--
-- Jalankan di: Supabase Dashboard → SQL Editor → New query
-- Jalankan SELURUH file sekaligus (satu transaksi)
-- ============================================================

BEGIN;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 1: Hapus policy lama yang terlalu terbuka           ║
-- ╚════════════════════════════════════════════════════════════╝

DROP POLICY IF EXISTS "Public read registrasi by kode" ON public.registrasi_donor;

-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 2: Buat policy baru yang ketat                      ║
-- ╚════════════════════════════════════════════════════════════╝

-- 2a. PUBLIC SELECT: BLOKIR SEMUA
-- Anon users tidak boleh query tabel ini secara langsung.
-- Semua akses publik diarahkan ke RPC functions (Step 3).
--
-- CATATAN: Jangan buat policy SELECT untuk role 'anon'.
-- Tanpa policy = default deny (karena RLS sudah ENABLED).

-- 2b. PUBLIC INSERT: Izinkan siapa pun mendaftar donor
-- (policy ini mungkin sudah ada, buat ulang untuk memastikan)
DROP POLICY IF EXISTS "Public insert registrasi" ON public.registrasi_donor;
CREATE POLICY "Public insert registrasi"
  ON public.registrasi_donor
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2c. ADMIN/PETUGAS SELECT: Hanya user yang terdaftar di tabel admins
DROP POLICY IF EXISTS "Staff read registrasi" ON public.registrasi_donor;
CREATE POLICY "Staff read registrasi"
  ON public.registrasi_donor
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );

-- 2d. ADMIN UPDATE/DELETE: Hanya admin dan superadmin
-- (petugas_lapangan hanya boleh UPDATE status_kehadiran via policy 2e)
DROP POLICY IF EXISTS "Admin full access registrasi" ON public.registrasi_donor;
CREATE POLICY "Admin modify registrasi"
  ON public.registrasi_donor
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

DROP POLICY IF EXISTS "Admin delete registrasi" ON public.registrasi_donor;
CREATE POLICY "Admin delete registrasi"
  ON public.registrasi_donor
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'superadmin')
    )
  );

-- 2e. PETUGAS UPDATE: Hanya boleh update status_kehadiran
-- Petugas perlu bisa markRegistrasiHadir(), tapi tidak boleh edit field lain.
-- Catatan: RLS tidak bisa membatasi per-kolom, jadi kita izinkan UPDATE
-- untuk semua staff. Pembatasan per-kolom dilakukan di application layer.
DROP POLICY IF EXISTS "Staff update kehadiran" ON public.registrasi_donor;
CREATE POLICY "Staff update kehadiran"
  ON public.registrasi_donor
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admins
      WHERE auth_user_id = auth.uid()
    )
  );


-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 3: RPC Functions — SECURITY DEFINER                ║
-- ║  Bypass RLS tapi enforce akses lewat parameter            ║
-- ╚════════════════════════════════════════════════════════════╝

-- ────────────────────────────────────────────────────────────
-- 3a. lookup_registrasi_by_kode
-- Use case: Halaman /registrasi/[kode] — cek status registrasi
-- Input: kode_registrasi (string)
-- Output: data registrasi + jadwal + lokasi (1 row)
-- Keamanan: Hanya return data yang cocok dengan kode exact match
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.lookup_registrasi_by_kode(p_kode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Validasi input: minimal 8 karakter, harus dimulai dengan REG-
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'kode_registrasi', r.kode_registrasi,
    'nama', r.nama,
    'status', r.status,
    'jadwal', jsonb_build_object(
      'tanggal', j.tanggal,
      'waktu_mulai', j.waktu_mulai,
      'waktu_selesai', j.waktu_selesai,
      'lokasi', jsonb_build_object(
        'nama_lokasi', l.nama_lokasi,
        'alamat', l.alamat,
        'kecamatan', l.kecamatan
      )
    )
  )
  INTO result
  FROM registrasi_donor r
  JOIN jadwal_donor j ON j.id = r.jadwal_id
  JOIN lokasi_donor l ON l.id = j.lokasi_id
  WHERE r.kode_registrasi = upper(trim(p_kode));

  -- Sengaja TIDAK return telepon, NIK, email, alamat
  -- Hanya data yang perlu ditampilkan di halaman status
  RETURN result;
END;
$$;

-- Grant execute ke anon (public users)
GRANT EXECUTE ON FUNCTION public.lookup_registrasi_by_kode(text) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_registrasi_by_kode(text) TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 3b. lookup_donor_history
-- Use case: Halaman /riwayat — lihat semua riwayat donor
-- Input: telepon + kode_registrasi (sebagai verifikasi identitas)
-- Output: profil + semua registrasi untuk telepon tersebut
-- Keamanan: Kode harus cocok dengan telepon (two-factor lookup)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.lookup_donor_history(
  p_telepon text,
  p_kode text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_verify record;
  v_registrasi jsonb;
  v_total_berhasil int;
BEGIN
  -- Validasi input
  IF p_telepon IS NULL OR length(trim(p_telepon)) < 8 THEN
    RETURN NULL;
  END IF;
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN NULL;
  END IF;

  -- Step 1: Verifikasi — kode harus milik telepon ini
  SELECT id, nama, telepon, golongan_darah
  INTO v_verify
  FROM registrasi_donor
  WHERE telepon = trim(p_telepon)
    AND kode_registrasi = upper(trim(p_kode));

  IF v_verify IS NULL THEN
    RETURN NULL;  -- Verifikasi gagal, tidak bocorkan data apapun
  END IF;

  -- Step 2: Ambil semua registrasi untuk telepon ini
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
  FROM registrasi_donor r
  LEFT JOIN jadwal_donor j ON j.id = r.jadwal_id
  LEFT JOIN lokasi_donor l ON l.id = j.lokasi_id
  WHERE r.telepon = trim(p_telepon);

  -- Step 3: Hitung donor berhasil dari pencatatan
  SELECT COUNT(*)
  INTO v_total_berhasil
  FROM pencatatan_donor
  WHERE nama_pendonor = v_verify.nama
    AND status_donor = 'berhasil';

  RETURN jsonb_build_object(
    'nama', v_verify.nama,
    'telepon', v_verify.telepon,
    'golongan_darah', v_verify.golongan_darah,
    'registrasi', COALESCE(v_registrasi, '[]'::jsonb),
    'total_donor_berhasil', v_total_berhasil
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_donor_history(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_donor_history(text, text) TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 3c. count_registrasi_bulan_ini
-- Use case: Admin dashboard stats (registrasi_bulan_ini)
-- Saat ini getDashboardStats() query langsung dengan anon client.
-- Fungsi ini mengembalikan count saja, tanpa data.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.count_registrasi_bulan_ini()
RETURNS int
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::int
  FROM registrasi_donor
  WHERE created_at >= date_trunc('month', CURRENT_DATE);
$$;

GRANT EXECUTE ON FUNCTION public.count_registrasi_bulan_ini() TO anon;
GRANT EXECUTE ON FUNCTION public.count_registrasi_bulan_ini() TO authenticated;


-- ╔════════════════════════════════════════════════════════════╗
-- ║  STEP 4: Verifikasi                                       ║
-- ╚════════════════════════════════════════════════════════════╝

-- Cek semua policy yang aktif pada registrasi_donor
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'registrasi_donor'
ORDER BY policyname;

-- Cek functions yang baru dibuat
SELECT proname, prosecdef
FROM pg_proc
WHERE proname IN (
  'lookup_registrasi_by_kode',
  'lookup_donor_history',
  'count_registrasi_bulan_ini'
);

COMMIT;

-- ============================================================
-- CATATAN PENTING:
--
-- Setelah menjalankan SQL ini, Anda HARUS update kode frontend:
--   1. src/lib/api.ts — getRegistrasiByKode() → pakai supabase.rpc()
--   2. src/lib/api.ts — lookupDonorHistory() → pakai supabase.rpc()
--   3. src/lib/api.ts — getDashboardStats() → pakai supabase.rpc()
--
-- Lihat file api.ts untuk perubahan yang diperlukan.
-- ============================================================
