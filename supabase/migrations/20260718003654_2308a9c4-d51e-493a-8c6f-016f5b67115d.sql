
CREATE TABLE public.admin_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_invites TO authenticated;
GRANT ALL ON public.admin_invites TO service_role;

ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invites" ON public.admin_invites
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Normalize emails to lowercase
CREATE OR REPLACE FUNCTION public.normalize_admin_invite_email()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.email = lower(trim(NEW.email));
  RETURN NEW;
END $$;

CREATE TRIGGER admin_invites_normalize
BEFORE INSERT OR UPDATE ON public.admin_invites
FOR EACH ROW EXECUTE FUNCTION public.normalize_admin_invite_email();

-- Update signup handler to auto-grant admin if invited
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'patient');

  SELECT id INTO invite_id FROM public.admin_invites
   WHERE email = lower(new.email) AND claimed_at IS NULL;

  IF invite_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invites SET claimed_at = now() WHERE id = invite_id;
  END IF;

  RETURN new;
END $$;

-- Promote existing user immediately when invite is created
CREATE OR REPLACE FUNCTION public.promote_existing_on_invite()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE lower(email) = NEW.email LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    NEW.claimed_at = now();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER admin_invites_promote_existing
BEFORE INSERT ON public.admin_invites
FOR EACH ROW EXECUTE FUNCTION public.promote_existing_on_invite();
