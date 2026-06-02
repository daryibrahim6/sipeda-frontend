'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Download, X, Droplets } from 'lucide-react';
import type { DonorHistoryItem } from '@/lib/api';

type Props = {
  nama: string;
  golongan_darah: string;
  total_donor_berhasil: number;
  item: DonorHistoryItem;
  onClose: () => void;
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function useFocusTrap(dialogRef: React.RefObject<HTMLDivElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement;
    const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const elements = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(selector));
      if (elements.length === 0) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }

    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', trap);
    document.addEventListener('keydown', esc);
    requestAnimationFrame(() => {
      const elements = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(selector) ?? []);
      if (elements.length > 0) elements[0].focus();
    });

    return () => {
      document.removeEventListener('keydown', trap);
      document.removeEventListener('keydown', esc);
      previous?.focus();
    };
  }, [open, dialogRef, onClose]);
}

export default function SertifikatDonor({ nama, golongan_darah, total_donor_berhasil, item, onClose }: Props) {
  const certRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  useFocusTrap(dialogRef, true, onClose);

  const handleDownload = useCallback(async () => {
    const el = certRef.current;
    if (!el) return;
    setDownloading(true);
    setError('');
    try {
      await document.fonts.ready;
      await new Promise(r => setTimeout(r, 200));

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        allowTaint: true,
        removeContainer: true,
        onclone: (clonedDoc) => {
          const root = clonedDoc.documentElement;
          const styles = getComputedStyle(root);
          for (let i = 0; i < styles.length; i++) {
            const prop = styles[i];
            if (prop.startsWith('--')) {
              const val = styles.getPropertyValue(prop);
              if (val.includes('lab(') || val.includes('oklch(') || val.includes('oklab(')) {
                root.style.removeProperty(prop);
              }
            }
          }
        },
      });

      const blob = await new Promise<Blob | null>(resolve =>
        canvas.toBlob(resolve, 'image/png', 1.0),
      );
      if (!blob) throw new Error('Canvas toBlob returned null');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `sertifikat-donor-${nama.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (err) {
      console.error('html2canvas error:', err);
      setError('Gagal menyimpan sertifikat. Coba screenshot manual.');
    } finally {
      setDownloading(false);
    }
  }, [nama]);

  const jadwal = item.jadwal;
  const nomorSertifikat = `SIP-SK-${item.id}-${item.kode_registrasi.slice(-6)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sertifikat Donor Darah"
      ref={dialogRef}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative max-w-lg w-full">
        {/* Close button */}
        <button onClick={onClose} className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors" aria-label="Tutup sertifikat">
          <X className="w-6 h-6" />
        </button>

        {/* Certificate */}
        <div
          ref={certRef}
          style={{
            width: '100%',
            maxWidth: 420,
            margin: '0 auto',
            fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            background: '#ffffff',
            color: '#111827',
            colorScheme: 'light',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Outer decorative border */}
          <div style={{
            margin: 8,
            border: '2px solid #C62828',
            borderRadius: 12,
            padding: 4,
          }}>
            <div style={{
              border: '1px solid #C62828',
              borderRadius: 8,
              padding: '28px 24px 24px',
              textAlign: 'center',
              position: 'relative',
            }}>
              {/* Corner ornaments */}
              <div style={{ position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderTop: '3px solid #C62828', borderLeft: '3px solid #C62828', borderRadius: '4px 0 0 0' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderTop: '3px solid #C62828', borderRight: '3px solid #C62828', borderRadius: '0 4px 0 0' }} />
              <div style={{ position: 'absolute', bottom: 8, left: 8, width: 20, height: 20, borderBottom: '3px solid #C62828', borderLeft: '3px solid #C62828', borderRadius: '0 0 0 4px' }} />
              <div style={{ position: 'absolute', bottom: 8, right: 8, width: 20, height: 20, borderBottom: '3px solid #C62828', borderRight: '3px solid #C62828', borderRadius: '0 0 4px 0' }} />

              {/* Red ribbon header */}
              <div style={{
                background: 'linear-gradient(135deg, #C62828, #8E0000)',
                borderRadius: 8,
                padding: '16px 20px',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                  <Droplets style={{ width: 20, height: 20, color: '#fff', fill: '#fff' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 2 }}>SIPEDA</span>
                  <Droplets style={{ width: 20, height: 20, color: '#fff', fill: '#fff' }} />
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }}>PMI KABUPATEN INDRAMAYU</div>
              </div>

              {/* Title */}
              <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' }}>
                Sertifikat Donor Darah
              </div>
              <div style={{
                fontSize: 18,
                fontWeight: 800,
                color: '#C62828',
                letterSpacing: 3,
                marginBottom: 16,
              }}>
                TERIMA KASIH
              </div>

              {/* Decorative line */}
              <div style={{
                width: 80, height: 2,
                background: 'linear-gradient(90deg, transparent, #C62828, transparent)',
                margin: '0 auto 16px',
              }} />

              {/* Body text */}
              <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.7, marginBottom: 16 }}>
                Telah mendonorkan darah pada kegiatan donor darah yang diselenggarakan oleh
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                PMI Kabupaten Indramayu
              </div>

              {/* Details card */}
              <div style={{
                background: '#fef2f2',
                borderRadius: 10,
                padding: '14px 16px',
                margin: '14px 0',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', marginBottom: 2 }}>
                  {nama}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 11, color: '#6b7280' }}>
                  <span>Gol. Darah: <strong style={{ color: '#C62828' }}>{golongan_darah}</strong></span>
                  <span>Total Donor: <strong>{total_donor_berhasil}x</strong></span>
                </div>
              </div>

              {/* Date & location */}
              {jadwal && (
                <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.8 }}>
                  <div>{fmtDate(jadwal.tanggal)}</div>
                  <div>{jadwal.lokasi.nama_lokasi} · {jadwal.lokasi.kecamatan}</div>
                </div>
              )}

              {/* Footer */}
              <div style={{
                marginTop: 18,
                paddingTop: 12,
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 8,
                color: '#d1d5db',
              }}>
                <span>{nomorSertifikat}</span>
                <span>sipeda.vercel.app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-colors disabled:opacity-60 shadow-lg"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {downloading ? 'Menyimpan...' : 'Download Sertifikat'}
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <button onClick={() => setError('')} className="flex-shrink-0" aria-label="Tutup pesan error">
              <X className="w-4 h-4" />
            </button>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
