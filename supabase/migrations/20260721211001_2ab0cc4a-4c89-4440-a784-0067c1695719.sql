
-- Appointments: assistants can view & update all, cannot delete
CREATE POLICY "Assistants view all appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'assistant'));

CREATE POLICY "Assistants update all appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'assistant'))
  WITH CHECK (public.has_role(auth.uid(), 'assistant'));

-- Contact messages: assistants can view & update (mark read/reply) but not delete
CREATE POLICY "Assistants view contact messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'assistant'));

CREATE POLICY "Assistants update contact messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'assistant'))
  WITH CHECK (public.has_role(auth.uid(), 'assistant'));

-- Profiles: assistants need to see patient names attached to appointments
CREATE POLICY "Assistants view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'assistant'));
