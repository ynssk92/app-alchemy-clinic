
-- Grant access to patient_documents table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_documents TO authenticated;
GRANT ALL ON public.patient_documents TO service_role;

-- Enable RLS and set policies for patient_documents if not already set
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all patient documents') THEN
        CREATE POLICY "Admins can manage all patient documents" 
        ON public.patient_documents FOR ALL 
        TO authenticated 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;

-- Policies for storage.objects - bucket 'patient_documents'
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can upload patient documents' AND schemaname = 'storage' AND tablename = 'objects') THEN
        CREATE POLICY "Staff can upload patient documents"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'patient_documents');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can view patient documents' AND schemaname = 'storage' AND tablename = 'objects') THEN
        CREATE POLICY "Staff can view patient documents"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'patient_documents');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can update patient documents' AND schemaname = 'storage' AND tablename = 'objects') THEN
        CREATE POLICY "Staff can update patient documents"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'patient_documents');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Staff can delete patient documents' AND schemaname = 'storage' AND tablename = 'objects') THEN
        CREATE POLICY "Staff can delete patient documents"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'patient_documents');
    END IF;
END $$;
