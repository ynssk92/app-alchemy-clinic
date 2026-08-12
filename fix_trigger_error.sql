-- Fix the trigger that prevents role escalation to allow system-level operations
-- This is necessary for the handle_new_user trigger to function during signup.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow the change if:
  -- 1. OLD.role is NULL (initial creation or first time setting the role)
  -- 2. auth.uid() is NULL (operation performed by service_role or system triggers where no user session exists)
  -- 3. The user performing the action is an admin
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF OLD.role IS NOT NULL AND auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
      RAISE EXCEPTION 'Only administrators can change account roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure the sync_profile_role function is also healthy
CREATE OR REPLACE FUNCTION public.sync_profile_role()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    UPDATE public.profiles
    SET role = (SELECT role::text FROM public.user_roles WHERE user_id = NEW.user_id LIMIT 1)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$function$;

-- Re-grant permissions just in case
GRANT EXECUTE ON FUNCTION public.prevent_profile_role_escalation() TO service_role;
GRANT EXECUTE ON FUNCTION public.sync_profile_role() TO service_role;
