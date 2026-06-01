-- ============================================================
-- SIPEDA — Security & Performance Fixes (007)
-- Perbaikan keamanan yang tidak mengubah skema.
-- ============================================================

-- ── Revoke public access on admin functions ────────────────────

REVOKE ALL ON FUNCTION public.expire_expired_jadwal() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.log_stok_history() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.increment_article_views(article_id integer) FROM PUBLIC;
