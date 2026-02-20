import type {
  Location, Schedule, BloodStockRow, Article,
  SiteStats, FAQ, Announcement,
} from './types';

// ─── STATS ───────────────────────────────────────────────────────────────────
export const MOCK_STATS: SiteStats = {
  total_stok: 324,
  lokasi_aktif: 5,
  jadwal_aktif: 8,
  total_stok_kritis: 3,
};

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    judul: 'Stok O- Menipis',
    isi: 'Stok darah golongan O- di PMI Indramayu dalam kondisi kritis. Pendonor golongan O- sangat dibutuhkan.',
    tipe: 'darurat',
    link: '/stok-darah',
    link_teks: 'Cek Stok',
  },
];

// ─── LOCATIONS ───────────────────────────────────────────────────────────────
export const MOCK_LOCATIONS: Location[] = [
  {
    id: 1,
    kode_lokasi: 'PMI-IDR-001',
    nama_lokasi: 'PMI Kabupaten Indramayu',
    tipe: 'PMI',
    alamat: 'Jl. DI. Panjaitan No. 54, Indramayu',
    kecamatan: 'Indramayu',
    kota: 'Indramayu',
    koordinat_lat: -6.3264,
    koordinat_lng: 108.3198,
    kontak: '0234-271648',
    email: 'pmi.indramayu@gmail.com',
    penanggung_jawab: 'dr. Slamet Riyadi',
    foto: null,
    deskripsi: 'Unit Donor Darah PMI Kabupaten Indramayu melayani kebutuhan darah 24 jam.',
    jam_operasional: {
      senin: '07:30–15:00',
      selasa: '07:30–15:00',
      rabu: '07:30–15:00',
      kamis: '07:30–15:00',
      jumat: '07:30–14:00',
      sabtu: '08:00–12:00',
    },
    fasilitas: ['AC', 'Parkir', 'Mushola', 'Ruang Tunggu'],
    aktif: true,
    stok_ringkas: [
      { golongan_darah: 'A+', total: 42, status: 'normal' },
      { golongan_darah: 'B+', total: 38, status: 'normal' },
      { golongan_darah: 'O+', total: 55, status: 'normal' },
      { golongan_darah: 'O-', total: 4, status: 'kritis' },
      { golongan_darah: 'AB+', total: 12, status: 'normal' },
    ],
    jadwal_aktif: 3,
  },
  {
    id: 2,
    kode_lokasi: 'RS-IDR-001',
    nama_lokasi: 'RSUD dr. Soewondo Indramayu',
    tipe: 'RS',
    alamat: 'Jl. Rumah Sakit No. 1, Indramayu',
    kecamatan: 'Sindang',
    kota: 'Indramayu',
    koordinat_lat: -6.3312,
    koordinat_lng: 108.3254,
    kontak: '0234-272101',
    email: null,
    penanggung_jawab: 'dr. Hendra Kusuma',
    foto: null,
    deskripsi: 'Bank darah RSUD dr. Soewondo melayani pasien rawat inap dan darurat.',
    jam_operasional: {
      senin: '08:00–16:00',
      selasa: '08:00–16:00',
      rabu: '08:00–16:00',
      kamis: '08:00–16:00',
      jumat: '08:00–14:30',
    },
    fasilitas: ['AC', 'Parkir', 'Kantin'],
    aktif: true,
    stok_ringkas: [
      { golongan_darah: 'A+', total: 18, status: 'normal' },
      { golongan_darah: 'B+', total: 22, status: 'normal' },
      { golongan_darah: 'O+', total: 30, status: 'normal' },
      { golongan_darah: 'AB-', total: 2, status: 'kritis' },
    ],
    jadwal_aktif: 2,
  },
  {
    id: 3,
    kode_lokasi: 'PUSK-IDR-001',
    nama_lokasi: 'Puskesmas Indramayu',
    tipe: 'Puskesmas',
    alamat: 'Jl. Pahlawan No. 12, Indramayu',
    kecamatan: 'Indramayu',
    kota: 'Indramayu',
    koordinat_lat: -6.3289,
    koordinat_lng: 108.3142,
    kontak: '0234-273001',
    email: null,
    penanggung_jawab: 'dr. Ani Rahayu',
    foto: null,
    deskripsi: 'Pusat kesehatan masyarakat dengan layanan donor darah terjadwal.',
    jam_operasional: {
      senin: '08:00–14:00',
      selasa: '08:00–14:00',
      rabu: '08:00–14:00',
      kamis: '08:00–14:00',
      jumat: '08:00–12:00',
    },
    fasilitas: ['AC', 'Parkir'],
    aktif: true,
    stok_ringkas: [
      { golongan_darah: 'A+', total: 8, status: 'normal' },
      { golongan_darah: 'B+', total: 6, status: 'kritis' },
      { golongan_darah: 'O+', total: 10, status: 'normal' },
    ],
    jadwal_aktif: 1,
  },
  {
    id: 4,
    kode_lokasi: 'RS-IDR-002',
    nama_lokasi: 'RS Bhayangkara Indramayu',
    tipe: 'RS',
    alamat: 'Jl. Letnan Suwaji No. 8, Sindang',
    kecamatan: 'Sindang',
    kota: 'Indramayu',
    koordinat_lat: -6.3401,
    koordinat_lng: 108.3267,
    kontak: '0234-274500',
    email: null,
    penanggung_jawab: 'dr. Bambang Susilo',
    foto: null,
    deskripsi: 'Rumah sakit Polri dengan unit bank darah terstandarisasi.',
    jam_operasional: {
      senin: '08:00–16:00',
      selasa: '08:00–16:00',
      rabu: '08:00–16:00',
      kamis: '08:00–16:00',
      jumat: '08:00–14:30',
      sabtu: '09:00–13:00',
    },
    fasilitas: ['AC', 'Parkir Luas'],
    aktif: true,
    stok_ringkas: [
      { golongan_darah: 'A+', total: 20, status: 'normal' },
      { golongan_darah: 'O+', total: 15, status: 'normal' },
      { golongan_darah: 'B-', total: 0, status: 'kosong' },
    ],
    jadwal_aktif: 1,
  },
  {
    id: 5,
    kode_lokasi: 'KLINIK-IDR-001',
    nama_lokasi: 'Klinik Utama Medika Indramayu',
    tipe: 'Klinik',
    alamat: 'Jl. Sudirman No. 45, Indramayu',
    kecamatan: 'Balongan',
    kota: 'Indramayu',
    koordinat_lat: -6.3198,
    koordinat_lng: 108.3089,
    kontak: '0234-275200',
    email: 'klinikmedika.idr@gmail.com',
    penanggung_jawab: 'dr. Diah Permata',
    foto: null,
    deskripsi: 'Klinik dengan layanan donor darah setiap hari kerja.',
    jam_operasional: {
      senin: '08:30–15:30',
      selasa: '08:30–15:30',
      rabu: '08:30–15:30',
      kamis: '08:30–15:30',
      jumat: '08:30–14:00',
    },
    fasilitas: ['AC', 'Parkir'],
    aktif: true,
    stok_ringkas: [
      { golongan_darah: 'A+', total: 5, status: 'kritis' },
      { golongan_darah: 'O+', total: 8, status: 'normal' },
    ],
    jadwal_aktif: 1,
  },
];

// ─── SCHEDULES ───────────────────────────────────────────────────────────────
const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const MOCK_SCHEDULES: Schedule[] = [
  {
    id: 1,
    lokasi_id: 1,
    lokasi: { id: 1, nama_lokasi: 'PMI Kabupaten Indramayu', alamat: 'Jl. DI. Panjaitan No. 54', kecamatan: 'Indramayu', koordinat_lat: -6.3264, koordinat_lng: 108.3198 },
    tanggal: fmt(addDays(today, 2)),
    waktu_mulai: '08:00:00',
    waktu_selesai: '14:00:00',
    kuota: 60,
    sisa_kuota: 32,
    deskripsi: 'Donor darah rutin bulanan PMI Indramayu. Gratis snack dan sertifikat.',
    status: 'aktif',
  },
  {
    id: 2,
    lokasi_id: 2,
    lokasi: { id: 2, nama_lokasi: 'RSUD dr. Soewondo', alamat: 'Jl. Rumah Sakit No. 1', kecamatan: 'Sindang', koordinat_lat: -6.3312, koordinat_lng: 108.3254 },
    tanggal: fmt(addDays(today, 5)),
    waktu_mulai: '09:00:00',
    waktu_selesai: '13:00:00',
    kuota: 40,
    sisa_kuota: 5,
    deskripsi: 'Bakti sosial donor darah HUT RSUD. Tersedia pemeriksaan kesehatan gratis.',
    status: 'aktif',
  },
  {
    id: 3,
    lokasi_id: 1,
    lokasi: { id: 1, nama_lokasi: 'PMI Kabupaten Indramayu', alamat: 'Jl. DI. Panjaitan No. 54', kecamatan: 'Indramayu', koordinat_lat: -6.3264, koordinat_lng: 108.3198 },
    tanggal: fmt(addDays(today, 8)),
    waktu_mulai: '08:00:00',
    waktu_selesai: '15:00:00',
    kuota: 80,
    sisa_kuota: 80,
    deskripsi: 'Kegiatan donor darah massal bekerja sama dengan STIESA Indramayu.',
    status: 'aktif',
  },
  {
    id: 4,
    lokasi_id: 3,
    lokasi: { id: 3, nama_lokasi: 'Puskesmas Indramayu', alamat: 'Jl. Pahlawan No. 12', kecamatan: 'Indramayu', koordinat_lat: -6.3289, koordinat_lng: 108.3142 },
    tanggal: fmt(addDays(today, 10)),
    waktu_mulai: '09:00:00',
    waktu_selesai: '12:00:00',
    kuota: 30,
    sisa_kuota: 30,
    deskripsi: 'Donor darah rutin di Puskesmas Indramayu.',
    status: 'aktif',
  },
  {
    id: 5,
    lokasi_id: 4,
    lokasi: { id: 4, nama_lokasi: 'RS Bhayangkara', alamat: 'Jl. Letnan Suwaji No. 8', kecamatan: 'Sindang', koordinat_lat: -6.3401, koordinat_lng: 108.3267 },
    tanggal: fmt(addDays(today, 14)),
    waktu_mulai: '08:30:00',
    waktu_selesai: '13:30:00',
    kuota: 50,
    sisa_kuota: 50,
    deskripsi: 'Kegiatan donor darah dalam rangka HUT Bhayangkara.',
    status: 'aktif',
  },
  {
    id: 6,
    lokasi_id: 2,
    lokasi: { id: 2, nama_lokasi: 'RSUD dr. Soewondo', alamat: 'Jl. Rumah Sakit No. 1', kecamatan: 'Sindang', koordinat_lat: -6.3312, koordinat_lng: 108.3254 },
    tanggal: fmt(addDays(today, 18)),
    waktu_mulai: '08:00:00',
    waktu_selesai: '14:00:00',
    kuota: 60,
    sisa_kuota: 60,
    deskripsi: 'Donor darah rutin RSUD. Pendaftaran via WhatsApp atau langsung.',
    status: 'aktif',
  },
  // Past / cancelled for variety
  {
    id: 7,
    lokasi_id: 1,
    lokasi: { id: 1, nama_lokasi: 'PMI Kabupaten Indramayu', alamat: 'Jl. DI. Panjaitan No. 54', kecamatan: 'Indramayu', koordinat_lat: -6.3264, koordinat_lng: 108.3198 },
    tanggal: fmt(addDays(today, -7)),
    waktu_mulai: '08:00:00',
    waktu_selesai: '14:00:00',
    kuota: 60,
    sisa_kuota: 0,
    deskripsi: null,
    status: 'selesai',
  },
  {
    id: 8,
    lokasi_id: 5,
    lokasi: { id: 5, nama_lokasi: 'Klinik Utama Medika', alamat: 'Jl. Sudirman No. 45', kecamatan: 'Balongan', koordinat_lat: -6.3198, koordinat_lng: 108.3089 },
    tanggal: fmt(addDays(today, 3)),
    waktu_mulai: '09:00:00',
    waktu_selesai: '12:00:00',
    kuota: 25,
    sisa_kuota: 25,
    deskripsi: 'Donor darah perdana Klinik Medika Indramayu.',
    status: 'aktif',
  },
];

// ─── BLOOD STOCK ─────────────────────────────────────────────────────────────
export const MOCK_BLOOD_STOCK: BloodStockRow[] = [
  {
    komponen_id: 1,
    komponen_nama: 'Whole Blood',
    komponen_kode: 'WB',
    golongan: {
      'A+':  { jumlah: 42, status: 'normal' },
      'A-':  { jumlah: 8,  status: 'normal' },
      'B+':  { jumlah: 38, status: 'normal' },
      'B-':  { jumlah: 5,  status: 'kritis' },
      'AB+': { jumlah: 12, status: 'normal' },
      'AB-': { jumlah: 2,  status: 'kritis' },
      'O+':  { jumlah: 55, status: 'normal' },
      'O-':  { jumlah: 4,  status: 'kritis' },
    },
    total: 166,
  },
  {
    komponen_id: 2,
    komponen_nama: 'Packed Red Cells',
    komponen_kode: 'PRC',
    golongan: {
      'A+':  { jumlah: 28, status: 'normal' },
      'A-':  { jumlah: 4,  status: 'kritis' },
      'B+':  { jumlah: 24, status: 'normal' },
      'B-':  { jumlah: 0,  status: 'kosong' },
      'AB+': { jumlah: 7,  status: 'normal' },
      'AB-': { jumlah: 1,  status: 'kritis' },
      'O+':  { jumlah: 35, status: 'normal' },
      'O-':  { jumlah: 3,  status: 'kritis' },
    },
    total: 102,
  },
  {
    komponen_id: 3,
    komponen_nama: 'Thrombocyte Concentrate',
    komponen_kode: 'TC',
    golongan: {
      'A+':  { jumlah: 10, status: 'normal' },
      'A-':  { jumlah: 2,  status: 'kritis' },
      'B+':  { jumlah: 9,  status: 'normal' },
      'B-':  { jumlah: 0,  status: 'kosong' },
      'AB+': { jumlah: 4,  status: 'normal' },
      'AB-': { jumlah: 0,  status: 'kosong' },
      'O+':  { jumlah: 14, status: 'normal' },
      'O-':  { jumlah: 1,  status: 'kritis' },
    },
    total: 40,
  },
  {
    komponen_id: 4,
    komponen_nama: 'Fresh Frozen Plasma',
    komponen_kode: 'FFP',
    golongan: {
      'A+':  { jumlah: 6,  status: 'normal' },
      'A-':  { jumlah: 1,  status: 'kritis' },
      'B+':  { jumlah: 5,  status: 'normal' },
      'B-':  { jumlah: 0,  status: 'kosong' },
      'AB+': { jumlah: 3,  status: 'normal' },
      'AB-': { jumlah: 0,  status: 'kosong' },
      'O+':  { jumlah: 4,  status: 'kritis' },
      'O-':  { jumlah: 0,  status: 'kosong' },
    },
    total: 19,
  },
];

// ─── ARTICLES ────────────────────────────────────────────────────────────────
export const MOCK_ARTICLES: Article[] = [
  {
    id: 1,
    judul: 'Manfaat Donor Darah Rutin bagi Kesehatan Jantung',
    slug: 'manfaat-donor-darah-rutin-bagi-kesehatan-jantung',
    excerpt: 'Penelitian membuktikan bahwa donor darah secara rutin setiap 3 bulan dapat mengurangi risiko serangan jantung hingga 88%. Kenali manfaat lainnya di sini.',
    konten: `<h2>Donor Darah dan Kesehatan Jantung</h2>
<p>Banyak yang belum tahu bahwa donor darah bukan hanya bermanfaat bagi penerima, tetapi juga memberi dampak positif bagi pendonor itu sendiri. Salah satu manfaat terbesar adalah untuk kesehatan jantung.</p>
<h3>Mengurangi Risiko Penyakit Jantung</h3>
<p>Sebuah penelitian yang dipublikasikan di <em>American Journal of Epidemiology</em> menemukan bahwa pendonor darah rutin memiliki risiko serangan jantung 88% lebih rendah dibanding non-pendonor. Ini karena donor darah membantu mengurangi kadar zat besi berlebih dalam darah, yang merupakan faktor risiko penyakit kardiovaskular.</p>
<h3>Regenerasi Sel Darah Merah</h3>
<p>Setelah donor, tubuh Anda bekerja keras untuk mengganti sel darah merah yang hilang. Proses ini menstimulasi produksi sel darah baru yang lebih segar dan sehat, meningkatkan kualitas darah secara keseluruhan.</p>
<h3>Pemeriksaan Kesehatan Gratis</h3>
<p>Setiap kali donor, Anda menjalani pemeriksaan mini yang mencakup tekanan darah, denyut nadi, kadar hemoglobin, dan golongan darah. Ini adalah cara mudah untuk memantau kondisi kesehatan Anda secara berkala.</p>`,
    kategori_id: 1,
    kategori_nama: 'Kesehatan',
    penulis: 'dr. Slamet Riyadi',
    gambar: null,
    gambar_alt: null,
    unggulan: true,
    views: 1243,
    published_at: addDays(today, -14).toISOString(),
  },
  {
    id: 2,
    judul: 'Syarat Donor Darah yang Wajib Kamu Ketahui Sebelum Mendaftar',
    slug: 'syarat-donor-darah-yang-wajib-kamu-ketahui',
    excerpt: 'Ada beberapa syarat yang harus dipenuhi sebelum bisa mendonorkan darah. Simak daftar lengkapnya agar kunjunganmu tidak sia-sia.',
    konten: `<h2>Syarat Umum Donor Darah</h2>
<p>Sebelum mendaftar jadwal donor, pastikan kamu memenuhi semua syarat berikut ini agar prosesnya berjalan lancar.</p>
<ul>
<li>Usia 17–60 tahun (remaja 17 tahun perlu persetujuan orang tua)</li>
<li>Berat badan minimal 45 kg</li>
<li>Tekanan darah normal: sistolik 90–160 mmHg, diastolik 60–100 mmHg</li>
<li>Hemoglobin: 12,5–17 g/dL</li>
<li>Tidak sedang sakit atau mengkonsumsi antibiotik</li>
<li>Tidak hamil atau menyusui</li>
</ul>`,
    kategori_id: 2,
    kategori_nama: 'Panduan',
    penulis: 'Admin PMI',
    gambar: null,
    gambar_alt: null,
    unggulan: false,
    views: 876,
    published_at: addDays(today, -21).toISOString(),
  },
  {
    id: 3,
    judul: 'Mengenal Komponen Darah: Apa Bedanya Whole Blood, PRC, dan TC?',
    slug: 'mengenal-komponen-darah-whole-blood-prc-tc',
    excerpt: 'Darah yang didonorkan tidak langsung digunakan utuh. PMI memisahkan darah menjadi beberapa komponen sesuai kebutuhan pasien.',
    konten: `<h2>Komponen-Komponen Darah</h2>
<p>Satu kantong darah yang kamu donorkan bisa menyelamatkan hingga 3 nyawa. Bagaimana caranya? PMI memproses darah menjadi beberapa komponen terpisah.</p>
<h3>Whole Blood (WB)</h3>
<p>Darah lengkap yang belum diproses. Digunakan untuk pasien yang kehilangan darah besar-besaran, seperti akibat kecelakaan atau operasi besar.</p>
<h3>Packed Red Cells (PRC)</h3>
<p>Sel darah merah pekat yang dipisahkan dari plasma. Cocok untuk pasien anemia kronis, gagal ginjal, atau talasemia.</p>
<h3>Thrombocyte Concentrate (TC)</h3>
<p>Konsentrat trombosit/platelet. Vital untuk pasien dengue, leukemia, atau yang menjalani kemoterapi.</p>`,
    kategori_id: 1,
    kategori_nama: 'Edukasi',
    penulis: 'Tim Medis PMI',
    gambar: null,
    gambar_alt: null,
    unggulan: false,
    views: 654,
    published_at: addDays(today, -30).toISOString(),
  },
  {
    id: 4,
    judul: 'Stok Darah Golongan O- Menipis: Ini yang Perlu Kamu Lakukan',
    slug: 'stok-darah-o-negatif-menipis',
    excerpt: 'PMI Indramayu saat ini menghadapi kekurangan stok darah golongan O-. Kami mengimbau pendonor O- untuk segera menghubungi unit terdekat.',
    konten: `<h2>Kondisi Darurat Stok O-</h2>
<p>Golongan darah O- adalah donor universal — darah ini bisa diberikan kepada siapa pun dalam kondisi darurat. Inilah mengapa kekurangan stok O- selalu menjadi prioritas.</p>
<p>Saat ini PMI Kabupaten Indramayu hanya memiliki 4 kantong Whole Blood golongan O-, jauh di bawah batas aman 20 kantong.</p>
<h3>Cara Membantu</h3>
<ul>
<li>Hubungi PMI Indramayu di 0234-271648</li>
<li>Daftar jadwal donor terdekat di halaman Jadwal</li>
<li>Sebarkan informasi ini kepada pendonor O- di sekitarmu</li>
</ul>`,
    kategori_id: 3,
    kategori_nama: 'Pengumuman',
    penulis: 'Admin PMI',
    gambar: null,
    gambar_alt: null,
    unggulan: true,
    views: 2104,
    published_at: addDays(today, -3).toISOString(),
  },
  {
    id: 5,
    judul: 'Tips Persiapan Sebelum dan Sesudah Donor Darah',
    slug: 'tips-persiapan-sebelum-sesudah-donor-darah',
    excerpt: 'Persiapan yang baik sebelum donor akan membuat proses lebih lancar dan tubuh kamu pulih lebih cepat. Ini tipsnya.',
    konten: `<h2>Persiapan Sebelum Donor</h2>
<ul>
<li>Tidur cukup minimal 6 jam malam sebelumnya</li>
<li>Makan makanan bergizi 3–4 jam sebelum donor</li>
<li>Minum air putih yang banyak (minimal 500ml ekstra)</li>
<li>Hindari alkohol 24 jam sebelumnya</li>
<li>Bawa KTP atau identitas resmi</li>
</ul>
<h2>Perawatan Setelah Donor</h2>
<ul>
<li>Duduk dan istirahat 10–15 menit sebelum berdiri</li>
<li>Minum jus atau air gula yang disediakan</li>
<li>Hindari aktivitas berat 4–5 jam setelahnya</li>
<li>Buka plester setelah 4–6 jam</li>
</ul>`,
    kategori_id: 2,
    kategori_nama: 'Tips',
    penulis: 'dr. Ani Rahayu',
    gambar: null,
    gambar_alt: null,
    unggulan: false,
    views: 432,
    published_at: addDays(today, -45).toISOString(),
  },
  {
    id: 6,
    judul: 'PMI Indramayu Gelar Donor Darah Massal Peringati HUT ke-78 RI',
    slug: 'pmi-indramayu-donor-darah-massal-hut-ri-78',
    excerpt: 'Dalam rangka HUT Kemerdekaan RI ke-78, PMI Indramayu menggelar kegiatan donor darah massal yang berhasil mengumpulkan 312 kantong darah.',
    konten: `<h2>Sukses Kumpulkan 312 Kantong Darah</h2>
<p>PMI Kabupaten Indramayu berhasil menyelenggarakan kegiatan donor darah massal pada 17 Agustus yang lalu. Kegiatan yang berlangsung selama 8 jam ini berhasil mengumpulkan 312 kantong darah dari 378 pendaftar.</p>
<p>Ketua PMI Kabupaten Indramayu menyampaikan apresiasi kepada seluruh pendonor yang telah meluangkan waktu. "Ini adalah bentuk nyata semangat gotong royong dan cinta tanah air," ujarnya.</p>`,
    kategori_id: 3,
    kategori_nama: 'Berita',
    penulis: 'Tim Humas PMI',
    gambar: null,
    gambar_alt: null,
    unggulan: false,
    views: 789,
    published_at: addDays(today, -60).toISOString(),
  },
];

// ─── FAQs ─────────────────────────────────────────────────────────────────────
export const MOCK_FAQS: FAQ[] = [
  {
    id: 1,
    pertanyaan: 'Berapa lama interval minimal antara dua kali donor darah?',
    jawaban: 'Minimal 56 hari (8 minggu) atau sekitar 3 bulan untuk donor darah lengkap (Whole Blood). Ini memberikan waktu tubuh untuk memproduksi kembali sel darah merah yang cukup.',
    kategori: 'proses',
  },
  {
    id: 2,
    pertanyaan: 'Apakah donor darah menyebabkan badan lemas berkepanjangan?',
    jawaban: 'Tidak, jika kamu memenuhi syarat dan mempersiapkan diri dengan baik. Rasa lelah ringan mungkin terasa beberapa jam setelah donor, tetapi biasanya hilang setelah istirahat, makan, dan minum yang cukup.',
    kategori: 'proses',
  },
  {
    id: 3,
    pertanyaan: 'Apakah penderita darah tinggi bisa mendonorkan darah?',
    jawaban: 'Bisa, selama tekanan darah terkontrol dan dalam batas aman: sistolik 90–160 mmHg dan diastolik 60–100 mmHg. Jika tekanan darah sedang tinggi pada saat pemeriksaan, donor akan ditunda.',
    kategori: 'syarat',
  },
  {
    id: 4,
    pertanyaan: 'Apakah donor darah aman bagi penderita diabetes?',
    jawaban: 'Penderita diabetes yang terkontrol dengan baik dan tidak menggunakan insulin umumnya boleh mendonor. Namun, keputusan akhir ada di tangan petugas medis setelah pemeriksaan.',
    kategori: 'syarat',
  },
  {
    id: 5,
    pertanyaan: 'Berapa banyak darah yang diambil per satu kali donor?',
    jawaban: 'Sebanyak 350–450 ml (sekitar 10% dari total volume darah). Jumlah ini aman dan tidak akan mengganggu fungsi tubuh.',
    kategori: 'proses',
  },
  {
    id: 6,
    pertanyaan: 'Apakah ada imbalan atau bayaran untuk donor darah?',
    jawaban: 'Donor darah bersifat sukarela dan tidak ada imbalan uang. Namun, pendonor biasanya mendapatkan snack, minuman, dan sertifikat penghargaan. PMI juga menyediakan kantong darah gratis bagi pendonor yang membutuhkan.',
    kategori: 'umum',
  },
  {
    id: 7,
    pertanyaan: 'Apakah ibu menyusui boleh donor darah?',
    jawaban: 'Tidak disarankan selama masa menyusui, karena tubuh masih dalam proses pemulihan pasca persalinan dan darah dibutuhkan untuk produksi ASI. Tunggu hingga 6 bulan setelah berhenti menyusui.',
    kategori: 'syarat',
  },
  {
    id: 8,
    pertanyaan: 'Bagaimana cara mengecek golongan darah saya?',
    jawaban: 'Saat pertama kali donor, petugas akan menentukan golongan darah kamu. Hasilnya dicatat di kartu donor dan bisa digunakan sebagai referensi. Pemeriksaan golongan darah mandiri juga tersedia di PMI dan klinik tertentu.',
    kategori: 'umum',
  },
];