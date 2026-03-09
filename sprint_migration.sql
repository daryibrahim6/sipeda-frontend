-- ============================================================
-- Sprint A2: Fix v_stats view — total_stok_kritis harus count
-- DISTINCT golongan_darah, bukan count semua rows.
--
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard
-- ============================================================

-- Drop dan buat ulang view
DROP VIEW IF EXISTS v_stats;

CREATE VIEW v_stats AS
SELECT
  COALESCE(SUM(sd.jumlah), 0)::int AS total_stok,
  (SELECT COUNT(*) FROM lokasi_donor WHERE aktif = true)::int AS lokasi_aktif,
  (SELECT COUNT(*) FROM jadwal_donor WHERE status = 'aktif' AND tanggal >= CURRENT_DATE)::int AS jadwal_aktif,
  COUNT(DISTINCT CASE WHEN sd.status IN ('kritis', 'kosong') THEN sd.golongan_darah END)::int AS total_stok_kritis
FROM stok_darah sd;

-- ============================================================
-- Sprint B2: Schema migration untuk pencatatan + registrasi
--
-- 1. Tambah kolom registrasi_id di pencatatan_donor (link ke registrasi)
-- 2. Tambah kolom status_kehadiran di registrasi_donor
-- 3. Tambah kolom updated_at di pencatatan_donor (untuk fitur edit)
-- 4. Tambah kolom nik di registrasi_donor (untuk identitas unik)
-- ============================================================

-- B2.1: Link pencatatan → registrasi
ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS registrasi_id bigint REFERENCES registrasi_donor(id) ON DELETE SET NULL;

-- B2.2: Status kehadiran pada registrasi
ALTER TABLE registrasi_donor
  ADD COLUMN IF NOT EXISTS status_kehadiran text DEFAULT NULL
  CHECK (status_kehadiran IN ('hadir', 'tidak_hadir'));

-- B2.3: Updated_at untuk fitur edit pencatatan
ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS updated_at timestamptz;

-- B2.4: NIK di registrasi (B1 — untuk identitas unik pendonor)
ALTER TABLE registrasi_donor
  ADD COLUMN IF NOT EXISTS nik text;

-- Index untuk pencarian kode registrasi oleh petugas
CREATE INDEX IF NOT EXISTS idx_registrasi_kode ON registrasi_donor(kode_registrasi);

-- Index untuk pencarian NIK
CREATE INDEX IF NOT EXISTS idx_registrasi_nik ON registrasi_donor(nik);

-- Update view rekap pencatatan untuk include registrasi info
DROP VIEW IF EXISTS v_rekap_pencatatan;

CREATE VIEW v_rekap_pencatatan AS
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

-- Verifikasi
SELECT 'v_stats fix', total_stok_kritis FROM v_stats;
