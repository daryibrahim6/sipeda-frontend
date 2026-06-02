'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { batalkanRegistrasi } from '@/lib/api';
import { AlertTriangle, Loader2, Phone } from 'lucide-react';

type Props = {
    kode: string;
    status: string;
    /** Optional masked hint, e.g. "0812****78". Not sent to client by default. */
    telepon?: string;
};

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusable(container: HTMLElement) {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

export default function CancelRegistrasiButton({ kode, status, telepon }: Props) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [confirmTelepon, setConfirmTelepon] = useState('');
    const dialogRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    const trapCb = useCallback((e: KeyboardEvent) => {
        if (!dialogRef.current) return;
        if (e.key === 'Escape') { setOpen(false); return; }
        if (e.key !== 'Tab') return;
        const elements = getFocusable(dialogRef.current);
        if (elements.length === 0) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }, []);

    useEffect(() => {
        if (!open) return;
        previousFocusRef.current = document.activeElement as HTMLElement;
        document.addEventListener('keydown', trapCb);
        requestAnimationFrame(() => {
            if (dialogRef.current) {
                const elements = getFocusable(dialogRef.current);
                if (elements.length > 0) elements[0].focus();
            }
        });
        return () => {
            document.removeEventListener('keydown', trapCb);
            previousFocusRef.current?.focus();
        };
    }, [open, trapCb]);

    const canCancel = status === 'pending' || status === 'confirmed';
    if (!canCancel) return null;

    function handleOpen() {
        setConfirmTelepon('');
        setError('');
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setConfirmTelepon('');
        setError('');
    }

    async function handleCancel() {
        setLoading(true);
        setError('');
        const result = await batalkanRegistrasi(kode, confirmTelepon);
        setLoading(false);
        if (result.success) {
            handleClose();
            router.refresh();
        } else {
            setError(result.error || 'Gagal membatalkan registrasi.');
        }
    }

    const teleponValid = confirmTelepon.replace(/\D/g, '').length >= 8;

    return (
        <>
            <div className="mt-6 text-center">
                <button
                    onClick={handleOpen}
                    className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Batalkan Pendaftaran
                </button>
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="cancel-dialog-title"
                    ref={dialogRef}
                >
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
                        <h3 id="cancel-dialog-title" className="text-lg font-bold text-gray-900 mb-2">Batalkan Pendaftaran?</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Pendaftaran dengan kode <strong className="text-gray-900">{kode}</strong> akan dibatalkan.
                            Kamu bisa mendaftar lagi di lain waktu. Tindakan ini tidak dapat dibatalkan.
                        </p>
                        <div className="mb-4">
                            <label htmlFor="confirm-telepon" className="block text-sm font-medium text-gray-700 mb-1.5">
                                <Phone className="w-3.5 h-3.5 inline mr-1" />
                                Konfirmasi Nomor Telepon
                            </label>
                            <input
                                id="confirm-telepon"
                                type="tel"
                                inputMode="numeric"
                                value={confirmTelepon}
                                onChange={e => setConfirmTelepon(e.target.value)}
                                placeholder={telepon}
                                autoComplete="off"
                                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-400 mt-1.5">
                                Masukkan nomor telepon yang kamu gunakan saat mendaftar.
                            </p>
                        </div>
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                                {error}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Tutup
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={loading || !teleponValid}
                                className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
