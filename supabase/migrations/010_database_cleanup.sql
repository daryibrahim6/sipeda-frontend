-- ============================================================
-- SIPEDA — Database Cleanup (010)
-- Hapus index redundan, tidak ada perubahan skema.
-- ============================================================

-- ── DROP REDUNDANT INDEXES ──────────────────────────────────

-- idx_pencatatan_jadwal(jadwal_id) redundan karena
-- idx_pencatatan_status(jadwal_id, status_donor) sudah mencakup
-- semua query yang filter by jadwal_id (composite index leading column).
DROP INDEX IF EXISTS idx_pencatatan_jadwal;

-- ── CATATAN ─────────────────────────────────────────────────
-- Index cabang (idx_*_cabang) tidak di-drop karena akan dipakai
-- saat multi-cabang diaktifkan.
--
-- Index di tabel kecil (kategori_artikel, komponen_darah, faq,
-- testimonial) juga dipertahankan karena tidak berdampak signifikan
-- dan berguna jika data bertambah.
