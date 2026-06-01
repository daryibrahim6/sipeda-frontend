-- ============================================================
-- SIPEDA — Multi-tenant Cabang (Persiapan Struktur)
-- 
-- Menambahkan tabel cabang + cabang_id ke tabel terkait.
-- Semua cabang_id nullable — belum ada logic/RLS diaktifkan.
-- Setelah migration ini, aplikasi tetap jalan seperti biasa.
-- ============================================================

-- ── 1. TABEL CABANG ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cabang (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  kontak TEXT,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cabang ENABLE ROW LEVEL SECURITY;

-- Policy: admin bisa read semua cabang
CREATE POLICY "Admin read cabang"
  ON cabang FOR SELECT
  USING (true);

-- Policy: superadmin bisa CRUD
CREATE POLICY "Superadmin insert cabang"
  ON cabang FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Superadmin update cabang"
  ON cabang FOR UPDATE
  USING (true);

CREATE POLICY "Superadmin delete cabang"
  ON cabang FOR DELETE
  USING (true);

-- ── 2. INSERT DEFAULT CABANG ──────────────────────────────────

INSERT INTO cabang (nama, alamat, kontak, aktif)
VALUES (
  'PMI Kabupaten Indramayu',
  'Jl. Jend. Sudirman No. 1, Indramayu',
  '0234-555001',
  TRUE
)
ON CONFLICT DO NOTHING;

-- ── 3. TAMBAH cabang_id DI TABEL TERKAIT ─────────────────────

-- Semua nullable, default ke cabang PMI Indramayu (id=1)

ALTER TABLE lokasi_donor
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE jadwal_donor
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE registrasi_donor
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE pencatatan_donor
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE stok_darah
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE admins
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE artikel
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

ALTER TABLE pengumuman
  ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;

-- ── 4. INDEX ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_lokasi_cabang ON lokasi_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_cabang ON jadwal_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_registrasi_cabang ON registrasi_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_pencatatan_cabang ON pencatatan_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_stok_cabang ON stok_darah(cabang_id);
CREATE INDEX IF NOT EXISTS idx_admins_cabang ON admins(cabang_id);
CREATE INDEX IF NOT EXISTS idx_artikel_cabang ON artikel(cabang_id);
CREATE INDEX IF NOT EXISTS idx_pengumuman_cabang ON pengumuman(cabang_id);

-- ── 5. VERIFIKASI ─────────────────────────────────────────────

SELECT 'cabang' AS tabel, COUNT(*) AS total FROM cabang
UNION ALL
SELECT 'cabang_id di lokasi_donor', COUNT(*) FROM lokasi_donor WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di jadwal_donor', COUNT(*) FROM jadwal_donor WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di registrasi_donor', COUNT(*) FROM registrasi_donor WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di pencatatan_donor', COUNT(*) FROM pencatatan_donor WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di stok_darah', COUNT(*) FROM stok_darah WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di admins', COUNT(*) FROM admins WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di artikel', COUNT(*) FROM artikel WHERE cabang_id IS NOT NULL
UNION ALL
SELECT 'cabang_id di pengumuman', COUNT(*) FROM pengumuman WHERE cabang_id IS NOT NULL;
