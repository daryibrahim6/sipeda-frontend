// ─── Primitive types ─────────────────────────────────────────────────────────

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type StockStatus = 'normal' | 'kritis' | 'kosong';
export type ScheduleStatus = 'aktif' | 'penuh' | 'dibatalkan' | 'selesai';
export type LocationType = 'PMI' | 'RS' | 'Klinik' | 'Puskesmas' | 'Lainnya';

// ─── Location ─────────────────────────────────────────────────────────────────

export type Location = {
  id: number;
  kode_lokasi: string;
  nama_lokasi: string;
  tipe: LocationType;
  alamat: string;
  kecamatan: string;
  kota: string;
  koordinat_lat: number;
  koordinat_lng: number;
  kontak: string | null;
  email: string | null;
  penanggung_jawab: string | null;
  foto: string | null;
  deskripsi: string | null;
  jam_operasional: Record<string, string> | null;
  fasilitas: string[] | null;
  aktif: boolean;
  stok_ringkas?: BloodStockSummary[];
  jadwal_aktif?: number;
};

// ─── Schedule ─────────────────────────────────────────────────────────────────

export type Schedule = {
  id: number;
  lokasi_id: number;
  lokasi?: Pick<Location, 'id' | 'nama_lokasi' | 'alamat' | 'kecamatan' | 'koordinat_lat' | 'koordinat_lng'>;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  kuota: number;
  sisa_kuota: number;
  deskripsi: string | null;
  status: ScheduleStatus;
};

// ─── Registration ─────────────────────────────────────────────────────────────

export type RegistrationPayload = {
  jadwal_id: number;
  nama: string;
  email?: string;
  telepon: string;
  golongan_darah: BloodType | 'Tidak Tahu';
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
  riwayat_donor: boolean;
};

export type Registration = RegistrationPayload & {
  id: number;
  kode_registrasi: string;
  status: 'pending' | 'confirmed' | 'hadir' | 'tidak_hadir' | 'dibatalkan';
  created_at: string;
};

// ─── Blood Stock ──────────────────────────────────────────────────────────────

export type BloodStockItem = {
  id: number;
  lokasi_id: number;
  komponen_id: number;
  komponen_nama: string;
  komponen_kode: string;
  golongan_darah: BloodType;
  jumlah: number;
  jumlah_kritis: number;
  status: StockStatus;
  terakhir_update: string;
};

export type BloodStockSummary = {
  golongan_darah: BloodType;
  total: number;
  status: StockStatus;
};

export type BloodStockRow = {
  komponen_id: number;
  komponen_nama: string;
  komponen_kode: string;
  golongan: Record<BloodType, { jumlah: number; status: StockStatus }>;
  total: number;
};

// ─── Article ──────────────────────────────────────────────────────────────────

export type Article = {
  id: number;
  judul: string;
  slug: string;
  excerpt: string | null;
  konten?: string;
  kategori_id: number;
  kategori_nama: string;
  penulis: string;
  gambar: string | null;
  gambar_alt: string | null;
  unggulan: boolean;
  views: number;
  // FIX: published_at nullable — kolom DB adalah TIMESTAMPTZ NULL
  // Error sebelumnya: formatDate(a.published_at) gagal karena tipe 'string | null'
  // tidak diterima oleh formatDate yang hanya accept 'string'
  // Solusi: (1) tipe diubah ke string | null, (2) formatDate diupdate terima null
  published_at: string | null;
};

// ─── Stats ────────────────────────────────────────────────────────────────────

export type SiteStats = {
  total_stok: number;
  lokasi_aktif: number;
  jadwal_aktif: number;
  total_stok_kritis: number;
};

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export type FAQ = {
  id: number;
  pertanyaan: string;
  jawaban: string;
  kategori: 'umum' | 'syarat' | 'proses' | 'stok' | 'lainnya';
};

// ─── Testimonial ──────────────────────────────────────────────────────────────

export type Testimonial = {
  id: number;
  nama: string;
  foto: string | null;
  jabatan: string | null;
  isi: string;
  rating: number;
};

// ─── Announcement ─────────────────────────────────────────────────────────────

export type Announcement = {
  id: number;
  judul: string;
  isi: string;
  tipe: 'info' | 'sukses' | 'peringatan' | 'darurat';
  link: string | null;
  link_teks: string | null;
};

// ─── Pencatatan Donor ─────────────────────────────────────────────────────────

export type StatusDonor = 'berhasil' | 'gagal' | 'tidak_memenuhi_syarat';

export type PencatatanDonor = {
  id: number;
  jadwal_id: number;
  nama_pendonor: string;
  golongan_darah: BloodType | 'Tidak Tahu';
  status_donor: StatusDonor;
  catatan: string | null;
  dicatat_oleh: number | null;
  created_at: string;
  // joined
  jadwal?: Pick<Schedule, 'tanggal' | 'waktu_mulai' | 'waktu_selesai'> & {
    lokasi: Pick<Location, 'nama_lokasi'>;
  };
};

export type RekapPencatatan = {
  jadwal_id: number;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  nama_lokasi: string;
  total_catat: number;
  berhasil: number;
  gagal: number;
  tidak_memenuhi: number;
};

// ─── API Wrappers ─────────────────────────────────────────────────────────────

export type ApiResponse<T> = { data: T; message?: string };
export type PaginatedResponse<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};