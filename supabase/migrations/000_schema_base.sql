-- ============================================================
-- SIPEDA — Schema Dasar (000)
-- Membuat semua tipe enum, tabel, dan constraint awal.
-- ============================================================

-- ── ENUMS ─────────────────────────────────────────────────────

CREATE TYPE admin_role AS ENUM ('superadmin', 'admin', 'operator', 'petugas_lapangan');
CREATE TYPE lokasi_tipe AS ENUM ('PMI', 'RS', 'Klinik', 'Puskesmas', 'Lainnya');
CREATE TYPE jadwal_status AS ENUM ('aktif', 'penuh', 'dibatalkan', 'selesai');
CREATE TYPE golongan_darah AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Tidak Tahu');
CREATE TYPE reg_status AS ENUM ('pending', 'confirmed', 'hadir', 'tidak_hadir', 'dibatalkan');
CREATE TYPE stok_status AS ENUM ('normal', 'kritis', 'kosong');
CREATE TYPE artikel_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE pengumuman_tipe AS ENUM ('info', 'sukses', 'peringatan', 'darurat');
CREATE TYPE faq_kategori AS ENUM ('umum', 'syarat', 'proses', 'stok', 'lainnya');
CREATE TYPE pengaturan_tipe AS ENUM ('text', 'json', 'boolean', 'number');

-- ── TABEL ADMIN ───────────────────────────────────────────────

CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role admin_role NOT NULL DEFAULT 'operator',
  avatar VARCHAR(255),
  last_login TIMESTAMPTZ,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX admins_auth_user_id_key ON admins(auth_user_id);

-- ── LOKASI DONOR ──────────────────────────────────────────────

CREATE TABLE lokasi_donor (
  id SERIAL PRIMARY KEY,
  kode_lokasi VARCHAR(20) NOT NULL UNIQUE,
  nama_lokasi VARCHAR(150) NOT NULL,
  tipe lokasi_tipe NOT NULL DEFAULT 'PMI',
  alamat TEXT NOT NULL,
  kecamatan VARCHAR(100) NOT NULL,
  kota VARCHAR(100) NOT NULL DEFAULT 'Indramayu',
  provinsi VARCHAR(100) NOT NULL DEFAULT 'Jawa Barat',
  kode_pos VARCHAR(10),
  koordinat_lat NUMERIC NOT NULL,
  koordinat_lng NUMERIC NOT NULL,
  kontak VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(255),
  penanggung_jawab VARCHAR(100),
  foto VARCHAR(255),
  deskripsi TEXT,
  jam_operasional JSONB,
  fasilitas JSONB,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── KOMPONEN DARAH ────────────────────────────────────────────

CREATE TABLE komponen_darah (
  id SMALLSERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kode VARCHAR(20) NOT NULL UNIQUE,
  deskripsi TEXT,
  aktif BOOLEAN NOT NULL DEFAULT TRUE
);

-- ── JADWAL DONOR ──────────────────────────────────────────────

CREATE TABLE jadwal_donor (
  id SERIAL PRIMARY KEY,
  lokasi_id INT NOT NULL REFERENCES lokasi_donor(id) ON DELETE RESTRICT,
  tanggal DATE NOT NULL,
  waktu_mulai TIME NOT NULL,
  waktu_selesai TIME NOT NULL,
  kuota SMALLINT NOT NULL DEFAULT 50 CHECK (kuota > 0),
  sisa_kuota SMALLINT NOT NULL DEFAULT 50 CHECK (sisa_kuota >= 0),
  deskripsi TEXT,
  catatan TEXT,
  status jadwal_status NOT NULL DEFAULT 'aktif',
  created_by INT NOT NULL REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── REGISTRASI DONOR ──────────────────────────────────────────

CREATE TABLE registrasi_donor (
  id SERIAL PRIMARY KEY,
  jadwal_id INT NOT NULL REFERENCES jadwal_donor(id) ON DELETE CASCADE,
  kode_registrasi VARCHAR(20) NOT NULL UNIQUE DEFAULT 'REG-PENDING',
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telepon VARCHAR(20) NOT NULL,
  golongan_darah golongan_darah NOT NULL DEFAULT 'Tidak Tahu',
  tanggal_lahir DATE,
  jenis_kelamin CHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
  alamat TEXT,
  riwayat_donor BOOLEAN NOT NULL DEFAULT FALSE,
  pre_screening JSONB,
  status reg_status NOT NULL DEFAULT 'pending',
  status_kehadiran TEXT CHECK (status_kehadiran IN ('hadir', 'tidak_hadir')),
  nik TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PENCATATAN DONOR ──────────────────────────────────────────

CREATE TABLE pencatatan_donor (
  id SERIAL PRIMARY KEY,
  jadwal_id INT NOT NULL REFERENCES jadwal_donor(id) ON DELETE CASCADE,
  registrasi_id BIGINT REFERENCES registrasi_donor(id) ON DELETE SET NULL,
  nama_pendonor TEXT NOT NULL,
  golongan_darah TEXT NOT NULL CHECK (golongan_darah IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  status_donor TEXT NOT NULL CHECK (status_donor IN ('berhasil','gagal','tidak_memenuhi_syarat')),
  catatan TEXT,
  hemoglobin NUMERIC(4,1),
  tensi_sistolik SMALLINT,
  tensi_diastolik SMALLINT,
  berat_badan NUMERIC(5,1),
  dicatat_oleh INT REFERENCES admins(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ── STOK DARAH ────────────────────────────────────────────────

CREATE TABLE stok_darah (
  id SERIAL PRIMARY KEY,
  lokasi_id INT NOT NULL REFERENCES lokasi_donor(id) ON DELETE RESTRICT,
  komponen_id SMALLINT NOT NULL REFERENCES komponen_darah(id) ON DELETE RESTRICT,
  golongan_darah golongan_darah NOT NULL,
  jumlah SMALLINT NOT NULL DEFAULT 0 CHECK (jumlah >= 0),
  batas_kritis SMALLINT NOT NULL DEFAULT 10 CHECK (batas_kritis >= 0),
  status stok_status NOT NULL DEFAULT 'normal',
  keterangan TEXT,
  updated_by INT REFERENCES admins(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lokasi_id, komponen_id, golongan_darah)
);

-- ── STOK DARAH HISTORY ────────────────────────────────────────

CREATE TABLE stok_darah_history (
  id BIGSERIAL PRIMARY KEY,
  stok_id INT NOT NULL REFERENCES stok_darah(id) ON DELETE CASCADE,
  jumlah_lama SMALLINT NOT NULL,
  jumlah_baru SMALLINT NOT NULL,
  updated_by INT REFERENCES admins(id),
  keterangan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── KATEGORI ARTIKEL ──────────────────────────────────────────

CREATE TABLE kategori_artikel (
  id SMALLSERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  deskripsi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ARTIKEL ───────────────────────────────────────────────────

CREATE TABLE artikel (
  id SERIAL PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL UNIQUE,
  excerpt VARCHAR(500),
  konten TEXT NOT NULL,
  kategori_id SMALLINT NOT NULL REFERENCES kategori_artikel(id) ON DELETE RESTRICT,
  penulis VARCHAR(100) NOT NULL DEFAULT 'Admin SIPEDA',
  gambar VARCHAR(255),
  gambar_alt VARCHAR(255),
  tampilkan_beranda BOOLEAN NOT NULL DEFAULT FALSE,
  unggulan BOOLEAN NOT NULL DEFAULT FALSE,
  status artikel_status NOT NULL DEFAULT 'draft',
  views INT NOT NULL DEFAULT 0 CHECK (views >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TESTIMONIAL ───────────────────────────────────────────────

CREATE TABLE testimonial (
  id SMALLSERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  foto VARCHAR(255),
  jabatan VARCHAR(100),
  isi TEXT NOT NULL,
  rating SMALLINT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  urutan SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PENGUMUMAN ────────────────────────────────────────────────

CREATE TABLE pengumuman (
  id SMALLSERIAL PRIMARY KEY,
  judul VARCHAR(200) NOT NULL,
  isi TEXT NOT NULL,
  tipe pengumuman_tipe NOT NULL DEFAULT 'info',
  link VARCHAR(255),
  link_teks VARCHAR(50) DEFAULT 'Selengkapnya',
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  created_by INT NOT NULL REFERENCES admins(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── FAQ ───────────────────────────────────────────────────────

CREATE TABLE faq (
  id SMALLSERIAL PRIMARY KEY,
  pertanyaan VARCHAR(300) NOT NULL,
  jawaban TEXT NOT NULL,
  kategori faq_kategori NOT NULL DEFAULT 'umum',
  urutan SMALLINT NOT NULL DEFAULT 0,
  aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ADMIN LOG ─────────────────────────────────────────────────

CREATE TABLE admin_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES admins(id),
  aksi VARCHAR(100) NOT NULL,
  tabel VARCHAR(50),
  record_id INT,
  data_lama JSONB,
  data_baru JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(300),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PENGATURAN ────────────────────────────────────────────────

CREATE TABLE pengaturan (
  kunci VARCHAR(100) PRIMARY KEY,
  nilai TEXT,
  tipe pengaturan_tipe NOT NULL DEFAULT 'text',
  keterangan VARCHAR(255),
  updated_by INT REFERENCES admins(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ENABLE RLS SEMUA TABEL ────────────────────────────────────

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE lokasi_donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE komponen_darah ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrasi_donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE pencatatan_donor ENABLE ROW LEVEL SECURITY;
ALTER TABLE stok_darah ENABLE ROW LEVEL SECURITY;
ALTER TABLE stok_darah_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kategori_artikel ENABLE ROW LEVEL SECURITY;
ALTER TABLE artikel ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonial ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengaturan ENABLE ROW LEVEL SECURITY;
