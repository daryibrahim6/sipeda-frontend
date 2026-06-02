-- 005_multi_tenant_cabang.sql — Tabel cabang (multi-tenant prep, belum ada RLS).

CREATE TABLE IF NOT EXISTS cabang (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  alamat TEXT,
  kontak TEXT,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cabang ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin read cabang" ON cabang;
DROP POLICY IF EXISTS "Superadmin insert cabang" ON cabang;
DROP POLICY IF EXISTS "Superadmin update cabang" ON cabang;
DROP POLICY IF EXISTS "Superadmin delete cabang" ON cabang;

CREATE POLICY "Admin read cabang" ON cabang FOR SELECT USING (true);
CREATE POLICY "Superadmin insert cabang" ON cabang FOR INSERT WITH CHECK (is_admin_or_superadmin());
CREATE POLICY "Superadmin update cabang" ON cabang FOR UPDATE USING (is_admin_or_superadmin()) WITH CHECK (is_admin_or_superadmin());
CREATE POLICY "Superadmin delete cabang" ON cabang FOR DELETE USING (is_admin_or_superadmin());

INSERT INTO cabang (nama, alamat, kontak, aktif)
VALUES ('PMI Kabupaten Indramayu', 'Jl. Jend. Sudirman No. 1, Indramayu', '0234-555001', TRUE)
ON CONFLICT DO NOTHING;

DO $$ BEGIN
  ALTER TABLE lokasi_donor       ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE jadwal_donor       ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE registrasi_donor   ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE pencatatan_donor   ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE stok_darah         ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE admins             ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE artikel            ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
  ALTER TABLE pengumuman         ADD COLUMN IF NOT EXISTS cabang_id INT REFERENCES cabang(id) DEFAULT 1;
END $$;

CREATE INDEX IF NOT EXISTS idx_lokasi_cabang     ON lokasi_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_cabang     ON jadwal_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_registrasi_cabang ON registrasi_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_pencatatan_cabang ON pencatatan_donor(cabang_id);
CREATE INDEX IF NOT EXISTS idx_stok_cabang       ON stok_darah(cabang_id);
CREATE INDEX IF NOT EXISTS idx_admins_cabang     ON admins(cabang_id);
CREATE INDEX IF NOT EXISTS idx_artikel_cabang    ON artikel(cabang_id);
CREATE INDEX IF NOT EXISTS idx_pengumuman_cabang ON pengumuman(cabang_id);
