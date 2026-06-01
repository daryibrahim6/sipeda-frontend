-- ============================================================
-- SIPEDA — Views & RPC Functions (004)
-- View untuk dashboard dan RPC untuk akses publik yang aman.
-- ============================================================

-- ── VIEWS ─────────────────────────────────────────────────────

DROP VIEW IF EXISTS v_pengumuman_aktif;
CREATE VIEW v_pengumuman_aktif WITH (security_invoker = true) AS
SELECT *
FROM pengumuman
WHERE aktif = true
  AND tanggal_mulai <= CURRENT_DATE
  AND tanggal_selesai >= CURRENT_DATE
ORDER BY created_at DESC;

DROP VIEW IF EXISTS v_stats;
CREATE VIEW v_stats WITH (security_invoker = true) AS
SELECT
  COALESCE(SUM(sd.jumlah), 0)::int AS total_stok,
  (SELECT COUNT(*) FROM lokasi_donor WHERE aktif = true)::int AS lokasi_aktif,
  (SELECT COUNT(*) FROM jadwal_donor WHERE status = 'aktif' AND tanggal >= CURRENT_DATE)::int AS jadwal_aktif,
  COUNT(DISTINCT CASE WHEN sd.status IN ('kritis', 'kosong') THEN sd.golongan_darah END)::int AS total_stok_kritis
FROM stok_darah sd;

DROP VIEW IF EXISTS v_rekap_pencatatan;
CREATE VIEW v_rekap_pencatatan WITH (security_invoker = true) AS
SELECT
  pd.jadwal_id,
  jd.tanggal,
  jd.waktu_mulai,
  jd.waktu_selesai,
  ld.nama_lokasi,
  COUNT(*)::int AS total_catat,
  COUNT(*) FILTER (WHERE pd.status_donor = 'berhasil')::int AS berhasil,
  COUNT(*) FILTER (WHERE pd.status_donor = 'gagal')::int AS gagal,
  COUNT(*) FILTER (WHERE pd.status_donor = 'tidak_memenuhi_syarat')::int AS tidak_memenuhi
FROM pencatatan_donor pd
JOIN jadwal_donor jd ON jd.id = pd.jadwal_id
JOIN lokasi_donor ld ON ld.id = jd.lokasi_id
GROUP BY pd.jadwal_id, jd.tanggal, jd.waktu_mulai, jd.waktu_selesai, ld.nama_lokasi
ORDER BY jd.tanggal DESC, jd.waktu_mulai DESC;

-- ── RPC: lookup_registrasi_by_kode ────────────────────────────

CREATE OR REPLACE FUNCTION public.lookup_registrasi_by_kode(p_kode text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  FROM registrasi_donor r
  JOIN jadwal_donor j ON j.id = r.jadwal_id
  JOIN lokasi_donor l ON l.id = j.lokasi_id
  WHERE r.kode_registrasi = upper(trim(p_kode));

  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_registrasi_by_kode(text) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_registrasi_by_kode(text) TO authenticated;

-- ── RPC: lookup_donor_history ─────────────────────────────────

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
  IF p_telepon IS NULL OR length(trim(p_telepon)) < 8 THEN RETURN NULL; END IF;
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN RETURN NULL; END IF;

  SELECT id, nama, telepon, golongan_darah
  INTO v_verify
  FROM registrasi_donor
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
  FROM registrasi_donor r
  LEFT JOIN jadwal_donor j ON j.id = r.jadwal_id
  LEFT JOIN lokasi_donor l ON l.id = j.lokasi_id
  WHERE r.telepon = trim(p_telepon);

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

GRANT EXECUTE ON FUNCTION public.lookup_donor_history(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.lookup_donor_history(text, text) TO authenticated;

-- ── RPC: batalkan_registrasi_by_kode ──────────────────────────

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
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak valid.');
  END IF;

  SELECT r.status, j.tanggal INTO v_status, v_jadwal_tanggal
  FROM registrasi_donor r
  JOIN jadwal_donor j ON j.id = r.jadwal_id
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

GRANT EXECUTE ON FUNCTION public.batalkan_registrasi_by_kode(text) TO anon;
GRANT EXECUTE ON FUNCTION public.batalkan_registrasi_by_kode(text) TO authenticated;

-- ── RPC: count_registrasi_bulan_ini ───────────────────────────

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
