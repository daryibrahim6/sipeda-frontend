-- seed.sql — Data fiktif demo (Indramayu). Bukan data produksi.
-- Auth: admin@sipeda.id / dary@sipeda.id / petugas@sipeda.id (password: sipeda123)

DO $$
<<seed>>
DECLARE
  v_admin_id INT;
  v_petugas_id INT;
  v_lok1 INT; v_lok2 INT; v_lok3 INT; v_lok4 INT; v_lok5 INT;
  v_wb INT; v_prc INT; v_tc INT; v_ffp INT; v_cryo INT;
  v_kat1 INT; v_kat2 INT; v_kat3 INT; v_kat4 INT;

  -- Arrays data pendonor
  nama_arr TEXT[] := ARRAY[
    'Ahmad Fauzi', 'Siti Nurhaliza', 'Bambang Supriyadi', 'Dewi Sartika',
    'Dedi Kurniawan', 'Rina Mariyana', 'Hendra Gunawan', 'Fitri Handayani',
    'Agus Wijaya', 'Nurul Hidayah', 'Rudi Hartono', 'Mega Wulandari',
    'Toni Prasetyo', 'Indah Permata Sari', 'Yudi Setiawan', 'Lilis Suryani',
    'Eko Prayitno', 'Ratna Dewi', 'Ferry Irawan', 'Yuli Astuti',
    'Doni Lesmana', 'Nina Karlina', 'Asep Saepuloh', 'Tari Lestari',
    'Rizky Pratama', 'Dian Puspita', 'Herman Susilo', 'Elok Faiqoh',
    'Irfan Hakim', 'Vera Anggraeni', 'Slamet Riyadi', 'Nia Kurniasih',
    'Wawan Hermawan', 'Rina Marlina', 'Joko Susanto', 'Ani Sulastri',
    'Surya Darma', 'Rini Nurhayati', 'Adi Nugroho', 'Desi Ratnasari',
    'Fajar Sidik', 'Riska Amelia', 'Taufik Hidayat', 'Puji Rahayu',
    'Bayu Aji', 'Hesti Wulandari', 'Candra Kusuma', 'Winda Safitri'
  ];

  tlp_arr TEXT[] := ARRAY[
    '081234567890', '082345678901', '083456789012', '085678901234',
    '087890123456', '081345678902', '082456789013', '085789012345',
    '088901234567', '081567890134', '082678901245', '085890123456',
    '089012345678', '081789012456', '082890123567', '085901234568',
    '089123456789', '081890123567', '082901234678', '085012345679',
    '089234567890', '081901234678', '083012345789', '085123456780',
    '089345678901', '082012345789', '083123456890', '085234567891',
    '089456789012', '082123456890', '083234567901', '085345678902',
    '081012345678', '082234567901', '083345678012', '085456789013',
    '081123456789', '082345678012', '083456789023', '085567890124',
    '081234567801', '082456789023', '085567890234', '085678901235',
    '089567890123', '082567890134', '083567890234', '085789012346'
  ];

  goldar_arr TEXT[] := ARRAY['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  nik_arr TEXT[] := ARRAY[
    '3209120101900001','3209120202900002','3209120303900003','3209120404900004',
    '3209120505900005','3209120606900006','3209120707900007','3209120808900008',
    '3209120909900009','3209121010900010','3209121111900011','3209121212900012',
    '3209121301930013','3209121402940014','3209121503950015','3209121604960016',
    '3209121705970017','3209121806980018','3209121907990019','3209122008000020',
    '3209122109010021','3209122210020022','3209122311030023','3209122412040024',
    '3209122513050025','3209122614060026','3209122715070027','3209122816080028',
    '3209122917090029','3209123018100030','3209123119110031','3209123220120032',
    '3209123321130033','3209123422140034','3209123523150035'
  ];

  jk_arr TEXT[] := ARRAY['L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P','L','P'];
  tgl_lahir_arr DATE[] := ARRAY[
    '1990-01-15','1992-03-20','1988-07-10','1995-11-25','1985-05-12','1998-09-30','1991-02-18','1993-08-22',
    '1987-12-05','1996-04-14','1989-06-28','1994-10-08','1986-03-17','1999-01-22','1984-07-31','1997-05-09',
    '1990-11-11','1993-02-14','1988-08-19','1995-12-24','1985-04-03','1998-06-15','1991-10-20','1994-01-07',
    '1989-09-12','1996-03-26','1987-07-18','1992-11-30','1986-05-21','1999-08-04','1984-12-13','1997-04-27',
    '1990-06-08','1993-10-01','1988-02-09','1995-08-14','1985-01-19','1998-12-23','1991-04-16','1994-09-05',
    '1989-03-10','1996-07-28','1987-11-02','1992-05-06','1986-09-15','1999-01-29','1984-06-12','1997-10-17'
  ];

  kecamatan_arr TEXT[] := ARRAY[
    'Indramayu','Indramayu','Sindang','Sindang','Jatibarang','Jatibarang','Karangampel','Karangampel',
    'Kertasemaya','Kertasemaya','Balongan','Balongan','Tukdana','Tukdana','Sliyeg','Sliyeg',
    'Kandanghaur','Kandanghaur','Kroya','Kroya','Terisi','Terisi','Gantar','Gantar',
    'Sukagumiwang','Sukagumiwang','Lohbener','Lohbener','Arahan','Arahan','Pasekan','Pasekan',
    'Patrol','Patrol','Cikedung','Cikedung','Bangodua','Bangodua','Bongas','Bongas',
    'Haurgeulis','Haurgeulis','Anjatan','Anjatan','Gabuswetan','Gabuswetan','Sukra','Sukra'
  ];

  alamat_arr TEXT[] := ARRAY[
    'Jl. Raya Indramayu No. 45','Jl. Kepatihan No. 12','Jl. Sindang Baru No. 8','Jl. Merdeka No. 23',
    'Jl. Jatibarang Raya No. 56','Jl. Pahlawan No. 34','Jl. Karangampel No. 78','Jl. Mawar Indah No. 9',
    'Jl. Kertasemaya No. 15','Jl. Kenanga No. 27','Jl. Balongan Indah No. 6','Jl. Melati No. 18',
    'Jl. Tukdana Raya No. 33','Jl. Anggrek No. 21','Jl. Sliyeg No. 42','Jl. Flamboyan No. 11',
    'Jl. Kandanghaur No. 55','Jl. Bougenville No. 7','Jl. Kroya No. 29','Jl. Dahlia No. 14',
    'Jl. Terisi No. 38','Jl. Angkasa No. 41','Jl. Gantar No. 5','Jl. Pelita No. 19',
    'Jl. Sukagumiwang No. 10','Jl. Bunga No. 22','Jl. Lohbener No. 63','Jl. Cempaka No. 30',
    'Jl. Arahan No. 17','Jl. Garuda No. 8','Jl. Pasekan No. 25','Jl. Elang No. 13',
    'Jl. Patrol No. 44','Jl. Rajawali No. 6','Jl. Cikedung No. 50','Jl. Merpati No. 12',
    'Jl. Bangodua No. 16','Jl. Kasuari No. 9','Jl. Bongas No. 28','Jl. Jalak No. 15',
    'Jl. Haurgeulis No. 73','Jl. Cendrawasih No. 4','Jl. Anjatan No. 31','Jl. Nuri No. 20',
    'Jl. Gabuswetan No. 11','Jl. Kenari No. 27','Jl. Sukra No. 22','Jl. Lovebird No. 33'
  ];

  jadwal_ids INT[];
  registrasi_ids INT[];
  v_reg_idx INT;
  v_jadwal_idx INT;
  v_counter INT;
  v_jadwal RECORD;
  v_nama TEXT;
  v_telepon TEXT;
  v_golongan TEXT;
  v_nik TEXT;
  v_jk TEXT;
  v_tgl_lahir DATE;
  v_kecamatan TEXT;
  v_alamat TEXT;
  v_status TEXT;
  v_status_kehadiran TEXT;
  v_created_at TIMESTAMPTZ;
BEGIN

  -- ── 1. ADMIN ─────────────────────────────────────────────────

  -- Update auth_user_id dari auth.users yang sudah ada
  UPDATE admins SET auth_user_id = au.id
  FROM auth.users au
  WHERE admins.email = au.email AND admins.auth_user_id IS NULL;

  SELECT id INTO v_admin_id FROM admins WHERE email = 'admin@sipeda.id' LIMIT 1;
  SELECT id INTO v_petugas_id FROM admins WHERE email = 'petugas@sipeda.id' LIMIT 1;

  -- ── 2. LOKASI DONOR ──────────────────────────────────────────

  INSERT INTO lokasi_donor (kode_lokasi, nama_lokasi, tipe, alamat, kecamatan, kota, provinsi, koordinat_lat, koordinat_lng, kontak, deskripsi, aktif)
  VALUES
    ('PMI-IDR-001', 'PMI Kabupaten Indramayu', 'PMI', 'Jl. Jenderal Sudirman No. 1', 'Indramayu', 'Indramayu', 'Jawa Barat', -6.3274, 108.3216, '0234-227164', 'Kantor PMI pusat Kabupaten Indramayu. Donor darah setiap hari kerja 08:00-14:00.', TRUE),
    ('RS-IDR-001', 'RSUD Indramayu', 'RS', 'Jl. Mutiara No. 1', 'Indramayu', 'Indramayu', 'Jawa Barat', -6.3289, 108.3198, '0234-227123', 'Unit transfusi darah RSUD Indramayu.', TRUE),
    ('RS-IDR-002', 'RS Sumber Kasih', 'RS', 'Jl. Pahlawan No. 28', 'Indramayu', 'Indramayu', 'Jawa Barat', -6.3312, 108.3224, '0234-225678', 'Rumah sakit swasta dengan UTD terpadu.', TRUE),
    ('PUSK-IDR-001', 'Puskesmas Sindang', 'Puskesmas', 'Jl. Raya Sindang No. 10', 'Sindang', 'Indramayu', 'Jawa Barat', -6.3457, 108.3346, '0234-555001', 'Puskesmas dengan layanan donor darah setiap Kamis.', TRUE),
    ('PUSK-IDR-002', 'Puskesmas Jatibarang', 'Puskesmas', 'Jl. Raya Jatibarang No. 5', 'Jatibarang', 'Indramayu', 'Jawa Barat', -6.3589, 108.3412, '0234-444012', 'Puskesmas aktif donor darah wilayah Jatibarang.', TRUE),
    ('PUSK-IDR-003', 'Puskesmas Karangampel', 'Puskesmas', 'Jl. Pantura No. 88', 'Karangampel', 'Indramayu', 'Jawa Barat', -6.3123, 108.2987, '0234-333045', 'Puskesmas dengan jadwal donor dua mingguan.', TRUE)
  ON CONFLICT (kode_lokasi) DO NOTHING;

  SELECT id INTO v_lok1 FROM lokasi_donor WHERE kode_lokasi = 'PMI-IDR-001';
  SELECT id INTO v_lok2 FROM lokasi_donor WHERE kode_lokasi = 'RS-IDR-001';
  SELECT id INTO v_lok3 FROM lokasi_donor WHERE kode_lokasi = 'PUSK-IDR-001';
  SELECT id INTO v_lok4 FROM lokasi_donor WHERE kode_lokasi = 'PUSK-IDR-002';
  SELECT id INTO v_lok5 FROM lokasi_donor WHERE kode_lokasi = 'PUSK-IDR-003';

  -- ── 3. KOMPONEN DARAH ────────────────────────────────────────

  INSERT INTO komponen_darah (nama, kode, deskripsi, aktif)
  VALUES
    ('Whole Blood', 'WB', 'Darah lengkap, didonorkan langsung', TRUE),
    ('Packed Red Cells', 'PRC', 'Sel darah merah pekat', TRUE),
    ('Thrombocyte Concentrate', 'TC', 'Konsentrat trombosit/platelet', TRUE),
    ('Fresh Frozen Plasma', 'FFP', 'Plasma beku segar', TRUE),
    ('Cryoprecipitate', 'CRYO', 'Kriopresipitat untuk faktor pembekuan', TRUE)
  ON CONFLICT (kode) DO NOTHING;

  SELECT id INTO v_wb  FROM komponen_darah WHERE kode = 'WB';
  SELECT id INTO v_prc FROM komponen_darah WHERE kode = 'PRC';
  SELECT id INTO v_tc  FROM komponen_darah WHERE kode = 'TC';
  SELECT id INTO v_ffp FROM komponen_darah WHERE kode = 'FFP';
  SELECT id INTO v_cryo FROM komponen_darah WHERE kode = 'CRYO';

  -- ── 4. KATEGORI ARTIKEL ──────────────────────────────────────

  INSERT INTO kategori_artikel (nama, slug, deskripsi)
  VALUES
    ('Tips Kesehatan', 'tips-kesehatan', 'Artikel tips dan informasi kesehatan'),
    ('Donor Darah', 'donor-darah', 'Informasi seputar donor darah'),
    ('Berita', 'berita', 'Berita dan pengumuman terkini'),
    ('Edukasi', 'edukasi', 'Artikel edukasi kesehatan')
  ON CONFLICT (slug) DO NOTHING;

  SELECT id INTO v_kat1 FROM kategori_artikel WHERE slug = 'tips-kesehatan';
  SELECT id INTO v_kat2 FROM kategori_artikel WHERE slug = 'donor-darah';
  SELECT id INTO v_kat3 FROM kategori_artikel WHERE slug = 'berita';
  SELECT id INTO v_kat4 FROM kategori_artikel WHERE slug = 'edukasi';

  -- ── 5. PENGATURAN ────────────────────────────────────────────

  INSERT INTO pengaturan (kunci, nilai, tipe, keterangan)
  VALUES
    ('site_name', 'SIPEDA', 'text', 'Nama website'),
    ('site_tagline', 'Sistem Informasi Pendonoran Darah Indramayu', 'text', 'Tagline website'),
    ('stok_update_publik', 'true', 'boolean', 'Tampilkan stok darah ke publik'),
    ('registrasi_aktif', 'true', 'boolean', 'Aktifkan fitur registrasi donor'),
    ('kontak_darurat', '0234-2271648', 'text', 'Nomor kontak darurat PMI'),
    ('email_notif', 'admin@sipeda.id', 'text', 'Email penerima notifikasi')
  ON CONFLICT (kunci) DO NOTHING;

  -- ── 6. STOK DARAH ────────────────────────────────────────────

  INSERT INTO stok_darah (lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, updated_by) VALUES
    (v_lok1, v_wb, 'A+', 45, 10, v_admin_id),(v_lok1, v_wb, 'A-',  3, 10, v_admin_id),
    (v_lok1, v_wb, 'B+', 38, 10, v_admin_id),(v_lok1, v_wb, 'B-',  0, 10, v_admin_id),
    (v_lok1, v_wb, 'AB+',22, 10, v_admin_id),(v_lok1, v_wb, 'AB-', 5, 10, v_admin_id),
    (v_lok1, v_wb, 'O+', 60, 10, v_admin_id),(v_lok1, v_wb, 'O-',  8, 10, v_admin_id),
    (v_lok1, v_prc,'A+', 30, 8,  v_admin_id),(v_lok1, v_prc,'A-',  0, 8,  v_admin_id),
    (v_lok1, v_prc,'B+', 25, 8,  v_admin_id),(v_lok1, v_prc,'B-',  2, 8,  v_admin_id),
    (v_lok1, v_prc,'AB+',12, 8,  v_admin_id),(v_lok1, v_prc,'AB-', 0, 8,  v_admin_id),
    (v_lok1, v_prc,'O+', 40, 8,  v_admin_id),(v_lok1, v_prc,'O-',  6, 8,  v_admin_id),
    (v_lok1, v_tc, 'A+', 10, 5,  v_admin_id),(v_lok1, v_tc, 'B+',  8, 5,  v_admin_id),
    (v_lok1, v_tc, 'O+', 15, 5,  v_admin_id),(v_lok1, v_tc, 'AB+', 3, 5,  v_admin_id),
    (v_lok1, v_ffp,'A+', 20, 5,  v_admin_id),(v_lok1, v_ffp,'B+', 18, 5,  v_admin_id),
    (v_lok1, v_ffp,'O+', 25, 5,  v_admin_id),(v_lok1, v_ffp,'AB+', 7, 5,  v_admin_id),
    (v_lok2, v_wb, 'A+', 20, 8,  v_admin_id),(v_lok2, v_wb, 'A-',  0, 8,  v_admin_id),
    (v_lok2, v_wb, 'B+', 18, 8,  v_admin_id),(v_lok2, v_wb, 'B-',  4, 8,  v_admin_id),
    (v_lok2, v_wb, 'AB+',10, 8,  v_admin_id),(v_lok2, v_wb, 'AB-', 0, 8,  v_admin_id),
    (v_lok2, v_wb, 'O+', 30, 8,  v_admin_id),(v_lok2, v_wb, 'O-',  6, 8,  v_admin_id),
    (v_lok2, v_prc,'A+', 15, 5,  v_admin_id),(v_lok2, v_prc,'B+', 12, 5,  v_admin_id),
    (v_lok2, v_prc,'O+', 20, 5,  v_admin_id),(v_lok2, v_prc,'AB+', 5, 5,  v_admin_id),
    (v_lok5, v_wb, 'A+',  8, 5,  v_admin_id),(v_lok5, v_wb, 'B+',  6, 5,  v_admin_id),
    (v_lok5, v_wb, 'O+', 12, 5,  v_admin_id),(v_lok5, v_wb, 'AB+', 2, 5,  v_admin_id),
    (v_lok5, v_wb, 'O-',  0, 5,  v_admin_id)
  ON CONFLICT (lokasi_id, komponen_id, golongan_darah) DO NOTHING;

  -- ── 7. JADWAL DONOR ──────────────────────────────────────────

  INSERT INTO jadwal_donor (lokasi_id, tanggal, waktu_mulai, waktu_selesai, kuota, sisa_kuota, deskripsi, status, created_by) VALUES
    (v_lok1, CURRENT_DATE - 14, '08:00', '12:00', 50, 1, 'Donor darah rutin PMI Indramayu (bulan lalu)', 'selesai', v_admin_id),
    (v_lok1, CURRENT_DATE - 10, '08:00', '13:00', 60, 0, 'Aksi donor massal HUT PMI ke-50', 'selesai', v_admin_id),
    (v_lok2, CURRENT_DATE - 7,  '08:30', '11:30', 30, 2, 'Donor sosial RSUD Indramayu', 'selesai', v_admin_id),
    (v_lok3, CURRENT_DATE - 5,  '08:00', '11:00', 25, 0, 'Donor darah Puskesmas Sindang', 'selesai', v_admin_id),
    (v_lok1, CURRENT_DATE + 1,  '08:00', '12:00', 50, 20, 'Donor darah rutin bulanan PMI. Snack dan sertifikat.', 'aktif', v_admin_id),
    (v_lok1, CURRENT_DATE + 4,  '08:00', '13:00', 60, 60, 'HUT PMI — Doorprize menarik untuk setiap pendonor!', 'aktif', v_admin_id),
    (v_lok1, CURRENT_DATE + 8,  '09:00', '12:00', 40, 18, 'Donor khusus golongan O dan B — stok kritis.', 'aktif', v_admin_id),
    (v_lok2, CURRENT_DATE + 2,  '08:30', '11:30', 30, 15, 'Donor darah RSUD Indramayu — kerja sama PMI.', 'aktif', v_admin_id),
    (v_lok2, CURRENT_DATE + 10, '08:00', '12:00', 45, 45, 'Aksi donor semester II PMI & RSUD.', 'aktif', v_admin_id),
    (v_lok3, CURRENT_DATE + 3,  '08:00', '11:00', 25, 5, 'Donor darah Puskesmas Sindang — kuota terbatas.', 'aktif', v_admin_id),
    (v_lok3, CURRENT_DATE + 12, '08:00', '11:00', 25, 25, 'Donor darah rutin dua mingguan.', 'aktif', v_admin_id),
    (v_lok4, CURRENT_DATE + 6,  '08:30', '11:30', 35, 35, 'Donor darah Puskesmas Jatibarang — peserta umum.', 'aktif', v_admin_id),
    (v_lok4, CURRENT_DATE + 17, '08:30', '11:30', 35, 35, 'Donor darah Jatibarang — khusus karyawan.', 'aktif', v_admin_id),
    (v_lok5, CURRENT_DATE + 5,  '09:00', '12:00', 30, 10, 'Donor darah Puskesmas Karangampel.', 'aktif', v_admin_id),
    (v_lok5, CURRENT_DATE + 15, '09:00', '12:00', 30, 30, 'Donor darah Karangampel — edisi akhir bulan.', 'aktif', v_admin_id),
    (v_lok1, CURRENT_DATE + 20, '08:00', '12:00', 50, 50, 'Donor darah awal bulan — PMI Indramayu.', 'aktif', v_admin_id),
    (v_lok1, CURRENT_DATE + 28, '08:00', '12:00', 50, 50, 'Donor darah akhir bulan Agustus.', 'aktif', v_admin_id)
  ON CONFLICT DO NOTHING;

  -- ── 8. REGISTRASI DONOR ───────────────────────────────────────

  jadwal_ids := ARRAY(SELECT id FROM jadwal_donor ORDER BY id);
  v_counter := 0;

  FOR v_jadwal_idx IN 1..array_length(jadwal_ids, 1) LOOP
    FOR v_reg_idx IN 1..(CASE
      WHEN v_jadwal_idx <= 4 THEN 10
      WHEN v_jadwal_idx = 5 THEN 5
      ELSE 2
    END) LOOP
      v_counter := v_counter + 1;
      IF v_counter > 48 THEN EXIT; END IF;

      v_nama := nama_arr[v_counter];
      v_telepon := tlp_arr[v_counter];
      v_golongan := goldar_arr[1 + (v_counter % 8)];
      v_nik := nik_arr[1 + ((v_counter - 1) % 35)];
      v_jk := jk_arr[v_counter];
      v_tgl_lahir := tgl_lahir_arr[v_counter];
      v_kecamatan := kecamatan_arr[v_counter];
      v_alamat := alamat_arr[v_counter];

      v_status := CASE
        WHEN v_jadwal_idx <= 4 THEN 'hadir'
        WHEN v_jadwal_idx = 5 AND v_reg_idx <= 3 THEN 'confirmed'
        WHEN v_jadwal_idx = 5 THEN 'pending'
        ELSE 'pending'
      END;

      v_created_at := NOW() - INTERVAL '1 day' * (45 - v_counter);

      BEGIN
        INSERT INTO registrasi_donor (
          jadwal_id, nama, telepon, golongan_darah, nik, jenis_kelamin,
          tanggal_lahir, alamat, status, status_kehadiran, riwayat_donor, created_at
        ) VALUES (
          jadwal_ids[v_jadwal_idx], v_nama, v_telepon, v_golongan::golongan_darah, v_nik, v_jk,
          v_tgl_lahir, v_alamat, v_status::reg_status,
          CASE WHEN v_status = 'hadir' THEN 'hadir' ELSE NULL END,
          CASE WHEN v_counter % 3 = 0 THEN TRUE ELSE FALSE END,
          v_created_at
        )
        ON CONFLICT DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;
  END LOOP;

  -- ── 9. PENCATATAN DONOR (untuk yang hadir) ──────────────────

  -- Untuk registrasi status 'hadir', buat pencatatan
  FOR v_jadwal IN SELECT rd.id AS reg_id, rd.nama, rd.golongan_darah, rd.jadwal_id, rd.created_at
      FROM registrasi_donor rd WHERE rd.status = 'hadir'
      AND NOT EXISTS (SELECT 1 FROM pencatatan_donor pd WHERE pd.registrasi_id = rd.id)
  LOOP
    DECLARE
      v_hb NUMERIC(4,1);
      v_sistol SMALLINT;
      v_diastol SMALLINT;
      v_bb NUMERIC(5,1);
      v_status_donor TEXT;
    BEGIN
      v_hb := 12.5 + random() * 4.0;
      v_sistol := 100 + (random() * 40)::int;
      v_diastol := 65 + (random() * 25)::int;
      v_bb := 50 + random() * 30;

      v_status_donor := CASE
        WHEN v_hb >= 12.5 AND v_sistol BETWEEN 100 AND 170 AND v_diastol BETWEEN 70 AND 100
        THEN 'berhasil'
        WHEN v_hb < 12.5 THEN 'tidak_memenuhi_syarat'
        ELSE 'gagal'
      END;

      INSERT INTO pencatatan_donor (
        jadwal_id, registrasi_id, nama_pendonor, golongan_darah,
        status_donor, hemoglobin, tensi_sistolik, tensi_diastolik,
        berat_badan, dicatat_oleh, created_at
      ) VALUES (
        v_jadwal.jadwal_id, v_jadwal.reg_id, v_jadwal.nama,
        CASE WHEN v_jadwal.golongan_darah = 'Tidak Tahu' THEN 'A+' ELSE v_jadwal.golongan_darah END,
        v_status_donor, v_hb, v_sistol, v_diastol, v_bb,
        CASE WHEN random() < 0.5 THEN v_admin_id ELSE v_petugas_id END,
        v_jadwal.created_at + INTERVAL '1 hour'
      )
      ON CONFLICT DO NOTHING;
    END;
  END LOOP;

  -- ── 10. ARTIKEL ─────────────────────────────────────────────

  INSERT INTO artikel (judul, slug, excerpt, konten, kategori_id, penulis, status, unggulan, views, published_at, created_at) VALUES
  (
    'Manfaat Donor Darah bagi Kesehatan Pendonor',
    'manfaat-donor-darah-bagi-kesehatan',
    'Donor darah rutin menurunkan risiko penyakit jantung, membantu deteksi dini, dan membakar kalori. Simak 4 manfaat utamanya!',
    '<h2>Donor Darah Bukan Hanya Tentang Memberi</h2><p>Banyak orang mengira donor darah hanya menguntungkan penerimanya. Faktanya, pendonor juga mendapatkan manfaat kesehatan yang signifikan.</p><h3>1. Menurunkan Risiko Penyakit Jantung</h3><p>Donor darah membantu mengurangi viskositas darah dan kadar zat besi berlebih, yang berkaitan dengan risiko penyakit jantung dan stroke.</p><h3>2. Deteksi Dini Penyakit</h3><p>Setiap donor menjalani pemeriksaan: tekanan darah, hemoglobin, golongan darah. Ini bisa menjadi deteksi dini masalah kesehatan.</p><h3>3. Produksi Sel Darah Baru</h3><p>Tubuh akan memproduksi sel darah merah baru untuk menggantikan yang hilang. Proses regenerasi ini menjaga vitalitas.</p><h3>4. Membakar Kalori</h3><p>Donor darah membakar sekitar 650 kalori per sesi karena proses regenerasi darah.</p><p>Yuk jadikan donor darah sebagai gaya hidup sehat!</p>',
    v_kat2, 'Tim Medis PMI Indramayu', 'published', TRUE, 245, NOW() - INTERVAL '3 days', NOW() - INTERVAL '7 days'
  ),
  (
    'Syarat dan Persiapan Sebelum Donor Darah',
    'syarat-persiapan-donor-darah',
    'Sebelum donor, ada syarat kesehatan dan persiapan yang perlu dipenuhi. Berikut panduan lengkapnya.',
    '<h2>Persiapkan Dirimu Sebelum Donor</h2><p>Donor darah adalah tindakan mulia, namun ada hal yang perlu dipersiapkan.</p><h3>Syarat Umum</h3><ul><li>Usia 17-65 tahun</li><li>Berat badan minimal 45 kg</li><li>Tekanan darah normal</li><li>Hemoglobin minimal 12,5 g/dL</li><li>Tidak sedang sakit</li></ul><h3>Persiapan</h3><ul><li>Tidur cukup minimal 5 jam</li><li>Makan dan minum sebelum donor</li><li>Jangan puasa</li><li>Hindari makanan berlemak</li></ul>',
    v_kat2, 'Admin SIPEDA', 'published', FALSE, 189, NOW() - INTERVAL '7 days', NOW() - INTERVAL '14 days'
  ),
  (
    'Mengenal Golongan Darah dan Komponen Darah',
    'mengenal-golongan-darah-dan-komponen',
    'Apa perbedaan golongan darah A, B, AB, dan O? Pelajari semua tentang komponen darah.',
    '<h2>Sistem Golongan Darah ABO</h2><p>Golongan darah dibagi berdasarkan antigen pada sel darah merah.</p><h3>Golongan O — Universal Donor</h3><p>Tidak memiliki antigen A/B, aman ditransfusikan ke semua golongan dalam kondisi darurat.</p><h3>Golongan AB — Universal Recipient</h3><p>Bisa menerima darah dari semua golongan.</p><h2>Komponen Darah</h2><ul><li><strong>Whole Blood (WB)</strong> — Darah lengkap</li><li><strong>Packed Red Cells (PRC)</strong> — Sel darah merah pekat</li><li><strong>Thrombocyte Concentrate (TC)</strong> — Trombosit untuk DBD</li><li><strong>Fresh Frozen Plasma (FFP)</strong> — Plasma</li></ul>',
    v_kat4, 'Tim Edukasi PMI', 'published', FALSE, 132, NOW() - INTERVAL '12 days', NOW() - INTERVAL '20 days'
  ),
  (
    'PMI Indramayu Gelar Aksi Donor Darah Massal',
    'pmi-indramayu-aksi-donor-massal',
    'Aksi donor darah massal berhasil mengumpulkan ratusan kantong darah. Simak laporan lengkapnya.',
    '<h2>Aksi Donor Darah Massal PMI Indramayu</h2><p>PMI Indramayu sukses menggelar donor darah massal diikuti ratusan warga dari berbagai kecamatan.</p><h3>Hasil Kegiatan</h3><ul><li>Total pendonor: 312 orang</li><li>Kantong darah terkumpul: 287 kantong</li><li>Golongan terbanyak: O+ (94 kantong)</li><li>Golongan paling dibutuhkan: O- dan B-</li></ul><p>Kepala PMI menyampaikan terima kasih kepada seluruh pendonor.</p>',
    v_kat3, 'Redaksi SIPEDA', 'published', TRUE, 478, NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days'
  ),
  (
    'Tips Menjaga Kesehatan Setelah Donor Darah',
    'tips-setelah-donor-darah',
    'Setelah donor darah, tubuh perlu pemulihan. Ikuti tips berikut agar tetap sehat.',
    '<h2>Pemulihan Setelah Donor Darah</h2><p>Setelah mendonorkan darah, ada beberapa hal yang perlu diperhatikan:</p><ul><li>Istirahat 10-15 menit di tempat donor</li><li>Minum air putih yang cukup</li><li>Konsumsi makanan bergizi</li><li>Hindari olahraga berat 5 jam</li><li>Jangan merokok 2 jam setelah donor</li><li>Jaga perban tetap kering 3-4 jam</li></ul><p>Jika merasa pusing, segera berbaring dan minum air manis.</p>',
    v_kat1, 'Tim Medis PMI', 'published', FALSE, 87, NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days'
  ),
  (
    'Mitos dan Fakta Seputar Donor Darah',
    'mitos-fakta-donor-darah',
    'Donor darah bikin gemuk? Bikin ketergantungan? Yuk cek mitos vs fakta!',
    '<h2>Mitos vs Fakta Donor Darah</h2><h3>❌ Mitos: Donor darah bikin gemuk</h3><p>✅ Fakta: Donor darah membakar 650 kalori, tidak menyebabkan kenaikan berat badan.</p><h3>❌ Mitos: Donor darah bikin ketergantungan</h3><p>✅ Fakta: Tubuh secara alami meregenerasi sel darah. Tidak ada efek ketergantungan.</p><h3>❌ Mitos: Darah bisa habis</h3><p>✅ Fakta: Hanya 350-450 ml yang diambil, tubuh memulihkan dalam 24-48 jam.</p><h3>❌ Mitos: Saya tidak cukup sehat untuk donor</h3><p>✅ Fakta: Petugas akan memeriksa kondisi Anda sebelum donor.</p>',
    v_kat4, 'Admin SIPEDA', 'published', FALSE, 201, NOW() - INTERVAL '8 days', NOW() - INTERVAL '15 days'
  ),
  (
    'Update Stok Darah: Golongan O- dan B- Kritis',
    'update-stok-darah-kritis',
    'Stok darah O- dan B- di PMI Indramayu menipis. PMI mengimbau pendonor untuk datang.',
    '<h2>Stok Darah Menipis</h2><p>Saat ini stok darah golongan O- dan B- di PMI Kabupaten Indramayu berada dalam kondisi kritis.</p><p>PMI mengimbau pendonor dengan golongan darah tersebut untuk mendaftar donor melalui SIPEDA atau datang langsung ke kantor PMI.</p><p>Untuk golongan darah O- yang merupakan universal donor, kebutuhan selalu tinggi, terutama untuk kasus darurat.</p>',
    v_kat3, 'Admin SIPEDA', 'published', TRUE, 312, NOW() - INTERVAL '2 days', NOW() - INTERVAL '4 days'
  )
  ON CONFLICT (slug) DO NOTHING;

  -- ── 11. TESTIMONIAL ─────────────────────────────────────────

  INSERT INTO testimonial (nama, jabatan, isi, rating, urutan, aktif)
  VALUES
    ('Mega Wulandari', 'Ibu Rumah Tangga', 'Terima kasih SIPEDA! Saya jadi tahu jadwal donor di dekat rumah tanpa harus datang ke PMI dulu. Sangat membantu!', 5, 1, TRUE),
    ('Dedi Kurniawan', 'Karyawan Swasta', 'Aplikasi ini memudahkan saya mendaftar donor tanpa antre panjang. Kode registrasi langsung dikirim, praktis!', 5, 2, TRUE),
    ('Siti Nurhaliza', 'Guru SD', 'Donor darah rutin tiap 3 bulan sekarang lebih terencana berkat SIPEDA. Jadwalnya akurat dan informasinya lengkap.', 5, 3, TRUE),
    ('Ahmad Fauzi', 'Petani', 'Saya bisa cek stok darah langsung dari HP. Kalau stok O+ menurun, saya langsung daftar donor. Mantap!', 4, 4, TRUE),
    ('Dewi Sartika', 'Perawat', 'Sebagai tenaga kesehatan, saya lihat SIPEDA sangat membantu koordinasi PMI dan pendonor. Sistemnya transparan.', 5, 5, TRUE),
    ('Hendra Gunawan', 'Wiraswasta', 'Pertama kali donor malah daftar lewat online. Awalnya ragu, ternyata mudah dan cepat. Saya jadi donor rutin sekarang.', 5, 6, TRUE)
  ON CONFLICT DO NOTHING;

  -- ── 12. FAQ ──────────────────────────────────────────────────

  INSERT INTO faq (pertanyaan, jawaban, kategori, urutan, aktif) VALUES
    ('Apa itu donor darah?', 'Donor darah adalah proses pengambilan darah dari seseorang secara sukarela untuk disimpan di bank darah sebagai stok atau diberikan kepada yang memerlukan.', 'umum', 1, TRUE),
    ('Siapa saja yang boleh donor darah?', 'Usia 17-65 tahun, berat minimal 45 kg, tekanan darah normal (sistol 100-170 mmHg, diastol 70-100 mmHg), Hb >=12,5 g/dL, tidak sedang sakit atau hamil.', 'syarat', 1, TRUE),
    ('Seberapa sering boleh donor darah?', 'Donor darah dapat dilakukan setiap 3 bulan sekali (12 minggu) untuk menjaga kesehatan pendonor.', 'syarat', 2, TRUE),
    ('Apakah donor darah aman?', 'Ya, sangat aman. Semua jarum steril dan sekali pakai. Proses seleksi memastikan pendonor dalam kondisi sehat.', 'umum', 2, TRUE),
    ('Berapa lama proses donor darah?', '45-60 menit termasuk registrasi, pemeriksaan kesehatan (10-15 menit), dan pengambilan darah (8-10 menit).', 'proses', 1, TRUE),
    ('Apa yang harus dilakukan sebelum donor?', 'Tidur cukup minimal 5 jam, makan dan minum (jangan puasa), hindari makanan berlemak, perbanyak minum air.', 'proses', 2, TRUE),
    ('Apa yang harus dilakukan setelah donor?', 'Istirahat 10-15 menit, minum dan makan cukup, hindari aktivitas berat 5 jam, jaga perban tetap kering.', 'proses', 3, TRUE),
    ('Bagaimana cara mengetahui golongan darah?', 'Saat donor pertama, petugas PMI akan memeriksa golongan darah Anda secara gratis.', 'stok', 1, TRUE),
    ('Apakah saya perlu puasa sebelum donor?', 'Tidak! Justru Anda harus makan terlebih dahulu. Donor dalam kondisi puasa berisiko pusing atau pingsan.', 'syarat', 3, TRUE),
    ('Apa yang terjadi jika saya tidak bisa hadir setelah daftar?', 'Anda bisa membatalkan pendaftaran melalui halaman status registrasi dengan memasukkan kode registrasi.', 'proses', 4, TRUE),
    ('Apakah ada pemeriksaan kesehatan sebelum donor?', 'Ya, setiap pendonor diperiksa tekanan darah, hemoglobin (Hb), berat badan, dan suhu tubuh.', 'proses', 5, TRUE),
    ('Kapan waktu terbaik untuk donor darah?', 'Pagi hari setelah sarapan ringan adalah waktu terbaik karena tubuh masih segar dan kadar cairan optimal.', 'umum', 3, TRUE)
  ON CONFLICT DO NOTHING;

  -- ── 13. PENGUMUMAN ──────────────────────────────────────────

  INSERT INTO pengumuman (judul, isi, tipe, link, link_teks, aktif, tanggal_mulai, tanggal_selesai, created_by)
  VALUES
    (
      'Stok Darah O- dan B- Sangat Menipis',
      'PMI Indramayu membutuhkan pendonor golongan O- dan B- secara mendesak. Silakan daftar melalui jadwal donor atau datang langsung ke kantor PMI.',
      'darurat', '/jadwal', 'Daftar Donor', TRUE, CURRENT_DATE, CURRENT_DATE + 14, v_admin_id
    ),
    (
      'Aksi Donor Darah Massal HUT PMI',
      'Dalam rangka HUT PMI ke-50, akan diadakan donor darah massal di PMI Indramayu pada tanggal ' || TO_CHAR(CURRENT_DATE + 4, 'DD Mon YYYY') || '. Doorprize menarik menanti!',
      'sukses', '/jadwal', 'Lihat Jadwal', TRUE, CURRENT_DATE, CURRENT_DATE + 5, v_admin_id
    ),
    (
      'Jadwal Donor Akhir Bulan',
      'Jadwal donor di Puskesmas Karangampel dan Jatibarang akan ditambah akhir bulan ini. Pantau terus jadwal di SIPEDA.',
      'info', '/jadwal', 'Cek Jadwal', TRUE, CURRENT_DATE, CURRENT_DATE + 20, v_admin_id
    )
  ON CONFLICT DO NOTHING;

END seed $$;
