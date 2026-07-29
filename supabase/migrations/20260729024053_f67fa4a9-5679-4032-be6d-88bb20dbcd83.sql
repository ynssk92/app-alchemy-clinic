REVOKE SELECT (updated_by) ON public.app_settings FROM anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;