import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import { FixedHeader } from '@/components/layout/FixedHeader';
import { PublicShell } from '@/components/layout/PublicShell';
import { Analytics } from '@/components/Analytics';
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sipeda.vercel.app';
const SITE_NAME = 'SIPEDA';
const SITE_DESC = 'Portal informasi donor darah Kabupaten Indramayu — temukan lokasi, cek stok darah real-time, dan daftar jadwal donor.';

const VERIFICATION_META: Record<string, string> = {};
const googleVerif = process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION;
const bingVerif = process.env.NEXT_PUBLIC_BING_VERIFICATION;
if (googleVerif) VERIFICATION_META['google-site-verification'] = googleVerif;
if (bingVerif) VERIFICATION_META['msvalidate.01'] = bingVerif;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Sistem Informasi Pendonoran Darah Indramayu`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  applicationName: SITE_NAME,
  keywords: [
    'donor darah', 'Indramayu', 'PMI', 'stok darah',
    'jadwal donor', 'SIPEDA', 'bank darah', 'pendonor',
  ],
  authors: [{ name: 'PMI Kabupaten Indramayu' }],
  creator: 'SIPEDA',
  publisher: 'PMI Kabupaten Indramayu',
  manifest: '/manifest.json',

  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: SITE_NAME,
  },

  formatDetection: {
    telephone: false,
  },

  openGraph: {
    title: `${SITE_NAME} — Donor Darah Indramayu`,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'id_ID',
    type: 'website',
    images: [{ url: `${SITE_URL}/logo.png`, width: 512, height: 512, alt: SITE_NAME }],
  },

  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Donor Darah Indramayu`,
    description: SITE_DESC,
    images: [`${SITE_URL}/logo.png`],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },

  ...(Object.keys(VERIFICATION_META).length > 0 ? { other: VERIFICATION_META } : {}),
};

export const viewport: Viewport = {
  themeColor: '#C62828',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        suppressHydrationWarning
        className={`${inter.variable} font-sans antialiased`}
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {/* Skip to main content — accessibility */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg"
        >
          Langsung ke konten
        </a>
        {/* Fixed header: banner + navbar */}
        <FixedHeader />

        {/* Progress bar */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {/*
          PublicShell: Footer + MobileBottomNav hidup di sini — satu instance,
          tidak pernah di-unmount saat navigasi antar halaman.
          Admin routes (/admin/*) otomatis dikecualikan.
        */}
        <Suspense fallback={null}>
          <PublicShell>
            {children}
          </PublicShell>
        </Suspense>
      </body>
    </html>
  );
}
