
DO $$ BEGIN
  CREATE TYPE public.profile_status AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status public.profile_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_updated_by uuid;

-- Grandfather existing patients as approved
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';

-- New patient signups start as pending; staff (admin/assistant/doctor) auto-approved
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_id uuid;
  is_staff boolean := false;
BEGIN
  SELECT id INTO invite_id FROM public.admin_invites
    WHERE email = lower(new.email) AND claimed_at IS NULL;
  IF invite_id IS NOT NULL THEN is_staff := true; END IF;

  INSERT INTO public.profiles (id, full_name, status)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE WHEN is_staff THEN 'approved'::public.profile_status ELSE 'pending'::public.profile_status END
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'patient');

  IF invite_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invites SET claimed_at = now(), claimed_by = new.id WHERE id = invite_id;
  END IF;

  RETURN new;
END $function$;

-- Admins can update status
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS profiles_status_idx ON public.profiles(status);
