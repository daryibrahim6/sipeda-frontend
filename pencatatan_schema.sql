-- ============================================================
-- SIPEDA — Pencatatan Kehadiran Pendonor
-- Jalankan di Supabase SQL Editor
-- ============================================================

-- ==== 1. TABEL: pencatatan_donor ====
-- Catat setiap pendonor yang datang ke kegiatan donor darah

CREATE TABLE IF NOT EXISTS pencatatan_donor (
  id SERIAL PRIMARY KEY,
  jadwal_id INT NOT NULL REFERENCES jadwal_donor(id) ON DELETE CASCADE,
  nama_pendonor TEXT NOT NULL,
  golongan_darah TEXT NOT NULL 
    CHECK (golongan_darah IN ('A+','A-','B+','B-','AB+','AB-','O+','O-','Tidak Tahu')),
  status_donor TEXT NOT NULL 
    CHECK (status_donor IN ('berhasil','gagal','tidak_memenuhi_syarat')),
  catatan TEXT,
  dicatat_oleh INT REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query per jadwal
CREATE INDEX IF NOT EXISTS idx_pencatatan_jadwal ON pencatatan_donor(jadwal_id);
CREATE INDEX IF NOT EXISTS idx_pencatatan_status ON pencatatan_donor(jadwal_id, status_donor);

-- ==== 2. RLS ====
ALTER TABLE pencatatan_donor ENABLE ROW LEVEL SECURITY;

-- Semua user di tabel admins (termasuk petugas_lapangan) bisa SELECT
DROP POLICY IF EXISTS "Admins read pencatatan" ON pencatatan_donor;
CREATE POLICY "Admins read pencatatan"
  ON pencatatan_donor
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- Semua user di tabel admins bisa INSERT
DROP POLICY IF EXISTS "Admins insert pencatatan" ON pencatatan_donor;
CREATE POLICY "Admins insert pencatatan"
  ON pencatatan_donor
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
    )
  );

-- Hanya superadmin/admin bisa UPDATE/DELETE
DROP POLICY IF EXISTS "Admin full pencatatan" ON pencatatan_donor;
CREATE POLICY "Admin full pencatatan"
  ON pencatatan_donor
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE auth_user_id = auth.uid()
        AND role IN ('superadmin', 'admin')
    )
  );

-- ==== 3. VIEW REKAP ====
-- Ringkasan pencatatan per jadwal untuk dashboard admin

CREATE OR REPLACE VIEW v_rekap_pencatatan AS
SELECT 
  j.id AS jadwal_id,
  j.tanggal,
  j.waktu_mulai,
  j.waktu_selesai,
  l.nama_lokasi,
  COUNT(*) AS total_catat,
  COUNT(*) FILTER (WHERE p.status_donor = 'berhasil') AS berhasil,
  COUNT(*) FILTER (WHERE p.status_donor = 'gagal') AS gagal,
  COUNT(*) FILTER (WHERE p.status_donor = 'tidak_memenuhi_syarat') AS tidak_memenuhi
FROM pencatatan_donor p
JOIN jadwal_donor j ON j.id = p.jadwal_id
JOIN lokasi_donor l ON l.id = j.lokasi_id
GROUP BY j.id, j.tanggal, j.waktu_mulai, j.waktu_selesai, l.nama_lokasi
ORDER BY j.tanggal DESC;

-- ==== 4. VERIFIKASI ====
SELECT 'pencatatan_donor tabel berhasil dibuat' AS status;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pencatatan_donor'
ORDER BY ordinal_position;
