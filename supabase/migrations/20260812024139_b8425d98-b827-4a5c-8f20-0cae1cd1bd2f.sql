-- Admins can update any profile
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can update any profile'
    ) THEN
        CREATE POLICY "Admins can update any profile" ON public.profiles
        FOR UPDATE TO authenticated
        USING (public.has_role(auth.uid(), 'admin'))
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
