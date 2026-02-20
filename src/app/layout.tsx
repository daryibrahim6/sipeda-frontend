import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sipeda.vercel.app';
const SITE_NAME = 'SIPEDA';
const SITE_DESC = 'Portal informasi donor darah Kabupaten Indramayu — temukan lokasi, cek stok darah real-time, dan daftar jadwal donor.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  `${SITE_NAME} — Sistem Informasi Pendonoran Darah Indramayu`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    'donor darah', 'Indramayu', 'PMI', 'stok darah',
    'jadwal donor', 'SIPEDA', 'bank darah', 'pendonor',
  ],
  authors: [{ name: 'PMI Kabupaten Indramayu' }],
  creator: 'SIPEDA',
  publisher: 'PMI Kabupaten Indramayu',

  openGraph: {
    title:       `${SITE_NAME} — Donor Darah Indramayu`,
    description: SITE_DESC,
    url:         SITE_URL,
    siteName:    SITE_NAME,
    locale:      'id_ID',
    type:        'website',
  },

  twitter: {
    card:        'summary_large_image',
    title:       `${SITE_NAME} — Donor Darah Indramayu`,
    description: SITE_DESC,
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  // Blok halaman admin dari search engine
  // (tiap halaman admin override ini secara otomatis via Next.js metadata inheritance)
};

export const viewport: Viewport = {
  themeColor: '#C60000',
  width:      'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-800`}>
        {/* Skip to main content - accessibility */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg"
        >
          Langsung ke konten
        </a>
        {children}
      </body>
    </html>
  );
}