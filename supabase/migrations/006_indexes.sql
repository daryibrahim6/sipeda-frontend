-- ============================================================
-- SIPEDA — Additional Indexes (006)
-- Index performa untuk query yang sering dijalankan aplikasi.
-- ============================================================

-- ── JADWAL DONOR ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_jadwal_lokasi_tanggal
  ON jadwal_donor(lokasi_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_jadwal_status
  ON jadwal_donor(status);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal
  ON jadwal_donor(tanggal);
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal_status
  ON jadwal_donor(tanggal DESC, status)
  WHERE status = 'aktif';

-- ── REGISTRASI DONOR ──────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_reg_jadwal
  ON registrasi_donor(jadwal_id);
CREATE INDEX IF NOT EXISTS idx_reg_status
  ON registrasi_donor(status);
CREATE INDEX IF NOT EXISTS idx_reg_telepon
  ON registrasi_donor(telepon);
CREATE INDEX IF NOT EXISTS idx_registrasi_kode
  ON registrasi_donor(kode_registrasi);
CREATE INDEX IF NOT EXISTS idx_registrasi_nik
  ON registrasi_donor(nik);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registrasi_jadwal_telp
  ON registrasi_donor(jadwal_id, telepon)
  WHERE status <> 'dibatalkan';

-- ── PENCATATAN DONOR ──────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pencatatan_jadwal
  ON pencatatan_donor(jadwal_id);
CREATE INDEX IF NOT EXISTS idx_pencatatan_status
  ON pencatatan_donor(jadwal_id, status_donor);

-- ── STOK DARAH ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_stok_golongan
  ON stok_darah(golongan_darah);
CREATE INDEX IF NOT EXISTS idx_stok_lokasi
  ON stok_darah(lokasi_id, status);
CREATE INDEX IF NOT EXISTS idx_stok_status
  ON stok_darah(status);

-- ── LOKASI DONOR ──────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_lokasi_aktif
  ON lokasi_donor(aktif);
CREATE INDEX IF NOT EXISTS idx_lokasi_kecamatan
  ON lokasi_donor(kecamatan);
CREATE INDEX IF NOT EXISTS idx_lokasi_tipe
  ON lokasi_donor(tipe);

-- ── ARTIKEL ───────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_artikel_beranda
  ON artikel(tampilkan_beranda);
CREATE INDEX IF NOT EXISTS idx_artikel_published
  ON artikel(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_artikel_status
  ON artikel(status);
CREATE INDEX IF NOT EXISTS idx_artikel_unggulan
  ON artikel(unggulan);

-- ── FAQ ───────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_faq_kategori_urutan
  ON faq(kategori, urutan);

-- ── TESTIMONIAL ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_testimonial_aktif_urutan
  ON testimonial(aktif, urutan);

-- ── PENGUMUMAN ────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_pengumuman_aktif_tanggal
  ON pengumuman(aktif, tanggal_mulai, tanggal_selesai);

-- ── ADMIN LOG ─────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_log_admin
  ON admin_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_log_created
  ON admin_log(created_at DESC);

-- ── FOREIGN KEY INDEXES ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_artikel_kategori
  ON artikel(kategori_id);
CREATE INDEX IF NOT EXISTS idx_jadwal_created_by
  ON jadwal_donor(created_by);
CREATE INDEX IF NOT EXISTS idx_pencatatan_dicatat_oleh
  ON pencatatan_donor(dicatat_oleh);
CREATE INDEX IF NOT EXISTS idx_pencatatan_registrasi
  ON pencatatan_donor(registrasi_id);
CREATE INDEX IF NOT EXISTS idx_pengaturan_updated_by
  ON pengaturan(updated_by);
CREATE INDEX IF NOT EXISTS idx_pengumuman_created_by
  ON pengumuman(created_by);
CREATE INDEX IF NOT EXISTS idx_stok_komponen
  ON stok_darah(komponen_id);
CREATE INDEX IF NOT EXISTS idx_stok_updated_by
  ON stok_darah(updated_by);
CREATE INDEX IF NOT EXISTS idx_stok_history_stok
  ON stok_darah_history(stok_id);
CREATE INDEX IF NOT EXISTS idx_stok_history_updated_by
  ON stok_darah_history(updated_by);
