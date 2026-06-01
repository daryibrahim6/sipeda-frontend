-- Migration 14: Remove 'Tidak Tahu' from pencatatan_donor CHECK constraint
--
-- pencatatan_donor mencatat hasil skrining — golongan darah sudah harus
-- diketahui saat dicatat. 'Tidak Tahu' hanya valid untuk registrasi_donor
-- (saat pendaftaran, donor mungkin belum tahu goldarnya).
--
-- Migration ini:
-- 1. Hapus CHECK constraint lama
-- 2. Tambah CHECK constraint baru tanpa 'Tidak Tahu'

ALTER TABLE public.pencatatan_donor
  DROP CONSTRAINT IF EXISTS pencatatan_donor_golongan_darah_check;

ALTER TABLE public.pencatatan_donor
  ADD CONSTRAINT pencatatan_donor_golongan_darah_check
  CHECK (golongan_darah IN ('A+','A-','B+','B-','AB+','AB-','O+','O-'));
