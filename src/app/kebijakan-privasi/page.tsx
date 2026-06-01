import type { Metadata } from 'next';
import { Shield, Mail, FileText, Lock, Eye, Trash2, Cookie } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Kebijakan Privasi',
    description: 'Kebijakan privasi SIPEDA — bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda.',
};

const sections = [
    {
        icon: Shield,
        title: '1. Pengumpulan Data Pribadi',
        content: [
            'Kami mengumpulkan data pribadi yang Anda berikan secara sukarela saat mendaftar donor darah, termasuk:',
            'Nama lengkap, nomor KTP/NIK, nomor telepon, alamat email, tanggal lahir, jenis kelamin, alamat, golongan darah, dan riwayat donor.',
            'Data dikumpulkan melalui formulir registrasi online di situs SIPEDA maupun formulir fisik di lokasi donor.',
        ],
    },
    {
        icon: Eye,
        title: '2. Penggunaan Data',
        content: [
            'Data pribadi Anda digunakan untuk:',
            '• Verifikasi dan pencatatan donor darah',
            '• Komunikasi jadwal donor dan informasi terkait',
            '• Penerbitan sertifikat/kartu donor digital',
            '• Pelaporan statistik anonim ke PMI Kabupaten Indramayu',
            '• Peningkatan layanan SIPEDA',
            'Data tidak akan digunakan untuk tujuan komersial atau pemasaran tanpa persetujuan eksplisit Anda.',
        ],
    },
    {
        icon: Lock,
        title: '3. Penyimpanan & Keamanan Data',
        content: [
            'Data Anda disimpan di server Supabase yang aman dengan enkripsi TLS/SSL. Akses ke data pribadi dibatasi hanya untuk petugas yang berwenang (admin dan petugas lapangan PMI).',
            'Kami menerapkan Row Level Security (RLS) untuk memastikan setiap pengguna hanya dapat mengakses data yang menjadi haknya.',
            'Password akun admin/petugas di-hash dan tidak pernah disimpan dalam bentuk plain text.',
        ],
    },
    {
        icon: Trash2,
        title: '4. Hak Anda — Penghapusan Data',
        content: [
            'Sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022, Anda memiliki hak untuk:',
            '• Mengakses data pribadi yang kami simpan',
            '• Meminta koreksi data yang tidak akurat',
            '• Meminta penghapusan data pribadi Anda (Hapus Akun)',
            '• Membatasi pemrosesan data Anda',
            '• Menarik persetujuan yang telah diberikan sebelumnya',
            'Untuk menghapus akun dan data Anda, silakan hubungi PMI Kabupaten Indramayu melalui kontak di bawah.',
        ],
    },
    {
        icon: Cookie,
        title: '5. Cookie & Teknologi Pelacakan',
        content: [
            'SIPEDA menggunakan cookie esensial untuk menjaga session login Anda tetap aman. Kami tidak menggunakan cookie pelacakan iklan atau cookie pihak ketiga untuk pemasaran.',
            'Cookie session bersifat sementara dan otomatis dihapus saat Anda menutup browser atau logout.',
            'Anda dapat menonaktifkan cookie melalui pengaturan browser, namun beberapa fitur mungkin tidak berfungsi optimal.',
        ],
    },
    {
        icon: FileText,
        title: '6. Pembagian Data ke Pihak Ketiga',
        content: [
            'KAMI TIDAK menjual data pribadi Anda ke pihak ketiga.',
            'Data dapat dibagikan ke pihak ketiga hanya jika:',
            '• Diwajibkan oleh hukum atau peraturan yang berlaku',
            '• Atas persetujuan eksplisit dari Anda',
            '• Untuk keperluan operasional PMI Kabupaten Indramayu (seperti pencatatan stok darah)',
            'Layanan pihak ketiga yang kami gunakan: Supabase (database & autentikasi), Vercel (hosting), Fonnte (WhatsApp gateway) — semuanya memiliki kebijakan privasi yang ketat.',
        ],
    },
    {
        icon: Mail,
        title: '7. Kontak & Pengaduan',
        content: [
            'Jika Anda memiliki pertanyaan, keluhan, atau ingin menggunakan hak Anda terkait data pribadi, silakan hubungi:',
            'PMI Kabupaten Indramayu',
            'Jl. DI. Panjaitan No. 54, Kabupaten Indramayu, Jawa Barat',
            'Telepon: 0811-919-8611',
            'Email: pmi.indramayu@gmail.com',
            'Kami akan merespons dalam waktu 3×24 jam kerja.',
        ],
    },
];

export default function KebijakanPrivasiPage() {
    return (
        <main id="main">
            <section className="bg-gray-950 text-white py-16">
                <div className="page-container">
                    <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
                        Legal
                    </p>
                    <h1 className="text-4xl font-extrabold mb-3">Kebijakan Privasi</h1>
                    <p className="text-gray-400 max-w-xl">
                        Bagaimana SIPEDA mengumpulkan, menggunakan, dan melindungi data pribadi Anda.
                        Berlaku efektif sejak 1 Juni 2026.
                    </p>
                </div>
            </section>

            <div className="page-container py-12">
                <div className="max-w-3xl mx-auto space-y-10">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
                        <strong>Terakhir diperbarui:</strong> 1 Juni 2026. Kebijakan ini dapat berubah sewaktu-waktu.
                        Perubahan akan diumumkan melalui halaman ini.
                    </div>

                    {sections.map(s => (
                        <section key={s.title}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                    <s.icon className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{s.title}</h2>
                            </div>
                            <div className="space-y-3 text-sm text-gray-600 leading-relaxed pl-2">
                                {s.content.map((c, i) => (
                                    <p key={i}>{c}</p>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </main>
    );
}
