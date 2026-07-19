-- Use the username portion of the email (before @) instead of the full email as the fallback display name
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
    UPDATE public.admin_invites SET claimed_at = now() WHERE id = invite_id;
  END IF;

  RETURN new;
END $function$;

-- Backfill: for any existing profile whose full_name currently equals the user's email,
-- replace it with the username portion (before the @).
UPDATE public.profiles p
SET full_name = split_part(u.email, '@', 1)
FROM auth.users u
WHERE p.id = u.id
  AND p.full_name = u.email;
