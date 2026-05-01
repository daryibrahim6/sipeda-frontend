-- =====================================================
-- SIPEDA — SEED DATA DEMO
-- Jalankan di Supabase SQL Editor SETELAH schema utama berhasil
-- =====================================================

-- ── 0. Pastikan admin id=1 ada ───────────────────────────────────────────────
-- Schema sudah INSERT admin awal, tapi kalau belum ada, tambahkan:
INSERT INTO admins (name, email, role)
VALUES ('Super Admin', 'admin@sipeda.id', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Simpan id admin ke variabel lokal
DO $$
DECLARE
  admin_id   INT;
  lokasi1_id INT;
  lokasi2_id INT;
  lokasi3_id INT;
  komp_wb    SMALLINT;
  komp_prc   SMALLINT;
  komp_tc    SMALLINT;
  komp_ffp   SMALLINT;
BEGIN

  -- Ambil id admin
  SELECT id INTO admin_id FROM admins WHERE email = 'admin@sipeda.id' LIMIT 1;

  -- ── 1. LOKASI DONOR (tambah 1 lokasi lagi) ─────────────────────────────────
  INSERT INTO lokasi_donor (kode_lokasi, nama_lokasi, tipe, alamat, kecamatan, kota, koordinat_lat, koordinat_lng, kontak, deskripsi, aktif)
  VALUES
    ('PUSK-IDR-001', 'Puskesmas Sindang', 'Puskesmas', 'Jl. Raya Sindang No. 10, Sindang', 'Sindang', 'Indramayu', -6.3456789, 108.3345678, '0234-555001', 'Puskesmas aktif donor darah di kecamatan Sindang.', TRUE)
  ON CONFLICT (kode_lokasi) DO NOTHING;

  SELECT id INTO lokasi1_id FROM lokasi_donor WHERE kode_lokasi = 'PMI-IDR-001';
  SELECT id INTO lokasi2_id FROM lokasi_donor WHERE kode_lokasi = 'RS-IDR-001';
  SELECT id INTO lokasi3_id FROM lokasi_donor WHERE kode_lokasi = 'PUSK-IDR-001';

  -- ── 2. KOMPONEN DARAH IDs ───────────────────────────────────────────────────
  SELECT id INTO komp_wb  FROM komponen_darah WHERE kode = 'WB';
  SELECT id INTO komp_prc FROM komponen_darah WHERE kode = 'PRC';
  SELECT id INTO komp_tc  FROM komponen_darah WHERE kode = 'TC';
  SELECT id INTO komp_ffp FROM komponen_darah WHERE kode = 'FFP';

  -- ── 3. STOK DARAH — PMI Kabupaten Indramayu ────────────────────────────────
  INSERT INTO stok_darah (lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, updated_by)
  VALUES
    -- WB (Whole Blood)
    (lokasi1_id, komp_wb, 'A+',  45, 10, admin_id),
    (lokasi1_id, komp_wb, 'A-',   3, 10, admin_id),  -- KRITIS
    (lokasi1_id, komp_wb, 'B+',  38, 10, admin_id),
    (lokasi1_id, komp_wb, 'B-',   0, 10, admin_id),  -- KOSONG
    (lokasi1_id, komp_wb, 'AB+', 22, 10, admin_id),
    (lokasi1_id, komp_wb, 'AB-',  5, 10, admin_id),  -- KRITIS
    (lokasi1_id, komp_wb, 'O+',  60, 10, admin_id),
    (lokasi1_id, komp_wb, 'O-',   8, 10, admin_id),  -- KRITIS
    -- PRC
    (lokasi1_id, komp_prc, 'A+', 30, 8, admin_id),
    (lokasi1_id, komp_prc, 'A-',  0, 8, admin_id),   -- KOSONG
    (lokasi1_id, komp_prc, 'B+', 25, 8, admin_id),
    (lokasi1_id, komp_prc, 'B-',  2, 8, admin_id),   -- KRITIS
    (lokasi1_id, komp_prc, 'AB+',12, 8, admin_id),
    (lokasi1_id, komp_prc, 'AB-', 0, 8, admin_id),   -- KOSONG
    (lokasi1_id, komp_prc, 'O+', 40, 8, admin_id),
    (lokasi1_id, komp_prc, 'O-',  6, 8, admin_id),   -- KRITIS
    -- TC
    (lokasi1_id, komp_tc, 'A+',  10, 5, admin_id),
    (lokasi1_id, komp_tc, 'B+',   8, 5, admin_id),
    (lokasi1_id, komp_tc, 'O+',  15, 5, admin_id),
    (lokasi1_id, komp_tc, 'AB+',  3, 5, admin_id),   -- KRITIS
    -- FFP
    (lokasi1_id, komp_ffp, 'A+', 20, 5, admin_id),
    (lokasi1_id, komp_ffp, 'B+', 18, 5, admin_id),
    (lokasi1_id, komp_ffp, 'O+', 25, 5, admin_id),
    (lokasi1_id, komp_ffp, 'AB+', 7, 5, admin_id)
  ON CONFLICT (lokasi_id, komponen_id, golongan_darah) DO NOTHING;

  -- ── 4. STOK DARAH — RSUD Indramayu ─────────────────────────────────────────
  INSERT INTO stok_darah (lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, updated_by)
  VALUES
    (lokasi2_id, komp_wb,  'A+',  20, 8, admin_id),
    (lokasi2_id, komp_wb,  'A-',   0, 8, admin_id),  -- KOSONG
    (lokasi2_id, komp_wb,  'B+',  18, 8, admin_id),
    (lokasi2_id, komp_wb,  'B-',   4, 8, admin_id),  -- KRITIS
    (lokasi2_id, komp_wb,  'AB+', 10, 8, admin_id),
    (lokasi2_id, komp_wb,  'AB-',  0, 8, admin_id),  -- KOSONG
    (lokasi2_id, komp_wb,  'O+',  30, 8, admin_id),
    (lokasi2_id, komp_wb,  'O-',   6, 8, admin_id),  -- KRITIS
    (lokasi2_id, komp_prc, 'A+',  15, 5, admin_id),
    (lokasi2_id, komp_prc, 'B+',  12, 5, admin_id),
    (lokasi2_id, komp_prc, 'O+',  20, 5, admin_id),
    (lokasi2_id, komp_prc, 'AB+',  5, 5, admin_id)
  ON CONFLICT (lokasi_id, komponen_id, golongan_darah) DO NOTHING;

  -- ── 5. STOK DARAH — Puskesmas Sindang ──────────────────────────────────────
  INSERT INTO stok_darah (lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, updated_by)
  VALUES
    (lokasi3_id, komp_wb, 'A+', 10, 5, admin_id),
    (lokasi3_id, komp_wb, 'B+',  8, 5, admin_id),
    (lokasi3_id, komp_wb, 'O+', 15, 5, admin_id),
    (lokasi3_id, komp_wb, 'AB+', 3, 5, admin_id),   -- KRITIS
    (lokasi3_id, komp_wb, 'O-',  0, 5, admin_id)    -- KOSONG
  ON CONFLICT (lokasi_id, komponen_id, golongan_darah) DO NOTHING;

  -- ── 6. JADWAL DONOR ─────────────────────────────────────────────────────────
  -- Gunakan tanggal relatif dari CURRENT_DATE agar selalu relevan
  INSERT INTO jadwal_donor (lokasi_id, tanggal, waktu_mulai, waktu_selesai, kuota, sisa_kuota, deskripsi, status, created_by)
  VALUES
    (lokasi1_id, CURRENT_DATE + 3,  '08:00', '12:00', 50, 32, 'Donor darah rutin bulanan PMI Indramayu. Tersedia snack dan sertifikat.', 'aktif', admin_id),
    (lokasi1_id, CURRENT_DATE + 7,  '08:00', '13:00', 60, 60, 'Kegiatan donor darah dalam rangka HUT PMI. Doorprize menarik!', 'aktif', admin_id),
    (lokasi1_id, CURRENT_DATE + 10, '09:00', '12:00', 40, 12, 'Donor darah khusus golongan O dan B. Prioritas stok kritis.', 'aktif', admin_id),
    (lokasi2_id, CURRENT_DATE + 5,  '08:30', '11:30', 30, 18, 'Donor darah sosial RSUD Indramayu bekerja sama dengan PMI.', 'aktif', admin_id),
    (lokasi2_id, CURRENT_DATE + 14, '08:00', '12:00', 40, 40, 'Aksi donor darah semester 1 tahun 2025.', 'aktif', admin_id),
    (lokasi3_id, CURRENT_DATE + 2,  '08:00', '11:00', 25,  3, 'Donor darah terakhir bulan ini di Puskesmas Sindang.', 'aktif', admin_id),  -- hampir penuh
    (lokasi1_id, CURRENT_DATE - 7,  '08:00', '12:00', 50, 50, 'Jadwal bulan lalu (arsip).', 'selesai', admin_id)
  ON CONFLICT DO NOTHING;

  -- ── 7. ARTIKEL ────────────────────────────────────────────────────────────
  INSERT INTO artikel (judul, slug, excerpt, konten, kategori_id, penulis, status, unggulan, published_at)
  VALUES
    (
      'Manfaat Donor Darah Bagi Kesehatan Pendonor',
      'manfaat-donor-darah-bagi-kesehatan-pendonor',
      'Selain membantu orang lain, donor darah ternyata memberikan manfaat luar biasa bagi kesehatan pendonor itu sendiri. Simak penjelasan lengkapnya di sini.',
      '<h2>Donor Darah Bukan Hanya Tentang Memberi</h2><p>Banyak orang mengira donor darah hanya menguntungkan penerimanya. Faktanya, pendonor juga mendapatkan manfaat kesehatan yang signifikan dari setiap kali berdonor.</p><h3>1. Menurunkan Risiko Penyakit Jantung</h3><p>Donor darah secara rutin membantu mengurangi viskositas darah dan kadar zat besi berlebih, yang keduanya berkaitan dengan risiko penyakit jantung dan stroke.</p><h3>2. Deteksi Dini Penyakit</h3><p>Sebelum donor, setiap pendonor menjalani pemeriksaan kesehatan mini: tekanan darah, hemoglobin, dan golongan darah. Ini bisa menjadi deteksi dini masalah kesehatan.</p><h3>3. Produksi Sel Darah Merah Baru</h3><p>Setelah mendonorkan darah, tubuh akan memproduksi sel darah merah baru untuk menggantikan yang hilang. Proses regenerasi ini menjaga vitalitas tubuh.</p><h3>4. Membakar Kalori</h3><p>Proses mendonor dan regenerasi darah membakar sekitar 650 kalori per sesi. Manfaat tambahan yang tidak banyak orang tahu!</p><p>Yuk, jadikan donor darah sebagai gaya hidup sehat. <strong>Satu tetes darahmu bisa menyelamatkan tiga nyawa.</strong></p>',
      (SELECT id FROM kategori_artikel WHERE slug = 'donor-darah'),
      'Tim Medis PMI Indramayu', 'published', TRUE,
      NOW() - INTERVAL '5 days'
    ),
    (
      'Syarat dan Persiapan Sebelum Donor Darah',
      'syarat-dan-persiapan-sebelum-donor-darah',
      'Sebelum donor darah, ada beberapa syarat kesehatan dan persiapan yang perlu kamu penuhi. Artikel ini menguraikannya secara lengkap dan mudah dipahami.',
      '<h2>Persiapkan Dirimu Sebelum Donor</h2><p>Donor darah adalah tindakan mulia, namun ada beberapa hal yang perlu dipersiapkan agar proses berjalan lancar dan aman.</p><h3>Syarat Umum Pendonor</h3><ul><li>Usia 17–65 tahun</li><li>Berat badan minimal 45 kg</li><li>Tekanan darah normal (sistol 100–170, diastol 70–100 mmHg)</li><li>Hemoglobin minimal 12,5 g/dL</li><li>Tidak sedang sakit, demam, atau flu</li><li>Tidak dalam kondisi hamil atau menyusui</li></ul><h3>Persiapan Sebelum Donor</h3><ul><li><strong>Tidur cukup</strong> minimal 5 jam malam sebelumnya</li><li><strong>Makan terlebih dahulu</strong> — jangan donor dalam kondisi puasa</li><li><strong>Perbanyak minum air putih</strong> setidaknya 500ml sebelum donor</li><li><strong>Hindari makanan berlemak tinggi</strong> 4 jam sebelum donor</li><li><strong>Jangan konsumsi alkohol</strong> 24 jam sebelumnya</li></ul><h3>Setelah Donor</h3><p>Istirahatlah 10–15 menit, konsumsi makanan dan minuman yang disediakan, dan hindari aktivitas berat selama 5 jam.</p>',
      (SELECT id FROM kategori_artikel WHERE slug = 'donor-darah'),
      'Admin SIPEDA', 'published', FALSE,
      NOW() - INTERVAL '10 days'
    ),
    (
      'Mengenal Golongan Darah dan Komponen Darah',
      'mengenal-golongan-darah-dan-komponen-darah',
      'Apa perbedaan golongan darah A, B, AB, dan O? Apa itu Whole Blood, PRC, dan platelet? Pelajari semua tentang komponen darah di sini.',
      '<h2>Sistem Golongan Darah ABO</h2><p>Golongan darah manusia dibagi berdasarkan keberadaan antigen pada permukaan sel darah merah. Sistem ABO yang paling umum dikenal membagi darah menjadi 4 golongan: A, B, AB, dan O.</p><h3>Golongan O — Universal Donor</h3><p>Golongan O tidak memiliki antigen A maupun B, sehingga aman ditransfusikan ke semua golongan darah dalam kondisi darurat.</p><h3>Golongan AB — Universal Recipient</h3><p>Golongan AB bisa menerima darah dari semua golongan, namun hanya bisa mendonorkan ke sesama AB.</p><h2>Komponen Darah yang Bisa Didonorkan</h2><ul><li><strong>Whole Blood (WB)</strong> — Darah lengkap, paling umum didonorkan</li><li><strong>Packed Red Cells (PRC)</strong> — Sel darah merah pekat, untuk anemia</li><li><strong>Thrombocyte Concentrate (TC)</strong> — Platelet/trombosit, untuk demam berdarah</li><li><strong>Fresh Frozen Plasma (FFP)</strong> — Plasma, untuk gangguan pembekuan darah</li></ul>',
      (SELECT id FROM kategori_artikel WHERE slug = 'edukasi'),
      'Tim Edukasi PMI', 'published', FALSE,
      NOW() - INTERVAL '15 days'
    ),
    (
      'PMI Indramayu Gelar Aksi Donor Darah Massal',
      'pmi-indramayu-gelar-aksi-donor-darah-massal',
      'PMI Kabupaten Indramayu menggelar aksi donor darah massal dalam rangka memperingati Hari PMI. Ratusan kantong darah berhasil terkumpul.',
      '<h2>Aksi Donor Darah Massal PMI Indramayu</h2><p>Dalam rangka memperingati Hari PMI, PMI Kabupaten Indramayu sukses menggelar aksi donor darah massal yang diikuti oleh ratusan warga dari berbagai kecamatan.</p><p>Kegiatan berlangsung selama dua hari berturut-turut di Gedung PMI Kabupaten Indramayu, dengan melibatkan tenaga medis dari berbagai fasilitas kesehatan.</p><h3>Hasil Kegiatan</h3><ul><li>Total pendonor: 312 orang</li><li>Kantong darah terkumpul: 287 kantong</li><li>Golongan darah terbanyak: O+ (94 kantong)</li><li>Golongan darah paling dibutuhkan: O- dan B-</li></ul><p>Kepala PMI Indramayu menyampaikan terima kasih kepada seluruh pendonor. <em>"Setiap tetes darah yang didonorkan adalah nyawa yang terselamatkan,"</em> ujarnya.</p>',
      (SELECT id FROM kategori_artikel WHERE slug = 'berita'),
      'Redaksi SIPEDA', 'published', FALSE,
      NOW() - INTERVAL '3 days'
    )
  ON CONFLICT (slug) DO NOTHING;

  -- ── 8. PENGUMUMAN ──────────────────────────────────────────────────────────
  INSERT INTO pengumuman (judul, isi, tipe, link, link_teks, aktif, tanggal_mulai, tanggal_selesai, created_by)
  VALUES
    (
      'Stok Darah O- dan B- Sangat Menipis',
      'PMI Indramayu membutuhkan pendonor golongan darah O- dan B- secara mendesak. Silakan datang langsung atau daftar melalui jadwal donor.',
      'darurat',
      '/jadwal',
      'Daftar Donor',
      TRUE,
      CURRENT_DATE,
      CURRENT_DATE + 14,
      admin_id
    ),
    (
      'Sistem SIPEDA Resmi Diluncurkan',
      'SIPEDA (Sistem Informasi Pendonoran Darah) Kabupaten Indramayu kini tersedia untuk masyarakat umum. Temukan lokasi donor dan jadwal terkini.',
      'sukses',
      '/tentang',
      'Pelajari SIPEDA',
      TRUE,
      CURRENT_DATE,
      CURRENT_DATE + 30,
      admin_id
    )
  ON CONFLICT DO NOTHING;

END $$;

-- ── 9. Verifikasi data berhasil masuk ──────────────────────────────────────────
SELECT 'stok_darah'    AS tabel, COUNT(*) AS total FROM stok_darah
UNION ALL
SELECT 'jadwal_donor',          COUNT(*)            FROM jadwal_donor
UNION ALL
SELECT 'artikel',               COUNT(*)            FROM artikel
UNION ALL
SELECT 'testimonial',           COUNT(*)            FROM testimonial
UNION ALL
SELECT 'faq',                   COUNT(*)            FROM faq
UNION ALL
SELECT 'pengumuman',            COUNT(*)            FROM pengumuman
UNION ALL
SELECT 'v_stats (total_stok)',  total_stok          FROM v_stats;
