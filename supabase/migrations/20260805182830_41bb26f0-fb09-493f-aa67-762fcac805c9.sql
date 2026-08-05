-- Ensure admins have full CRUD permissions on all patient-related clinical tables
-- This bypasses any existing restrictive policies for the 'admin' role

-- Patients table
DROP POLICY IF EXISTS "Admins can manage patients" ON public.patients;
CREATE POLICY "Admins can manage patients"
ON public.patients
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patient Addresses
DROP POLICY IF EXISTS "Admins can manage patient addresses" ON public.patient_addresses;
CREATE POLICY "Admins can manage patient addresses"
ON public.patient_addresses
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patient Medical History
DROP POLICY IF EXISTS "Admins can manage medical history" ON public.patient_medical_history;
CREATE POLICY "Admins can manage medical history"
ON public.patient_medical_history
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patient Allergies
DROP POLICY IF EXISTS "Admins can manage allergies" ON public.patient_allergies;
CREATE POLICY "Admins can manage allergies"
ON public.patient_allergies
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patient Medications
DROP POLICY IF EXISTS "Admins can manage medications" ON public.patient_medications;
CREATE POLICY "Admins can manage medications"
ON public.patient_medications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patient Documents (Storage Metadata)
DROP POLICY IF EXISTS "Admins can manage patient documents" ON public.patient_documents;
CREATE POLICY "Admins can manage patient documents"
ON public.patient_documents
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patient Notes
DROP POLICY IF EXISTS "Admins can manage notes" ON public.patient_notes;
CREATE POLICY "Admins can manage notes"
ON public.patient_notes
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT ALL ON public.patients TO authenticated;
GRANT ALL ON public.patient_addresses TO authenticated;
GRANT ALL ON public.patient_medical_history TO authenticated;
GRANT ALL ON public.patient_allergies TO authenticated;
GRANT ALL ON public.patient_medications TO authenticated;
GRANT ALL ON public.patient_documents TO authenticated;
GRANT ALL ON public.patient_notes TO authenticated;
