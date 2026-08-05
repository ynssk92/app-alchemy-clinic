-- 1. Update handle_new_user to use phone and support dynamic role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_id uuid;
  target_role text;
BEGIN
  -- Check for admin invite
  SELECT id INTO invite_id FROM public.admin_invites
    WHERE email = lower(new.email) AND claimed_at IS NULL;

  -- Insert profile with phone and approved status
  INSERT INTO public.profiles (id, full_name, phone, status)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    'approved'::public.profile_status
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = coalesce(EXCLUDED.phone, profiles.phone);

  -- Determine role (default to patient, unless specified in metadata or invite found)
  target_role := coalesce(new.raw_user_meta_data->>'role', 'patient');
  
  -- Prevent random users from becoming admins/assistants via metadata unless invited
  IF target_role IN ('admin', 'assistant') AND invite_id IS NULL THEN
    target_role := 'patient';
  END IF;

  INSERT INTO public.user_roles (user_id, role) 
  VALUES (new.id, target_role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- If invite exists, they get admin role regardless of metadata
  IF invite_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) 
    VALUES (new.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    UPDATE public.admin_invites 
    SET claimed_at = now(), claimed_by = new.id 
    WHERE id = invite_id;
  END IF;

  RETURN new;
END $function$;

-- 2. Ensure RLS for profiles allows users to manage their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON public.profiles FOR UPDATE 
        TO authenticated 
        USING (auth.uid() = id);
    END IF;
END $$;
