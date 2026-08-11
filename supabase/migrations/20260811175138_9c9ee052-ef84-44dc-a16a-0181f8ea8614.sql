GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT SELECT ON public.user_roles TO authenticated, service_role;
GRANT SELECT ON public.page_blocks TO anon, authenticated, service_role;
GRANT SELECT ON public.site_pages TO anon, authenticated, service_role;
GRANT SELECT ON public.blog_posts TO anon, authenticated, service_role;