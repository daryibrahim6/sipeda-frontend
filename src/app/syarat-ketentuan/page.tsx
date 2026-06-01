import type { Metadata } from 'next';
import { Scale, AlertTriangle, Users, FileText, Ban, Heart } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Syarat & Ketentuan',
    description: 'Syarat dan ketentuan penggunaan layanan SIPEDA — portal informasi donor darah PMI Kabupaten Indramayu.',
};

const sections = [
    {
        icon: FileText,
        title: '1. Penerimaan Ketentuan',
        content: [
            'Dengan mengakses dan menggunakan situs SIPEDA (https://sipeda.vercel.app), Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak setuju dengan salah satu ketentuan, jangan gunakan layanan ini.',
            'SIPEDA dikelola oleh PMI Kabupaten Indramayu untuk kepentingan informasi dan pelayanan donor darah.',
        ],
    },
    {
        icon: Users,
        title: '2. Pengguna Layanan',
        content: [
            'Layanan SIPEDA tersedia untuk:',
            '• Masyarakat umum yang ingin mendaftar donor darah',
            '• Petugas PMI yang bertugas mencatat kegiatan donor',
            '• Admin dan superadmin yang mengelola sistem',
            'Setiap pengguna bertanggung jawab atas keakuratan data yang diberikan dan wajib menjaga kerahasiaan kredensial login.',
        ],
    },
    {
        icon: AlertTriangle,
        title: '3. Tanggung Jawab & Disclaimer',
        content: [
            'Informasi stok darah bersifat real-time berdasarkan data yang dimasukkan oleh petugas. Terdapat jeda waktu antara pengambilan data fisik dengan pembaruan di sistem.',
            'SIPEDA tidak bertanggung jawab atas:',
            '• Kerugian akibat keterlambatan atau ketidakakuratan data',
            '• Gangguan akses akibat pemeliharaan sistem atau force majeure',
            '• Tindakan pengguna yang melanggar ketentuan',
            'Data stok darah dan jadwal donor bersifat informatif. Keputusan medis tetap sepenuhnya wewenang petugas PMI.',
        ],
    },
    {
        icon: Ban,
        title: '4. Larangan',
        content: [
            'Pengguna dilarang:',
            '• Menggunakan sistem untuk tujuan ilegal atau penipuan',
            '• Mengakses data pengguna lain tanpa otorisasi',
            '• Melakukan peretasan, scraping, atau serangan siber',
            '• Menyebarkan informasi palsu atau menyesatkan',
            '• Mendaftar donor dengan identitas palsu',
            'Pelanggaran dapat mengakibatkan pemblokiran akun dan/atau tindakan hukum sesuai peraturan yang berlaku.',
        ],
    },
    {
        icon: Heart,
        title: '5. Layanan Donor Darah',
        content: [
            'Pendaftaran donor online adalah fasilitas untuk mempercepat proses registrasi. Kehadiran dan kelayakan donor tetap diverifikasi oleh petugas PMI di lokasi.',
            'Syarat donor darah mengikuti ketentuan PMI dan Palang Merah Indonesia yang berlaku secara nasional.',
            'Donor darah bersifat sukarela dan tidak dipungut biaya.',
        ],
    },
    {
        icon: Scale,
        title: '6. Hukum yang Berlaku',
        content: [
            'Syarat & Ketentuan ini tunduk pada hukum Negara Kesatuan Republik Indonesia. Setiap sengketa akan diselesaikan melalui musyawarah atau jalur hukum di Pengadilan Negeri Indramayu.',
            'Jika salah satu ketentuan dinyatakan tidak sah, ketentuan lainnya tetap berlaku.',
        ],
    },
];

export default function SyaratKetentuanPage() {
    return (
        <main id="main">
            <section className="bg-gray-950 text-white py-16">
                <div className="page-container">
                    <p className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">
                        Legal
                    </p>
                    <h1 className="text-4xl font-extrabold mb-3">Syarat & Ketentuan</h1>
                    <p className="text-gray-400 max-w-xl">
                        Aturan penggunaan layanan SIPEDA — Sistem Informasi Pendonoran Darah Kabupaten Indramayu.
                        Berlaku efektif sejak 1 Juni 2026.
                    </p>
                </div>
            </section>

            <div className="page-container py-12">
                <div className="max-w-3xl mx-auto space-y-10">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800">
                        <strong>Terakhir diperbarui:</strong> 1 Juni 2026. Dengan menggunakan SIPEDA,
                        Anda menyatakan telah membaca dan menyetujui seluruh syarat & ketentuan ini.
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
