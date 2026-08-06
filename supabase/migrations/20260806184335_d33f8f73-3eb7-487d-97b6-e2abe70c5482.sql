
-- Address remaining 3 SD functions and extension

-- Fix 1: Extension in public (trying once more with more thorough check)
DO $$
BEGIN
  -- Re-check for any extension in public
  IF EXISTS (SELECT 1 FROM pg_extension e JOIN pg_namespace n ON e.extnamespace = n.oid WHERE n.nspname = 'public') THEN
    CREATE SCHEMA IF NOT EXISTS extensions;
    -- Try to move all extensions from public to extensions schema
    -- We'll try individually for common ones to be safe
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
      ALTER EXTENSION "uuid-ossp" SET SCHEMA extensions;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
      ALTER EXTENSION "pgcrypto" SET SCHEMA extensions;
    END IF;
  END IF;
END $$;

-- Fix 2: Search path for remaining SD functions
-- We'll also revoke execute from public for good measure
CREATE OR REPLACE FUNCTION public.promote_existing_on_invite()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END;
$$;

-- Fix 3: Revoke execute for any remaining functions
REVOKE EXECUTE ON FUNCTION public.promote_existing_on_invite() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text, text) FROM PUBLIC, anon; -- already partially done, but ensuring

-- Note: has_permission is STABLE but SECURITY DEFINER. It is callable by authenticated. 
-- This is often fine if the logic inside handles auth.uid() checks or is safe to read.
-- We'll keep it as is since it's used in RLS policies for many tables.
