'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { batalkanRegistrasi } from '@/lib/api';
import { AlertTriangle, Loader2 } from 'lucide-react';

type Props = {
  kode: string;
  status: string;
};

export default function CancelRegistrasiButton({ kode, status }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canCancel = status === 'pending' || status === 'confirmed';
  if (!canCancel) return null;

  async function handleCancel() {
    setLoading(true);
    setError('');
    const result = await batalkanRegistrasi(kode);
    setLoading(false);
    if (result.success) {
      setOpen(false);
      router.refresh();
    } else {
      setError(result.error || 'Gagal membatalkan registrasi.');
    }
  }

  return (
    <>
      <div className="mt-6 text-center">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Batalkan Pendaftaran
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Batalkan Pendaftaran?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Pendaftaran dengan kode <strong className="text-gray-900">{kode}</strong> akan dibatalkan.
              Kamu bisa mendaftar lagi di lain waktu. Tindakan ini tidak dapat dibatalkan.
            </p>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
