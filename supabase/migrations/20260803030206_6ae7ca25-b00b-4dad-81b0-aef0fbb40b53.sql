
DROP POLICY IF EXISTS "notifications updatable" ON public.notifications;
CREATE POLICY "notifications updatable" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR (audience IN ('admin','receptionist') AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'assistant')))
  )
  WITH CHECK (
    user_id = auth.uid()
    OR (audience IN ('admin','receptionist') AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'assistant')))
  );
