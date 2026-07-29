REVOKE ALL ON public.roles FROM anon;
REVOKE ALL ON public.user_role_assignments FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_role_assignments TO authenticated;
GRANT ALL ON public.roles TO service_role;
GRANT ALL ON public.user_role_assignments TO service_role;