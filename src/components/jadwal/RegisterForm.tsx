'use client';

import { useState, useRef } from 'react';
import type { Schedule, RegistrationPayload, BloodType } from '@/lib/types';
import { registerDonor } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { Loader2, XCircle } from 'lucide-react';
import { PreScreening, type PreScreeningData } from './PreScreening';
import { FormStep } from './FormStep';
import { ConfirmStep } from './ConfirmStep';
import { SuccessStep } from './SuccessStep';

type Props = { schedule: Schedule; onRegistrationSuccess?: () => void };
type Step = 'form' | 'screening' | 'confirm' | 'loading' | 'success';

export function RegisterForm({ schedule, onRegistrationSuccess }: Props) {
  const [form, setForm] = useState({
    nama: '',
    nik: '',
    email: '',
    telepon: '',
    golongan_darah: 'Tidak Tahu' as BloodType | 'Tidak Tahu',
    jenis_kelamin: '' as 'L' | 'P' | '',
    tanggal_lahir: '',
    alamat: '',
    riwayat_donor: false,
    _website: '',
  });
  const [step, setStep] = useState<Step>('form');
  const [screeningData, setScreeningData] = useState<PreScreeningData | null>(null);
  const [kode, setKode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [waStatus, setWaStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  const lastSubmitRef = useRef<number>(0);

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const nikError = form.nik && !/^\d{16}$/.test(form.nik)
    ? 'NIK harus 16 digit angka sesuai KTP'
    : '';

  function handleFormNext(e: React.FormEvent) {
    e.preventDefault();
    if (form._website) return;
    const now = Date.now();
    if (now - lastSubmitRef.current < 30_000) {
      setErrorMsg('Mohon tunggu 30 detik sebelum mendaftar lagi.');
      return;
    }
    if (form.nik && !/^\d{16}$/.test(form.nik)) {
      setErrorMsg('NIK harus 16 digit angka sesuai KTP.');
      return;
    }
    if (!form.tanggal_lahir) {
      setErrorMsg('Tanggal lahir wajib diisi untuk verifikasi usia.');
      return;
    }
    setErrorMsg('');
    setStep('screening');
  }

  async function handleScreeningPass(data: PreScreeningData) {
    setScreeningData(data);
    setStep('confirm');
  }

  async function handleConfirm() {
    if (!screeningData) return;
    setStep('loading');
    setErrorMsg('');
    try {
      const payload: RegistrationPayload = {
        jadwal_id: schedule.id,
        nama: form.nama,
        telepon: form.telepon,
        golongan_darah: form.golongan_darah,
        riwayat_donor: form.riwayat_donor,
        ...(form.nik && { nik: form.nik }),
        ...(form.email && { email: form.email }),
        tanggal_lahir: form.tanggal_lahir,
        ...(form.jenis_kelamin && { jenis_kelamin: form.jenis_kelamin }),
        ...(form.alamat && { alamat: form.alamat }),
      };
      const result = await registerDonor(payload);
      setKode(result.kode_registrasi);
      setStep('success');
      lastSubmitRef.current = Date.now();
      onRegistrationSuccess?.();

      setWaStatus('sending');
      const message =
        `✅ *Pendaftaran Donor Darah Berhasil!*\n\n` +
        `Kode Registrasi: *${result.kode_registrasi}*\n\n` +
        `📅 ${formatDate(schedule.tanggal)}\n` +
        `🕐 ${formatTime(schedule.waktu_mulai)} – ${formatTime(schedule.waktu_selesai)} WIB\n` +
        `📍 ${schedule.lokasi?.nama_lokasi ?? '-'}\n\n` +
        `Tunjukkan kode ini ke petugas saat datang.\n` +
        `SIPEDA — PMI Kabupaten Indramayu`;
      try {
        const waRes = await fetch('/api/send-wa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: form.telepon, message }),
        });
        if (waRes.ok) setWaStatus('sent');
        else setWaStatus('failed');
      } catch {
        setWaStatus('failed');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      setStep('confirm');
    }
  }

  if (step === 'success') {
    return <SuccessStep kode={kode} telepon={form.telepon} schedule={schedule} waStatus={waStatus} />;
  }

  if (step === 'confirm') {
    return (
      <ConfirmStep
        form={form}
        schedule={schedule}
        errorMsg={errorMsg}
        onBack={() => setStep('screening')}
        onConfirm={handleConfirm}
      />
    );
  }

  if (step === 'loading') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[var(--color-primary-subtle)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
        </div>
        <p className="text-sm font-medium text-[var(--color-text-primary)] mb-4">Mendaftarkan Anda...</p>
        <div className="max-w-[200px] mx-auto h-1.5 bg-[var(--color-section-alt)] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mt-3">Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (step === 'screening') {
    return (
      <div>
        <PreScreening
          tanggalLahir={form.tanggal_lahir}
          jenisKelamin={form.jenis_kelamin}
          onPass={handleScreeningPass}
          onBack={() => setStep('form')}
        />
        {errorMsg && (
          <div className="mt-4 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 text-[var(--color-error)] text-sm rounded-[var(--radius-lg)] px-5 py-3.5 flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <FormStep
      form={form}
      set={set}
      nikError={nikError}
      errorMsg={errorMsg}
      onSubmit={handleFormNext}
    />
  );
}
