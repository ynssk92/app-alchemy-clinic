-- 1. Extend patient_documents with metadata and update its structure if needed
ALTER TABLE public.patient_documents ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.patient_documents ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id);
ALTER TABLE public.patient_documents ADD COLUMN IF NOT EXISTS document_date DATE DEFAULT CURRENT_DATE;

-- 2. Create Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.profiles(id),
    appointment_id UUID, -- Optional link to appointments
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Prescription Items Table
CREATE TABLE IF NOT EXISTS public.prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID REFERENCES public.prescriptions(id) ON DELETE CASCADE,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    duration TEXT,
    route TEXT,
    instructions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Patient Timeline / Events Table
CREATE TABLE IF NOT EXISTS public.patient_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'document_upload', 'prescription_created', 'analysis_added', etc.
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO authenticated;
GRANT ALL ON public.prescriptions TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescription_items TO authenticated;
GRANT ALL ON public.prescription_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_events TO authenticated;
GRANT ALL ON public.patient_events TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_documents TO authenticated;
GRANT ALL ON public.patient_documents TO service_role;

-- 6. RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- 7. Policies (simplified for now, assuming authenticated staff can manage these)
-- Note: In a production environment, these should be restricted by role (admin/doctor/assistant)
CREATE POLICY "Authenticated users can select prescriptions" ON public.prescriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescriptions" ON public.prescriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prescriptions" ON public.prescriptions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete prescriptions" ON public.prescriptions FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select prescription items" ON public.prescription_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert prescription items" ON public.prescription_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update prescription items" ON public.prescription_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete prescription items" ON public.prescription_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can select patient events" ON public.patient_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patient events" ON public.patient_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can select patient documents" ON public.patient_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert patient documents" ON public.patient_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update patient documents" ON public.patient_documents FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete patient documents" ON public.patient_documents FOR DELETE TO authenticated USING (true);
