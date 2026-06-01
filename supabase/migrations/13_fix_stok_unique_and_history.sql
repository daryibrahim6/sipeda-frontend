-- Migration 13: Fix stok_darah unique constraint + lookup_donor_history count
--
-- 1. Stok darah: tambah UNIQUE constraint (lokasi_id, komponen_id, golongan_darah)
--    yang diperlukan oleh migration 12 (auto-increase stock trigger).
--    Tanpa constraint ini, INSERT ... ON CONFLICT akan membuat baris duplikat.
--
-- 2. lookup_donor_history: ubah COUNT donor berhasil dari pencocokan
--    nama_pendonor (text, bisa duplikat) menjadi JOIN via registrasi_id
--    (foreign key, akurat per individu). Fallback ke nama jika registrasi_id NULL
--    (untuk data lama sebelum kolom ini diisi).


-- ═══════════════════════════════════════════════════════════════
-- 1. UNIQUE constraint for stok_darah
-- ═══════════════════════════════════════════════════════════════

-- Gunakan unique index (bukan constraint) agar ON CONFLICT bisa dipakai
-- di migration 12. Index juga lebih ringan daripada constraint,
-- tidak perlu validasi ulang baris existing.
CREATE UNIQUE INDEX IF NOT EXISTS uq_stok_lokasi_komponen_golongan
  ON public.stok_darah (lokasi_id, komponen_id, golongan_darah);


-- ═══════════════════════════════════════════════════════════════
-- 2. Fix lookup_donor_history — count via registrasi_id
-- ═══════════════════════════════════════════════════════════════

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
    RETURN NULL;
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

  -- Step 3: Hitung donor berhasil — prioritaskan registrasi_id (akurat),
  -- fallback ke nama_pendonor (untuk data lama yang belum punya registrasi_id)
  SELECT COUNT(*)
  INTO v_total_berhasil
  FROM pencatatan_donor p
  WHERE p.status_donor = 'berhasil'
    AND (
      (p.registrasi_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM registrasi_donor r
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
