export type FAQItem = {
  id: number;
  pertanyaan: string;
  jawaban: string;
  kategori: string;
};

export const FAQ_LIST: FAQItem[] = [
  { id: 1, kategori: 'umum', pertanyaan: 'Apa itu SIPEDA?', jawaban: 'SIPEDA (Sistem Informasi Pendonoran Darah) adalah platform digital PMI Kabupaten Indramayu yang memudahkan masyarakat menemukan lokasi donor darah, memantau stok darah, dan mendaftar jadwal donor secara online.' },
  { id: 2, kategori: 'syarat', pertanyaan: 'Berapa usia minimal pendonor darah?', jawaban: 'Pendonor darah harus berusia minimal 17 tahun dan maksimal 65 tahun. Pendonor yang berusia 17 tahun memerlukan izin tertulis dari orang tua.' },
  { id: 3, kategori: 'syarat', pertanyaan: 'Berapa berat badan minimal pendonor?', jawaban: 'Berat badan minimal pendonor adalah 45 kg untuk memastikan keamanan pendonor dan kualitas darah yang didonorkan.' },
  { id: 4, kategori: 'syarat', pertanyaan: 'Apakah saya bisa donor jika sedang sakit?', jawaban: 'Tidak. Pendonor harus dalam kondisi sehat pada saat melakukan donor darah. Jika sedang demam, flu, atau mengonsumsi obat-obatan tertentu, sebaiknya tunda donor hingga kondisi pulih.' },
  { id: 5, kategori: 'proses', pertanyaan: 'Berapa lama proses donor darah?', jawaban: 'Proses donor darah secara keseluruhan membutuhkan waktu sekitar 45 menit, termasuk pendaftaran, pemeriksaan kesehatan awal, proses pengambilan darah (±10 menit), dan istirahat setelah donor.' },
  { id: 6, kategori: 'proses', pertanyaan: 'Berapa kali bisa donor dalam setahun?', jawaban: 'Pendonor pria dapat mendonorkan darah maksimal 5 kali dalam setahun, sedangkan wanita maksimal 4 kali. Jeda minimal antar donor adalah 56 hari (8 minggu).' },
  { id: 7, kategori: 'stok', pertanyaan: 'Seberapa sering data stok darah diperbarui?', jawaban: 'Data stok darah diperbarui secara berkala oleh petugas PMI Indramayu. Untuk informasi paling akurat, khususnya dalam kondisi darurat, silakan hubungi langsung PMI Indramayu di 0234-271648.' },
  { id: 8, kategori: 'umum', pertanyaan: 'Bagaimana cara mendaftar jadwal donor?', jawaban: 'Pilih menu "Jadwal Donor", temukan jadwal yang sesuai, klik "Daftar Sekarang", isi form pendaftaran, dan kamu akan mendapat kode registrasi. Tunjukkan kode tersebut kepada petugas pada hari kegiatan.' },
];
