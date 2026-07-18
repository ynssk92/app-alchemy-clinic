
CREATE POLICY "Public can view doctor avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'doctor-avatars');

CREATE POLICY "Admins can upload doctor avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'doctor-avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update doctor avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'doctor-avatars' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete doctor avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'doctor-avatars' AND public.has_role(auth.uid(), 'admin'));
