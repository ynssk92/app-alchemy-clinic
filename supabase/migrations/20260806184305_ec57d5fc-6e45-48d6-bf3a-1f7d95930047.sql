
-- Fix 1: Add missing search_path to functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_id uuid;
BEGIN
  SELECT id INTO invite_id FROM public.admin_invites
    WHERE email = lower(new.email) AND claimed_at IS NULL;

  INSERT INTO public.profiles (id, full_name, status)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'approved'::public.profile_status
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'patient')
    ON CONFLICT (user_id, role) DO NOTHING;

  IF invite_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invites SET claimed_at = now(), claimed_by = new.id WHERE id = invite_id;
  END IF;

  RETURN new;
END $$;

CREATE OR REPLACE FUNCTION public.generate_patient_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(SUBSTRING(patient_number FROM 3)::INTEGER), 1000) + 1
    INTO next_id
    FROM public.patients;
    
    NEW.patient_number := 'P-' || next_id;
    RETURN NEW;
END;
$$;

-- Fix 2: Move extensions to a separate schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO public;
GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- Only if the extension exists in public
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp' AND (SELECT nspname FROM pg_namespace WHERE oid = extnamespace) = 'public') THEN
    ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto' AND (SELECT nspname FROM pg_namespace WHERE oid = extnamespace) = 'public') THEN
    ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;
  END IF;
END $$;

-- Fix 3: Revoke excessive execute permissions from PUBLIC on security definer functions
-- These were already partially revoked in older migrations, but we ensure all are covered.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_existing_on_invite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recalc_invoice(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.next_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_profile_role_escalation() FROM PUBLIC, anon, authenticated;

-- Allow authenticated users to check roles (needed for policies)
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
