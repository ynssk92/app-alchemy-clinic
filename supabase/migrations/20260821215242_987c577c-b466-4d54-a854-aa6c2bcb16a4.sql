
REVOKE EXECUTE ON FUNCTION public.is_clinic_staff(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.owns_patient_record(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_clinic_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_patient_record(uuid, uuid) TO authenticated, service_role;
