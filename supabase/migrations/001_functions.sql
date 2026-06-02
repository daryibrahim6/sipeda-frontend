-- 001_functions.sql — Fungsi DB untuk trigger & aplikasi.

-- ── Auto-update status stok ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_stok_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status := CASE
    WHEN NEW.jumlah = 0            THEN 'kosong'::stok_status
    WHEN NEW.jumlah <= NEW.batas_kritis THEN 'kritis'::stok_status
    ELSE                                'normal'::stok_status
  END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── Generate kode registrasi ──────────────────────────────────

CREATE SEQUENCE IF NOT EXISTS registrasi_kode_seq
  START WITH 1 INCREMENT BY 1 NO MAXVALUE CACHE 1;

CREATE OR REPLACE FUNCTION public.generate_kode_registrasi()
RETURNS text
LANGUAGE plpgsql SET search_path = public
AS $$
DECLARE
  seq_val bigint;
BEGIN
  seq_val := nextval('registrasi_kode_seq');
  RETURN 'REG-' || EXTRACT(YEAR FROM NOW())::text || '-' || LPAD(seq_val::text, 6, '0');
END;
$$;

ALTER TABLE public.registrasi_donor
  ALTER COLUMN kode_registrasi SET DEFAULT generate_kode_registrasi();

-- ── Check jadwal expired ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_jadwal_expired()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tanggal < CURRENT_DATE AND NEW.status NOT IN ('selesai', 'dibatalkan') THEN
    NEW.status := 'selesai';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE OR REPLACE FUNCTION public.expire_expired_jadwal()
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int;
BEGIN
  UPDATE public.jadwal_donor
  SET status = 'selesai'
  WHERE tanggal < CURRENT_DATE
    AND status NOT IN ('selesai', 'dibatalkan');
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

-- ── Update sisa kuota (full recount, idempotent) ─────────────

CREATE OR REPLACE FUNCTION public.update_sisa_kuota()
RETURNS TRIGGER AS $$
DECLARE
  v_jadwal_id bigint;
  v_total_registered int;
  v_total_kuota int;
  v_sisa int;
BEGIN
  IF TG_OP = 'DELETE' THEN v_jadwal_id := OLD.jadwal_id;
  ELSE v_jadwal_id := NEW.jadwal_id;
  END IF;

  SELECT COUNT(*) INTO v_total_registered
  FROM public.registrasi_donor
  WHERE jadwal_id = v_jadwal_id
    AND (status IS NULL OR status != 'dibatalkan');

  SELECT kuota INTO v_total_kuota
  FROM public.jadwal_donor WHERE id = v_jadwal_id;

  v_sisa := GREATEST(v_total_kuota - v_total_registered, 0);

  UPDATE public.jadwal_donor
  SET
    sisa_kuota = v_sisa,
    status = CASE
      WHEN v_sisa = 0 AND status = 'aktif' THEN 'penuh'::jadwal_status
      WHEN v_sisa > 0 AND status = 'penuh' THEN 'aktif'::jadwal_status
      ELSE status
    END
  WHERE id = v_jadwal_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── Auto increase stok saat donor berhasil ───────────────────

CREATE OR REPLACE FUNCTION public.increase_stok_on_donation()
RETURNS TRIGGER AS $$
DECLARE
  v_lokasi_id int;
  v_komponen_id smallint;
BEGIN
  IF NEW.status_donor != 'berhasil' OR NEW.golongan_darah = 'Tidak Tahu' THEN
    RETURN NEW;
  END IF;

  SELECT lokasi_id INTO v_lokasi_id
  FROM public.jadwal_donor WHERE id = NEW.jadwal_id;
  IF NOT FOUND THEN RETURN NEW; END IF;

  SELECT id INTO v_komponen_id
  FROM public.komponen_darah WHERE kode = 'WB' LIMIT 1;
  IF NOT FOUND THEN RETURN NEW; END IF;

  INSERT INTO public.stok_darah (lokasi_id, komponen_id, golongan_darah, jumlah, batas_kritis, updated_by)
  VALUES (v_lokasi_id, v_komponen_id, NEW.golongan_darah::golongan_darah, 1, 5, NEW.dicatat_oleh)
  ON CONFLICT (lokasi_id, komponen_id, golongan_darah)
  DO UPDATE SET
    jumlah = stok_darah.jumlah + 1,
    updated_by = NEW.dicatat_oleh,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── Helper functions untuk RLS ────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admins WHERE auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.get_admin_role()
RETURNS admin_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM admins WHERE auth_user_id = auth.uid() LIMIT 1;
$$;

-- ── Update updated_at timestamp ───────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
