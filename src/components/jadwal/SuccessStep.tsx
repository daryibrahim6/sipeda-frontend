'use client';

import { CheckCircle, Loader2, MessageCircle, Copy, Check, Calendar, Clock, MapPin } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import type { Schedule } from '@/lib/types';
import { useState } from 'react';

type Props = {
  kode: string;
  telepon: string;
  schedule: Schedule;
  waStatus: 'idle' | 'sending' | 'sent' | 'failed';
};

export function SuccessStep({ kode, telepon, schedule, waStatus }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(kode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="text-center py-2 space-y-6">
      <div className="space-y-3 animate-scale-in">
        <div className="w-16 h-16 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Pendaftaran Berhasil!</h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Tunjukkan kode ini kepada petugas pada hari kegiatan.</p>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-1 bg-gradient-to-br from-[var(--color-section-alt)] to-white border border-[var(--color-border-muted)] rounded-[var(--radius-xl)] px-6 py-5">
        <div className="text-xs text-[var(--color-text-muted)] mb-1">Kode Registrasi</div>
        <div className="text-3xl font-bold font-mono text-[var(--color-text-primary)] tracking-widest">{kode}</div>
      </div>

      <div className="flex gap-2 animate-fade-in-up stagger-2">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] bg-[var(--color-section-alt)] text-[var(--color-text-secondary)] font-medium text-sm rounded-[var(--radius-md)] hover:bg-[var(--color-border-muted)] transition-all active:scale-[0.98]"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Tersalin!' : 'Salin Kode'}
        </button>
      </div>

      <div className={`animate-fade-in-up stagger-3 flex items-center justify-center gap-2 text-sm rounded-[var(--radius-lg)] px-4 py-3 ${
        waStatus === 'sent' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
        waStatus === 'failed' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' :
        waStatus === 'sending' ? 'bg-[var(--color-info)]/10 text-[var(--color-info)]' :
        'bg-[var(--color-section-alt)] text-[var(--color-text-muted)]'
      }`}>
        {waStatus === 'sending' && <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim notifikasi WA...</>}
        {waStatus === 'sent' && <><CheckCircle className="w-4 h-4" /> Notifikasi WA terkirim ke {telepon}</>}
        {waStatus === 'failed' && <><MessageCircle className="w-4 h-4" /> Notifikasi WA gagal dikirim (saldo habis atau jaringan error)</>}
        {waStatus === 'idle' && <>Notifikasi WA akan dikirim otomatis</>}
      </div>

      <div className="animate-fade-in-up stagger-4 text-xs text-[var(--color-text-secondary)] text-left bg-[var(--color-section-alt)]/50 rounded-[var(--radius-xl)] p-5 border border-[var(--color-border-muted)] space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-red-600 rounded-full" />
          <span className="font-medium text-[var(--color-text-primary)]">Detail kegiatan</span>
        </div>
        <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />{formatDate(schedule.tanggal)}</div>
        <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />{formatTime(schedule.waktu_mulai)} – {formatTime(schedule.waktu_selesai)} WIB</div>
        <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />{schedule.lokasi?.nama_lokasi}</div>
      </div>
    </div>
  );
}
