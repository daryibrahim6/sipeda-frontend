'use client';

import { useState, useRef } from 'react';
import type { Schedule, RegistrationPayload, BloodType } from '@/lib/types';
import { registerDonor } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { CheckCircle, Loader2, MessageCircle, Copy, Check, ChevronRight } from 'lucide-react';
import { PreScreening, type PreScreeningData } from './PreScreening';

const BLOOD_OPTIONS = ['Tidak Tahu', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

type Props = { schedule: Schedule; onRegistrationSuccess?: () => void };
type Step = 'form' | 'screening' | 'loading' | 'success';

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
    // A4: Honeypot field — hidden from humans, filled by bots
    _website: '',
  });
  const [step, setStep] = useState<Step>('form');
  const [screeningData, setScreeningData] = useState<PreScreeningData | null>(null);
  const [kode, setKode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // A4: Cooldown — prevent rapid re-submission
  const lastSubmitRef = useRef<number>(0);

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // B1: NIK validation (16 digits)
  const nikError = form.nik && !/^\d{16}$/.test(form.nik)
    ? 'NIK harus 16 digit angka sesuai KTP'
    : '';

  // Step 1: Form → go to pre-screening
  function handleFormNext(e: React.FormEvent) {
    e.preventDefault();

    // A4: Honeypot check
    if (form._website) return;

    // A4: Cooldown
    const now = Date.now();
    if (now - lastSubmitRef.current < 30_000) {
      setErrorMsg('Mohon tunggu 30 detik sebelum mendaftar lagi.');
      return;
    }

    // B1: NIK format validation
    if (form.nik && !/^\d{16}$/.test(form.nik)) {
      setErrorMsg('NIK harus 16 digit angka sesuai KTP.');
      return;
    }

    setErrorMsg('');
    setStep('screening');
  }

  // Step 2: Pre-screening passed → submit registration
  async function handleScreeningPass(data: PreScreeningData) {
    setScreeningData(data);
    setStep('loading');
    setErrorMsg('');
    try {
      const payload: RegistrationPayload & { pre_screening?: PreScreeningData } = {
        jadwal_id: schedule.id,
        nama: form.nama,
        telepon: form.telepon,
        golongan_darah: form.golongan_darah,
        riwayat_donor: form.riwayat_donor,
        pre_screening: data,
        ...(form.nik && { nik: form.nik }),
        ...(form.email && { email: form.email }),
        ...(form.tanggal_lahir && { tanggal_lahir: form.tanggal_lahir }),
        ...(form.jenis_kelamin && { jenis_kelamin: form.jenis_kelamin }),
        ...(form.alamat && { alamat: form.alamat }),
      };
      const result = await registerDonor(payload);
      setKode(result.kode_registrasi);
      setStep('success');
      lastSubmitRef.current = Date.now();
      onRegistrationSuccess?.();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      setStep('screening');
    }
  }

  // A5: WhatsApp share message
  function getWhatsAppUrl() {
    const text =
      `✅ Pendaftaran Donor Darah Berhasil!\n\n` +
      `Kode Registrasi: *${kode}*\n\n` +
      `📅 ${formatDate(schedule.tanggal)}\n` +
      `🕐 ${formatTime(schedule.waktu_mulai)} – ${formatTime(schedule.waktu_selesai)} WIB\n` +
      `📍 ${schedule.lokasi?.nama_lokasi}\n\n` +
      `Tunjukkan kode ini ke petugas saat datang.\n` +
      `SIPEDA — PMI Kabupaten Indramayu`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function handleCopy() {
    navigator.clipboard.writeText(kode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ─── Success state ─────────────────────────────────────────────────────────

  if (step === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-gray-500 mb-5">
          Tunjukkan kode ini kepada petugas pada hari kegiatan.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 mb-4">
          <div className="text-xs text-gray-400 mb-1">Kode Registrasi</div>
          <div className="text-3xl font-bold font-mono text-gray-900 tracking-widest">{kode}</div>
        </div>

        {/* A5: Action buttons — Copy + WhatsApp share */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium text-sm rounded-xl hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin!' : 'Salin Kode'}
          </button>
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium text-sm rounded-xl hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Simpan ke WhatsApp
          </a>
        </div>

        <div className="text-xs text-gray-500 space-y-1 text-left bg-gray-50 rounded-xl p-4">
          <div className="font-medium text-gray-700 mb-2">Detail kegiatan:</div>
          <div>📅 {formatDate(schedule.tanggal)}</div>
          <div>🕐 {formatTime(schedule.waktu_mulai)} – {formatTime(schedule.waktu_selesai)} WIB</div>
          <div>📍 {schedule.lokasi?.nama_lokasi}</div>
        </div>
      </div>
    );
  }

  // ─── Loading state ─────────────────────────────────────────────────────────

  if (step === 'loading') {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Mendaftarkan Anda...</p>
      </div>
    );
  }

  // ─── Pre-screening step ────────────────────────────────────────────────────

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
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  // ─── Form step ─────────────────────────────────────────────────────────────

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleFormNext} className="space-y-4">

      {/* A4: Honeypot — invisible to humans, bots will fill this */}
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

      {/* Nama */}
      <div>
        <label className={labelClass}>
          Nama Lengkap <span className="text-red-500">*</span>
        </label>
        <input type="text" required value={form.nama}
          onChange={e => set('nama', e.target.value)}
          placeholder="Nama sesuai KTP"
          className={inputClass} />
      </div>

      {/* B1: NIK */}
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
          className={inputClass}
        />
        {nikError && (
          <p className="text-xs text-red-500 mt-1">{nikError}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Digunakan untuk verifikasi saat datang donor. Data aman dan tidak dibagikan.
        </p>
      </div>

      {/* Email + Telepon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="opsional"
            className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>
            No. WhatsApp <span className="text-red-500">*</span>
          </label>
          <input type="tel" required value={form.telepon}
            onChange={e => set('telepon', e.target.value)}
            placeholder="08xxxxxxxxxx"
            className={inputClass} />
        </div>
      </div>

      {/* Golongan + Kelamin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Golongan Darah</label>
          <select value={form.golongan_darah}
            onChange={e => set('golongan_darah', e.target.value as BloodType | 'Tidak Tahu')}
            className={inputClass + ' bg-white'}>
            {BLOOD_OPTIONS.map(bt => <option key={bt} value={bt}>{bt}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jenis Kelamin</label>
          <select value={form.jenis_kelamin}
            onChange={e => set('jenis_kelamin', e.target.value as 'L' | 'P' | '')}
            className={inputClass + ' bg-white'}>
            <option value="">Pilih</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
      </div>

      {/* Tanggal lahir */}
      <div>
        <label className={labelClass}>Tanggal Lahir</label>
        <input type="date" value={form.tanggal_lahir}
          onChange={e => set('tanggal_lahir', e.target.value)}
          className={inputClass} />
      </div>

      {/* Riwayat donor */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox"
          checked={form.riwayat_donor}
          onChange={e => set('riwayat_donor', e.target.checked)}
          className="w-4 h-4 accent-red-600 rounded" />
        <span className="text-sm text-gray-700">Saya pernah donor darah sebelumnya</span>
      </label>

      {/* Error */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {errorMsg}
        </div>
      )}

      {/* Next → Pre-Screening */}
      <button type="submit" disabled={!!nikError}
        className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        Lanjut ke Pre-Screening
        <ChevronRight className="w-4 h-4" />
      </button>

      <p className="text-xs text-gray-400 text-center">
        Data hanya digunakan untuk keperluan donor darah PMI Indramayu.
      </p>
    </form>
  );
}