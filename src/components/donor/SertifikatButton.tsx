'use client';

import { useState } from 'react';
import { Award } from 'lucide-react';
import SertifikatDonor from './SertifikatDonor';

type Props = {
  nama: string;
  golongan_darah: string;
  total_donor_berhasil: number;
  kode_registrasi: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi_nama: string;
  lokasi_kecamatan: string;
};

export default function SertifikatButton({
  nama, golongan_darah, total_donor_berhasil,
  kode_registrasi, tanggal, waktu_mulai, waktu_selesai,
  lokasi_nama, lokasi_kecamatan,
}: Props) {
  const [open, setOpen] = useState(false);

  const item = {
    id: 0,
    kode_registrasi,
    nama,
    telepon: '',
    golongan_darah,
    status: 'hadir',
    status_kehadiran: 'hadir' as const,
    created_at: '',
    jadwal: {
      id: 0,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      status: 'selesai',
      lokasi: { nama_lokasi: lokasi_nama, kecamatan: lokasi_kecamatan },
    },
  };

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
        <Award className="w-4 h-4" />
        Lihat Sertifikat
      </button>
      {open && (
        <SertifikatDonor
          nama={nama}
          golongan_darah={golongan_darah}
          total_donor_berhasil={total_donor_berhasil}
          item={item}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
