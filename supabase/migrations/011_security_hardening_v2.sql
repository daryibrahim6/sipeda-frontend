-- 011_security_hardening_v2.sql — 3 TINGGI: trigger registrasi, RLS stok aktif, second-factor batalkan. Idempotent.
-- ⚠ APPLIED MANUAL 2026-06-03 — tidak auto-tracked.

-- ─── 1. registrasi_donor: trigger paksa status=pending untuk non-admin ────────

CREATE OR REPLACE FUNCTION public.guard_registrasi_donor_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_is_admin boolean;
BEGIN
  -- Cek apakah caller adalah admin/petugas (bukan anon)
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_user_id = auth.uid() AND aktif = true
  ) INTO v_is_admin;

  -- Anon / public: ignore client-provided status, force 'pending'
  -- Admin/petugas (e.g. bulk import): hormati nilai dari client
  IF NOT v_is_admin THEN
    NEW.status := 'pending'::reg_status;
  END IF;

  -- Also: jika user mencoba set status_kehadiran on insert, reset ke NULL
  -- (kehadiran hanya bisa di-set oleh admin saat pencatatan, bukan saat registrasi)
  IF NOT v_is_admin THEN
    NEW.status_kehadiran := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_registrasi_insert ON public.registrasi_donor;
CREATE TRIGGER trg_guard_registrasi_insert
BEFORE INSERT ON public.registrasi_donor
FOR EACH ROW
EXECUTE FUNCTION public.guard_registrasi_donor_insert();

-- ─── 2. stok_darah: RLS public read hanya untuk lokasi aktif ─────────────────

DROP POLICY IF EXISTS "Public read stok" ON stok_darah;
CREATE POLICY "Public read stok"
  ON stok_darah FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.lokasi_donor l
      WHERE l.id = stok_darah.lokasi_id AND l.aktif = true
    )
  );

-- ─── 3. batalkan_registrasi_by_kode: tambah second factor telepon ────────────

-- Drop dulu signature lama agar bisa di-replace dengan signature baru
DROP FUNCTION IF EXISTS public.batalkan_registrasi_by_kode(text);

CREATE OR REPLACE FUNCTION public.batalkan_registrasi_by_kode(
  p_kode text,
  p_telepon text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_status text;
  v_jadwal_tanggal date;
  v_telepon_db text;
  result jsonb;
BEGIN
  -- Validasi input
  IF p_kode IS NULL OR length(trim(p_kode)) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak valid.');
  END IF;

  IF p_telepon IS NULL OR length(trim(p_telepon)) < 8 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nomor telepon wajib diisi untuk konfirmasi.');
  END IF;

  -- Lookup registrasi by kode
  SELECT r.status, r.telepon, j.tanggal
    INTO v_status, v_telepon_db, v_jadwal_tanggal
  FROM public.registrasi_donor r
  JOIN public.jadwal_donor j ON j.id = r.jadwal_id
  WHERE r.kode_registrasi = upper(trim(p_kode));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Kode registrasi tidak ditemukan.');
  END IF;

  -- Second factor: telepon harus cocok (normalisasi digit)
  IF regexp_replace(v_telepon_db, '\D', '', 'g') != regexp_replace(trim(p_telepon), '\D', '', 'g') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Nomor telepon tidak cocok dengan data registrasi.');
  END IF;

  IF v_jadwal_tanggal < CURRENT_DATE THEN
    RETURN jsonb_build_object('success', false, 'error', 'Tidak bisa membatalkan registrasi yang sudah lewat.');
  END IF;

  IF v_status NOT IN ('pending', 'confirmed') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Registrasi dengan status "' || v_status || '" tidak bisa dibatalkan.'
    );
  END IF;

  UPDATE public.registrasi_donor
  SET status = 'dibatalkan'::reg_status, updated_at = now()
  WHERE kode_registrasi = upper(trim(p_kode))
    AND status IN ('pending', 'confirmed');

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Gagal membatalkan registrasi. Coba lagi.');
  END IF;

  RETURN jsonb_build_object('success', true, 'error', null);
END;
$$;
