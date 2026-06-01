'use client';

import { ChevronRight, XCircle } from 'lucide-react';
import type { Schedule } from '@/lib/types';

type FormData = {
  nama: string;
  nik: string;
  telepon: string;
  golongan_darah: string;
  jenis_kelamin: 'L' | 'P' | '';
  tanggal_lahir: string;
  alamat: string;
  riwayat_donor: boolean;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[var(--color-text-secondary)]">{label}</span>
      <span className="font-medium text-[var(--color-text-primary)] text-right max-w-[60%] truncate">{value}</span>
    </div>
  );
}

type Props = {
  form: FormData;
  schedule: Schedule;
  errorMsg: string;
  onBack: () => void;
  onConfirm: () => void;
};

export function ConfirmStep({ form, errorMsg, onBack, onConfirm }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 bg-red-600 rounded-full" />
        <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Konfirmasi Pendaftaran</h3>
      </div>
      <div className="bg-[var(--color-section-alt)]/50 rounded-[var(--radius-xl)] p-5 space-y-3 mb-5 text-sm border border-[var(--color-border-muted)]">
        <DetailRow label="Nama" value={form.nama} />
        {form.nik && <DetailRow label="NIK" value={form.nik} />}
        <DetailRow label="No. WhatsApp" value={form.telepon} />
        <DetailRow label="Golongan Darah" value={form.golongan_darah} />
        <DetailRow label="Jenis Kelamin" value={form.jenis_kelamin === 'L' ? 'Laki-laki' : form.jenis_kelamin === 'P' ? 'Perempuan' : '-'} />
        <DetailRow label="Tanggal Lahir" value={form.tanggal_lahir} />
        <DetailRow label="Pernah Donor" value={form.riwayat_donor ? 'Ya' : 'Tidak'} />
        {form.alamat && <DetailRow label="Alamat" value={form.alamat} />}
      </div>
      <div className="bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/20 rounded-[var(--radius-lg)] p-4 mb-5">
        <p className="text-xs text-[var(--color-warning)]">
          Dengan menekan &quot;Konfirmasi &amp; Daftar&quot;, Anda menyatakan data yang diisi benar
          dan bersedia mengikuti prosedur donor darah PMI.
        </p>
      </div>
      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 py-3 border border-[var(--color-border)] rounded-[var(--radius-lg)] text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-section-alt)] hover:border-[var(--color-border)] transition-all active:scale-[0.98]">
          Kembali
        </button>
        <button onClick={onConfirm}
          className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-[var(--radius-lg)] text-sm font-semibold text-white hover:from-red-700 hover:to-red-800 transition-all shadow-lg shadow-black/15 active:scale-[0.98] flex items-center justify-center gap-2">
          Konfirmasi & Daftar
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      {errorMsg && (
        <div className="mt-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm rounded-[var(--radius-lg)] px-5 py-3.5 flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
