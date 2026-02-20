'use client';

import { useState } from 'react';
import type { Schedule, RegistrationPayload, BloodType } from '@/lib/types';
import { registerDonor } from '@/lib/api';
import { formatDate, formatTime } from '@/lib/utils';
import { CheckCircle, Loader2 } from 'lucide-react';

const BLOOD_OPTIONS = ['Tidak Tahu','A+','A-','B+','B-','AB+','AB-','O+','O-'] as const;

type Props = { schedule: Schedule };

export function RegisterForm({ schedule }: Props) {
  const [form, setForm] = useState({
    nama: '',
    email: '',
    telepon: '',
    golongan_darah: 'Tidak Tahu' as BloodType | 'Tidak Tahu',
    jenis_kelamin: '' as 'L' | 'P' | '',
    tanggal_lahir: '',
    alamat: '',
    riwayat_donor: false,
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [kode, setKode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const payload: RegistrationPayload = {
        jadwal_id: schedule.id,
        nama: form.nama,
        telepon: form.telepon,
        golongan_darah: form.golongan_darah,
        riwayat_donor: form.riwayat_donor,
        ...(form.email         && { email: form.email }),
        ...(form.tanggal_lahir && { tanggal_lahir: form.tanggal_lahir }),
        ...(form.jenis_kelamin && { jenis_kelamin: form.jenis_kelamin }),
        ...(form.alamat        && { alamat: form.alamat }),
      };
      const result = await registerDonor(payload);
      setKode(result.kode_registrasi);
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-gray-500 mb-5">
          Tunjukkan kode ini kepada petugas pada hari kegiatan.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 mb-5">
          <div className="text-xs text-gray-400 mb-1">Kode Registrasi</div>
          <div className="text-3xl font-bold font-mono text-gray-900 tracking-widest">{kode}</div>
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

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

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
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={status === 'loading'}
        className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {status === 'loading' ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Mendaftarkan...</>
        ) : (
          'Daftar Donor Sekarang →'
        )}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Data hanya digunakan untuk keperluan donor darah PMI Indramayu.
      </p>
    </form>
  );
}