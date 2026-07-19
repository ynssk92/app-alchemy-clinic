
ALTER TABLE public.admin_invites ADD COLUMN IF NOT EXISTS claimed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_id uuid;
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'patient');

  SELECT id INTO invite_id FROM public.admin_invites
   WHERE email = lower(new.email) AND claimed_at IS NULL;

  IF invite_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invites SET claimed_at = now(), claimed_by = new.id WHERE id = invite_id;
  END IF;

  RETURN new;
END $function$;

CREATE OR REPLACE FUNCTION public.promote_existing_on_invite()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE lower(email) = NEW.email LIMIT 1;
  IF uid IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    NEW.claimed_at = now();
    NEW.claimed_by = uid;
  END IF;
  RETURN NEW;
END $function$;

-- Backfill claimed_by for previously claimed invites
UPDATE public.admin_invites ai
SET claimed_by = u.id
FROM auth.users u
WHERE ai.claimed_by IS NULL
  AND ai.claimed_at IS NOT NULL
  AND lower(u.email) = ai.email;
