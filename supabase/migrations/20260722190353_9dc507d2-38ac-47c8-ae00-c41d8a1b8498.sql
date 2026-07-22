
DROP POLICY IF EXISTS "Admins manage availability" ON public.doctor_availability;
CREATE POLICY "Admins manage availability" ON public.doctor_availability
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage holidays" ON public.doctor_holidays;
CREATE POLICY "Admins manage holidays" ON public.doctor_holidays
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
