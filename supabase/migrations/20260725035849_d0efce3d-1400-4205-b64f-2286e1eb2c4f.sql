CREATE POLICY "Branding readable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'branding');

CREATE POLICY "Branding writable by admins"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Branding updatable by admins"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Branding deletable by admins"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'));