-- Migration 10: Donor-facing cancellation (Batalkan Pendaftaran)
--
-- Memberikan kemampuan bagi pendonor untuk membatalkan registrasinya
-- sendiri melalui halaman status registrasi (/registrasi/[kode]).
--
-- Cara kerja:
--   1. Anon memanggil batalkan_registrasi_by_kode(p_kode)
--   2. Fungsi SECURITY DEFINER memverifikasi bahwa kode valid
--      dan status masih bisa dibatalkan (pending/confirmed)
--   3. Update status menjadi 'dibatalkan'
--   4. Trigger trg_registrasi_kuota otomatis menambah sisa_kuota
--      dan mengubah status jadwal kembali ke 'aktif' jika penuh
--
-- Keamanan:
--   - Tidak ada parameter identitas lain (seperti telepon/NIK) yang
--     diperlukan — kepemilikan kode_registrasi sudah cukup karena
--     kode bersifat unik dan rahasia (hanya diketahui pendaftar)
--   - GRANT EXECUTE TO anon agar bisa dipanggil dari client-side
--   - Tidak bisa membatalkan registrasi yang sudah hadir/tidak_hadir


-- Hapus fungsi lama jika ada (misal dari percobaan sebelumnya)
DROP FUNCTION IF EXISTS public.batalkan_registrasi_by_kode(text);

CREATE OR REPLACE FUNCTION public.batalkan_registrasi_by_kode(p_kode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_jadwal_tanggal date;
  result jsonb;
BEGIN
  -- Validasi input: minimal 8 karakter
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak valid.');
  END IF;

  -- Cek status dan tanggal jadwal
  SELECT r.status, j.tanggal INTO v_status, v_jadwal_tanggal
  FROM registrasi_donor r
  JOIN jadwal_donor j ON j.id = r.jadwal_id
  WHERE r.kode_registrasi = upper(trim(p_kode));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak ditemukan.');
  END IF;

  -- Cek apakah sudah lewat (jadwal sudah berlalu)
  IF v_jadwal_tanggal < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tidak bisa membatalkan registrasi yang sudah lewat.');
  END IF;

  -- Cek apakah status masih bisa dibatalkan
  IF v_status NOT IN ('pending', 'confirmed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Registrasi dengan status "' || v_status || '" tidak bisa dibatalkan.'
    );
  END IF;

  -- Lakukan pembatalan
  UPDATE registrasi_donor
  SET status = 'dibatalkan', updated_at = now()
  WHERE kode_registrasi = upper(trim(p_kode))
    AND status IN ('pending', 'confirmed');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gagal membatalkan registrasi. Coba lagi.');
  END IF;

  RETURN jsonb_build_object('success', true, 'error', null);
END;
$$;

-- Grant execute ke anon (public) + authenticated
GRANT EXECUTE ON FUNCTION public.batalkan_registrasi_by_kode(text) TO anon;
GRANT EXECUTE ON FUNCTION public.batalkan_registrasi_by_kode(text) TO authenticated;

COMMENT ON FUNCTION public.batalkan_registrasi_by_kode IS 'Membatalkan registrasi donor berdasarkan kode registrasi (hanya untuk status pending/confirmed, dan jadwal belum lewat)';
