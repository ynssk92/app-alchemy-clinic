-- Storage policies for patient_documents
CREATE POLICY "Admin/Assistant can manage patient documents" ON storage.objects
FOR ALL TO authenticated
USING (bucket_id = 'patient_documents' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant')));

CREATE POLICY "Patients can view own documents" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'patient_documents' AND (owner = auth.uid()));
