
CREATE OR REPLACE FUNCTION public.is_clinic_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','assistant','doctor')
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_patient_record(_user_id uuid, _patient_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = _patient_id AND p.user_id = _user_id
  );
$$;

-- patient_documents: drop blanket policies
DROP POLICY IF EXISTS "Authenticated users can select patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Authenticated users can insert patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Authenticated users can update patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Authenticated users can delete patient documents" ON public.patient_documents;

CREATE POLICY "Staff manage patient documents" ON public.patient_documents
  FOR ALL TO authenticated
  USING (public.is_clinic_staff(auth.uid()))
  WITH CHECK (public.is_clinic_staff(auth.uid()));

-- patient_events
DROP POLICY IF EXISTS "Authenticated users can select patient events" ON public.patient_events;
DROP POLICY IF EXISTS "Authenticated users can insert patient events" ON public.patient_events;

CREATE POLICY "Staff manage patient events" ON public.patient_events
  FOR ALL TO authenticated
  USING (public.is_clinic_staff(auth.uid()))
  WITH CHECK (public.is_clinic_staff(auth.uid()));

CREATE POLICY "Patients read their own events" ON public.patient_events
  FOR SELECT TO authenticated
  USING (public.owns_patient_record(auth.uid(), patient_id));

-- sensitive v2 tables
DROP POLICY IF EXISTS "patient_vaccinations_staff_access" ON public.patient_vaccinations;
DROP POLICY IF EXISTS "patient_family_history_staff_access" ON public.patient_family_history;
DROP POLICY IF EXISTS "patient_allergies_v2_staff_access" ON public.patient_allergies_v2;
DROP POLICY IF EXISTS "patient_chronic_diseases_staff_access" ON public.patient_chronic_diseases;
DROP POLICY IF EXISTS "patient_medications_v2_staff_access" ON public.patient_medications_v2;
DROP POLICY IF EXISTS "patient_hospitalizations_v2_staff_access" ON public.patient_hospitalizations_v2;
DROP POLICY IF EXISTS "patient_surgeries_staff_access" ON public.patient_surgeries;
DROP POLICY IF EXISTS "patient_medical_history_v2_staff_access" ON public.patient_medical_history_v2;

CREATE POLICY "Staff manage vaccinations" ON public.patient_vaccinations FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own vaccinations" ON public.patient_vaccinations FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage family history" ON public.patient_family_history FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own family history" ON public.patient_family_history FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage allergies v2" ON public.patient_allergies_v2 FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own allergies v2" ON public.patient_allergies_v2 FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage chronic diseases" ON public.patient_chronic_diseases FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own chronic diseases" ON public.patient_chronic_diseases FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage medications v2" ON public.patient_medications_v2 FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own medications v2" ON public.patient_medications_v2 FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage hospitalizations v2" ON public.patient_hospitalizations_v2 FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own hospitalizations v2" ON public.patient_hospitalizations_v2 FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage surgeries" ON public.patient_surgeries FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own surgeries" ON public.patient_surgeries FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));

CREATE POLICY "Staff manage medical history v2" ON public.patient_medical_history_v2 FOR ALL TO authenticated USING (public.is_clinic_staff(auth.uid())) WITH CHECK (public.is_clinic_staff(auth.uid()));
CREATE POLICY "Patients read own medical history v2" ON public.patient_medical_history_v2 FOR SELECT TO authenticated USING (public.owns_patient_record(auth.uid(), patient_id));
