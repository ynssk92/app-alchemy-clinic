DROP POLICY IF EXISTS "Patients update own appointments" ON public.appointments;
CREATE POLICY "Patients update own appointments"
ON public.appointments FOR UPDATE TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Admins update any profile" ON public.profiles;
CREATE POLICY "Admins update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));