-- Migration 12: Auto-increase stok_darah saat pencatatan donor berhasil
--
-- Ketika petugas mencatat donor sebagai "berhasil", otomatis
-- menambah stok darah WB (Whole Blood) untuk golongan darah
-- dan lokasi yang sesuai.
--
-- Cara kerja:
--   1. Trigger AFTER INSERT ON pencatatan_donor
--   2. Cek jika status_donor = 'berhasil' DAN golongan_darah != 'Tidak Tahu'
--   3. Cari komponen_id untuk Whole Blood (kode = 'WB')
--   4. Cari lokasi_id dari jadwal_donor
--   5. Upsert ke stok_darah: jumlah + 1
--
-- Aman: Jika komponen WB tidak ditemukan (belum di-seed), skip.
-- Aman: Jika golongan_darah = 'Tidak Tahu', skip.


CREATE OR REPLACE FUNCTION public.increase_stok_on_donation()
RETURNS trigger AS $$
DECLARE
  v_lokasi_id int;
  v_komponen_id smallint;
BEGIN
  -- Hanya untuk donor yang berhasil dengan golongan darah diketahui
  IF NEW.status_donor != 'berhasil' OR NEW.golongan_darah = 'Tidak Tahu' THEN
    RETURN NEW;
  END IF;

  -- Cari lokasi dari jadwal
  SELECT lokasi_id INTO v_lokasi_id
  FROM public.jadwal_donor
  WHERE id = NEW.jadwal_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Cari komponen Whole Blood
  SELECT id INTO v_komponen_id
  FROM public.komponen_darah
  WHERE kode = 'WB'
  LIMIT 1;

  IF NOT FOUND THEN
    -- Komponen WB belum di-seed, skip
    RETURN NEW;
  END IF;

  -- Upsert: tambah 1 ke stok yang sudah ada, atau insert baru
  INSERT INTO public.stok_darah (lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, updated_by)
  VALUES (v_lokasi_id, v_komponen_id, NEW.golongan_darah, 1, 5, NEW.dicatat_oleh)
  ON CONFLICT (lokasi_id, komponen_id, golongan_darah)
  DO UPDATE SET
    jumlah = stok_darah.jumlah + 1,
    updated_by = NEW.dicatat_oleh,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Hapus trigger lama jika ada
DROP TRIGGER IF EXISTS trg_increase_stok_on_donation ON public.pencatatan_donor;

CREATE TRIGGER trg_increase_stok_on_donation
  AFTER INSERT
  ON public.pencatatan_donor
  FOR EACH ROW
  EXECUTE FUNCTION public.increase_stok_on_donation();
