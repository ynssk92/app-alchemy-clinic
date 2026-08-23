-- 1. Create a secure RPC for role management
CREATE OR REPLACE FUNCTION public.manage_user_role(target_user_id UUID, new_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    admin_count INT;
BEGIN
    -- 1. Verify requester is admin
    IF NOT public.has_role(auth.uid(), 'admin') THEN
        RAISE EXCEPTION 'Unauthorized: only admins can manage roles';
    END IF;

    -- 2. Prevent self-modification
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Forbidden: cannot manage your own role';
    END IF;

    -- 3. Last-admin protection
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin'::app_role) THEN
        SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin'::app_role;
        IF admin_count <= 1 THEN
            RAISE EXCEPTION 'Forbidden: cannot revoke the last administrator';
        END IF;
    END IF;

    -- 4. Perform update
    DELETE FROM public.user_roles WHERE user_id = target_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (target_user_id, new_role);
END;
$$;

-- 2. Update RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can manage other users' roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read roles" ON public.user_roles;
DROP POLICY IF EXISTS "Allow individual read" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage all" ON public.user_roles;

-- Allow read access for all auth users
CREATE POLICY "Users can read roles" ON public.user_roles
    FOR SELECT TO authenticated USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

GRANT EXECUTE ON FUNCTION public.manage_user_role TO authenticated;
