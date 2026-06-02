-- VERIFICATION.sql — Audit queries: housekeeping + search_path + FORCE RLS. SELECT only.

-- 1. Housekeeping items (3 harusnya "true")
SELECT
  (SELECT has_function_privilege(
    (SELECT oid FROM pg_roles WHERE rolname='anon'),
    (SELECT oid FROM pg_proc WHERE proname='log_stok_history' LIMIT 1),
    'EXECUTE'
  )) AS log_stok_revoked,
  (SELECT has_function_privilege(
    (SELECT oid FROM pg_roles WHERE rolname='anon'),
    (SELECT oid FROM pg_proc WHERE proname='increment_article_views' LIMIT 1),
    'EXECUTE'
  )) AS inc_views_revoked,
  (SELECT array_to_string(proconfig, ', ') = 'search_path=""'
   FROM pg_proc
   JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
   WHERE proname='is_admin' AND nspname='public') AS is_admin_strict;

-- 2. Search path semua SECURITY DEFINER functions (semua harus 'search_path=""')
SELECT
  p.proname,
  array_to_string(p.proconfig, ', ') AS search_path
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
ORDER BY p.proname;

-- 3. FORCE RLS check (semua 16 tabel harus force_rls=true)
SELECT
  c.relname AS table_name,
  c.relrowsecurity AS rls_enabled,
  c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;
