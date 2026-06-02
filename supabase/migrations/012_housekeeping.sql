-- 012_housekeeping.sql — REVOKE public exec + tighten search_path is_admin*. Idempotent.
-- ⚠ APPLIED MANUAL 2026-06-03 — tidak auto-tracked.

-- ─── 1. REVOKE public access dari function yang masih bocor ─────────

REVOKE ALL ON FUNCTION public.log_stok_history() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_article_views(article_id integer) FROM PUBLIC;

-- ─── 2. Tighten search_path di is_admin helpers ────────────────────
-- Sebelumnya: SET search_path TO 'public'
-- Sekarang:    SET search_path = '' (zero-schema-search, strict)
-- Function body menggunakan 'FROM admins' (unqualified) — dengan search_path
-- kosong, query ini akan resolve via fully-qualified reference di body
-- (lihat di bawah).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;

-- ─── 3. Verifikasi (UNCOMMENT untuk cek, default di-comment) ────────
-- Setelah Run, query ini harus return 3 rows semua "true":
--
-- SELECT
--   (SELECT has_function_privilege(
--     (SELECT oid FROM pg_roles WHERE rolname='anon'),
--     (SELECT oid FROM pg_proc WHERE proname='log_stok_history' LIMIT 1),
--     'EXECUTE'
--   )) AS log_stok_revoked,
--   (SELECT has_function_privilege(
--     (SELECT oid FROM pg_roles WHERE rolname='anon'),
--     (SELECT oid FROM pg_proc WHERE proname='increment_article_views' LIMIT 1),
--     'EXECUTE'
--   )) AS inc_views_revoked,
--   (SELECT array_to_string(proconfig, ', ') = 'search_path=""'
--    FROM pg_proc
--    JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
--    WHERE proname='is_admin' AND nspname='public') AS is_admin_strict;
