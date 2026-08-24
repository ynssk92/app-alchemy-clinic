DROP POLICY IF EXISTS "Users can read roles" ON public.user_roles;

CREATE POLICY "Clinic staff can view role assignments"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_clinic_staff(auth.uid()));