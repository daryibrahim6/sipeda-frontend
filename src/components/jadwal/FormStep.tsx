'use client';

import { XCircle, ChevronRight } from 'lucide-react';
import type { BloodType } from '@/lib/types';

const BLOOD_OPTIONS = ['Tidak Tahu', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

type FormData = {
  nama: string;
  nik: string;
  email: string;
  telepon: string;
  golongan_darah: BloodType | 'Tidak Tahu';
  jenis_kelamin: 'L' | 'P' | '';
  tanggal_lahir: string;
  alamat: string;
  riwayat_donor: boolean;
  _website: string;
};

type Props = {
  form: FormData;
  set: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  nikError: string;
  errorMsg: string;
  onSubmit: (e: React.FormEvent) => void;
};

export function FormStep({ form, set, nikError, errorMsg, onSubmit }: Props) {
  const inputBase = "w-full rounded-2xl px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] bg-white border border-[var(--color-border-muted)] focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-[var(--color-primary)] transition-all";
  const labelClass = "block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5";

  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="text"
          value={form._website}
          onChange={e => set('_website', e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {/* Section: Data Diri */}
      <div className="bg-[var(--color-section-alt)]/50 rounded-3xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Data Diri</span>
        </div>

        <div>
          <label className={labelClass}>
            Nama Lengkap <span className="text-[var(--color-primary)]">*</span>
          </label>
          <input type="text" required value={form.nama}
            onChange={e => set('nama', e.target.value)}
            placeholder="Nama sesuai KTP"
            className={inputBase} />
        </div>

        <div>
          <label className={labelClass}>
            NIK (Nomor Induk Kependudukan)
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={16}
            value={form.nik}
            onChange={e => set('nik', e.target.value.replace(/\D/g, '').slice(0, 16))}
            placeholder="16 digit sesuai KTP"
            className={inputBase}
          />
          {nikError && (
            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">• {nikError}</p>
          )}
          <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
            Digunakan untuk verifikasi saat datang donor. Data aman dan tidak dibagikan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="opsional"
              className={inputBase} />
          </div>
          <div>
            <label className={labelClass}>
              No. WhatsApp             <span className="text-[var(--color-primary)]">*</span>
            </label>
            <input type="tel" required value={form.telepon}
              onChange={e => set('telepon', e.target.value)}
              placeholder="08xxxxxxxxxx"
              className={inputBase} />
          </div>
        </div>
      </div>

      {/* Section: Informasi Donor */}
      <div className="bg-[var(--color-section-alt)]/50 rounded-3xl p-5 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[var(--color-primary)] rounded-full" />
          <span className="text-sm font-semibold text-[var(--color-text-primary)]">Informasi Donor</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Golongan Darah</label>
            <select value={form.golongan_darah}
              onChange={e => set('golongan_darah', e.target.value as BloodType | 'Tidak Tahu')}
              className={inputBase}>
              {BLOOD_OPTIONS.map(bt => <option key={bt} value={bt}>{bt}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Jenis Kelamin</label>
            <select value={form.jenis_kelamin}
              onChange={e => set('jenis_kelamin', e.target.value as 'L' | 'P' | '')}
              className={inputBase}>
              <option value="">Pilih</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tanggal Lahir</label>
          <input type="date" value={form.tanggal_lahir}
            onChange={e => set('tanggal_lahir', e.target.value)}
            className={inputBase} />
        </div>

        <label className="flex items-center gap-3 px-4 py-3.5 bg-white border border-[var(--color-border)] rounded-[var(--radius-lg)] cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all group">
          <div className="relative flex items-center justify-center w-5 h-5">
            <input type="checkbox"
              checked={form.riwayat_donor}
              onChange={e => set('riwayat_donor', e.target.checked)}
              className="peer appearance-none w-5 h-5 border-2 border-[var(--color-border)] rounded-md checked:border-[var(--color-primary)] checked:bg-[var(--color-primary)] transition-all cursor-pointer" />
            {form.riwayat_donor && (
              <svg className="absolute w-3 h-3 text-white pointer-events-none" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            )}
          </div>
          <span className="text-sm text-[var(--color-text-secondary)] select-none group-hover:text-[var(--color-text-primary)] transition-colors">
            Saya pernah donor darah sebelumnya
          </span>
        </label>
      </div>

      {errorMsg && (
        <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm rounded-[var(--radius-lg)] px-5 py-3.5 flex items-center gap-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <button type="submit" disabled={!!nikError}
        className="group w-full py-3.5 min-h-[44px] bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-accent)] text-white font-semibold rounded-[var(--radius-lg)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-[var(--color-primary)] disabled:hover:to-[var(--color-primary-accent)] flex items-center justify-center gap-2 shadow-[var(--shadow-btn-primary)] active:scale-[0.98]">
        Lanjut ke Pre-Screening
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>

      <p className="text-xs text-[var(--color-text-muted)] text-center">
        Data hanya digunakan untuk keperluan donor darah PMI Indramayu.
      </p>
    </form>
  );
}
