-- Security Hardening: Revoke execute on SECURITY DEFINER functions from public roles
-- We only want specific callers to invoke these.

-- create_guest_booking is called by the guest-booking edge function (service_role)
REVOKE EXECUTE ON FUNCTION public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text, uuid, uuid, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text, uuid, uuid, text) TO service_role;

-- has_role is used in RLS, so it needs to be executable by authenticated users
-- but maybe not anon if they don't have roles.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
