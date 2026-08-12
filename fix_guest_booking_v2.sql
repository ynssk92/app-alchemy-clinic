-- Further fix for guest-booking permissions and schema consistency

-- 1. Ensure service_role has access to all related tables
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.admin_invites TO service_role;
GRANT ALL ON public.patient_intake TO service_role;
GRANT ALL ON public.appointments TO service_role;
GRANT ALL ON public.appointment_history TO service_role;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.activity_logs TO service_role;
GRANT ALL ON public.doctors TO service_role;
GRANT ALL ON public.consultation_reasons TO service_role;

-- 2. Ensure execute grants for service_role on ALL triggers and routines
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text, uuid, text) TO service_role;

-- 3. Fix potential profile_status permission issues
-- Profile status was likely added as a type.
DO $$
BEGIN
    GRANT USAGE ON SCHEMA public TO service_role;
    -- If profile_status is a type, grant usage if it exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        GRANT USAGE ON TYPE public.profile_status TO service_role;
        GRANT USAGE ON TYPE public.profile_status TO authenticated;
        GRANT USAGE ON TYPE public.profile_status TO anon;
    END IF;
    
    -- Also grant app_role usage
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        GRANT USAGE ON TYPE public.app_role TO service_role;
        GRANT USAGE ON TYPE public.app_role TO authenticated;
        GRANT USAGE ON TYPE public.app_role TO anon;
    END IF;
END $$;

-- 4. Final check on handle_new_user search path and security
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path = public, auth;
