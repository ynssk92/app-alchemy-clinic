
DROP POLICY IF EXISTS "Authenticated users can select prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Authenticated users can insert prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Authenticated users can update prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Authenticated users can delete prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Authenticated users can select prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Authenticated users can insert prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Authenticated users can update prescription items" ON public.prescription_items;
DROP POLICY IF EXISTS "Authenticated users can delete prescription items" ON public.prescription_items;

CREATE POLICY "Staff manage prescriptions" ON public.prescriptions
  FOR ALL TO authenticated
  USING (public.is_clinic_staff(auth.uid()))
  WITH CHECK (public.is_clinic_staff(auth.uid()));

CREATE POLICY "Patients read own prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated
  USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage prescription items" ON public.prescription_items
  FOR ALL TO authenticated
  USING (public.is_clinic_staff(auth.uid()))
  WITH CHECK (public.is_clinic_staff(auth.uid()));

CREATE POLICY "Patients read own prescription items" ON public.prescription_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.prescriptions pr
    WHERE pr.id = prescription_items.prescription_id
      AND public.owns_patient_record(auth.uid(), pr.patient_id)
  ));
