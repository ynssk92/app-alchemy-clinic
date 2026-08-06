
-- Add user_id to doctors table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'doctors' AND column_name = 'user_id') THEN
        ALTER TABLE public.doctors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Drop all existing storage policies for patient_documents bucket to start fresh
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' 
        AND (policyname LIKE '%patient documents%' OR policyname LIKE '%document%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    END LOOP;
END $$;

-- 1. SELECT Policy (Read)
CREATE POLICY "Strict document read access"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'patient_documents' 
    AND (
        public.has_role(auth.uid(), 'admin')
        OR (
            public.has_role(auth.uid(), 'patient') 
            AND (name LIKE (SELECT pat.id::text FROM public.patients pat WHERE pat.user_id = auth.uid()) || '/%')
        )
        OR (
            public.has_role(auth.uid(), 'doctor')
            AND EXISTS (
                SELECT 1 FROM public.doctors doc
                LEFT JOIN public.patient_medical_history pmh ON pmh.primary_doctor_id = doc.id
                LEFT JOIN public.appointments app ON app.doctor_id = doc.id
                WHERE doc.user_id = auth.uid()
                AND (
                    pmh.patient_id::text = split_part(name, '/', 1) 
                    OR app.patient_id::text = split_part(name, '/', 1)
                )
            )
        )
    )
);

-- 2. INSERT Policy (Upload)
CREATE POLICY "Strict document upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'patient_documents'
    AND (
        public.has_role(auth.uid(), 'admin')
        OR (
            public.has_role(auth.uid(), 'patient') 
            AND (name LIKE (SELECT pat.id::text FROM public.patients pat WHERE pat.user_id = auth.uid()) || '/%')
        )
        OR (
            public.has_role(auth.uid(), 'doctor')
            AND EXISTS (
                SELECT 1 FROM public.doctors doc
                LEFT JOIN public.patient_medical_history pmh ON pmh.primary_doctor_id = doc.id
                LEFT JOIN public.appointments app ON app.doctor_id = doc.id
                WHERE doc.user_id = auth.uid()
                AND (
                    pmh.patient_id::text = split_part(name, '/', 1) 
                    OR app.patient_id::text = split_part(name, '/', 1)
                )
            )
        )
    )
);

-- 3. UPDATE Policy
CREATE POLICY "Strict document update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'patient_documents'
    AND (
        public.has_role(auth.uid(), 'admin')
        OR owner = auth.uid()
    )
);

-- 4. DELETE Policy
CREATE POLICY "Strict document delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'patient_documents'
    AND (
        public.has_role(auth.uid(), 'admin')
        OR owner = auth.uid()
    )
);

-- Harden public.patient_documents metadata table policies
DROP POLICY IF EXISTS "Admin full metadata access" ON public.patient_documents;
DROP POLICY IF EXISTS "Patients metadata read" ON public.patient_documents;
DROP POLICY IF EXISTS "Doctors metadata read" ON public.patient_documents;
DROP POLICY IF EXISTS "Doctors metadata insert" ON public.patient_documents;
DROP POLICY IF EXISTS "Admin full access to documents metadata" ON public.patient_documents;
DROP POLICY IF EXISTS "Patients metadata access" ON public.patient_documents;
DROP POLICY IF EXISTS "Doctors metadata access" ON public.patient_documents;
DROP POLICY IF EXISTS "Doctors insert metadata" ON public.patient_documents;
DROP POLICY IF EXISTS "Admin/Assistant can manage documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Admins can manage all patient documents" ON public.patient_documents;
DROP POLICY IF EXISTS "Admins can manage patient documents" ON public.patient_documents;

CREATE POLICY "Admin full metadata access"
ON public.patient_documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Patients metadata read"
ON public.patient_documents FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.patients pat 
        WHERE pat.id = public.patient_documents.patient_id AND pat.user_id = auth.uid()
    )
);

CREATE POLICY "Doctors metadata read"
ON public.patient_documents FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        LEFT JOIN public.patient_medical_history pmh ON pmh.primary_doctor_id = doc.id
        LEFT JOIN public.appointments app ON app.doctor_id = doc.id
        WHERE doc.user_id = auth.uid()
        AND (pmh.patient_id = public.patient_documents.patient_id OR app.patient_id = public.patient_documents.patient_id)
    )
);

CREATE POLICY "Doctors metadata insert"
ON public.patient_documents FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.doctors doc
        LEFT JOIN public.patient_medical_history pmh ON pmh.primary_doctor_id = doc.id
        LEFT JOIN public.appointments app ON app.doctor_id = doc.id
        WHERE doc.user_id = auth.uid()
        AND (pmh.patient_id = public.patient_documents.patient_id OR app.patient_id = public.patient_documents.patient_id)
    )
);
