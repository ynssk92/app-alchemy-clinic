-- Fix permissions for guest-booking edge function
-- The function uses the service_role for the RPC, but triggers like handle_new_user 
-- must be executable by the roles that cause them (service_role in this case).
-- Also ensure the RPC function itself has the correct grants.

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text, uuid, text) TO service_role;

-- Ensure the auth.users triggers are healthy and public schema triggers don't block
-- The error "Database error creating new user" usually comes from an auth.users insert trigger failing.
-- If handle_new_user is failing, it's often due to permission issues on the tables it touches
-- or internal search_path issues.

-- Confirm service_role can touch the necessary tables for the trigger
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_roles TO service_role;
GRANT ALL ON public.admin_invites TO service_role;

-- Re-grant execute on has_role just in case
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
