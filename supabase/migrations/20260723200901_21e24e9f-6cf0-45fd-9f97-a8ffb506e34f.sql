CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON public.profiles (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_lower ON public.profiles (lower(full_name));
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles (phone);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_user ON public.user_roles (role, user_id);