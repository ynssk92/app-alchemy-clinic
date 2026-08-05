-- Create Patients table
CREATE TABLE public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_number TEXT UNIQUE, -- e.g., P-1001
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT,
    dob DATE,
    marital_status TEXT,
    nationality TEXT,
    national_id TEXT,
    email TEXT,
    phone TEXT,
    alternative_phone TEXT,
    preferred_language TEXT,
    occupation TEXT,
    status TEXT DEFAULT 'active', -- active, inactive, blocked
    lead_source TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;
GRANT SELECT ON public.patients TO anon;

-- Patient Addresses
CREATE TABLE public.patient_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    country TEXT,
    city TEXT,
    region TEXT,
    postal_code TEXT,
    street_address TEXT,
    google_maps_location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_addresses TO authenticated;
GRANT ALL ON public.patient_addresses TO service_role;
GRANT SELECT ON public.patient_addresses TO anon;

-- Patient Medical History
CREATE TABLE public.patient_medical_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    blood_group TEXT,
    height_cm NUMERIC,
    weight_kg NUMERIC,
    bmi NUMERIC,
    primary_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    conditions TEXT[] DEFAULT '{}',
    custom_conditions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_medical_history TO authenticated;
GRANT ALL ON public.patient_medical_history TO service_role;
GRANT SELECT ON public.patient_medical_history TO anon;

-- Patient Allergies
CREATE TABLE public.patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    allergies TEXT[] DEFAULT '{}',
    custom_allergies TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_allergies TO authenticated;
GRANT ALL ON public.patient_allergies TO service_role;
GRANT SELECT ON public.patient_allergies TO anon;

-- Patient Medications
CREATE TABLE public.patient_medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    medication TEXT,
    dose TEXT,
    frequency TEXT,
    duration TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_medications TO authenticated;
GRANT ALL ON public.patient_medications TO service_role;
GRANT SELECT ON public.patient_medications TO anon;

-- Patient Emergency Contacts
CREATE TABLE public.patient_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    name TEXT,
    relationship TEXT,
    phone TEXT,
    alternative_phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_emergency_contacts TO authenticated;
GRANT ALL ON public.patient_emergency_contacts TO service_role;
GRANT SELECT ON public.patient_emergency_contacts TO anon;

-- Patient Dental History
CREATE TABLE public.patient_dental_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    previous_dentist TEXT,
    last_visit DATE,
    chief_complaint TEXT,
    reason_for_visit TEXT,
    treatments TEXT[] DEFAULT '{}', -- Braces, Implants, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_dental_history TO authenticated;
GRANT ALL ON public.patient_dental_history TO service_role;
GRANT SELECT ON public.patient_dental_history TO anon;

-- Patient Documents
CREATE TABLE public.patient_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    document_name TEXT,
    document_type TEXT, -- PDF, Image, etc.
    file_path TEXT, -- Storage path
    category TEXT, -- Insurance Card, X-ray, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_documents TO authenticated;
GRANT ALL ON public.patient_documents TO service_role;
GRANT SELECT ON public.patient_documents TO anon;

-- Patient Notes
CREATE TABLE public.patient_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_notes TEXT,
    internal_notes TEXT,
    warnings TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_notes TO authenticated;
GRANT ALL ON public.patient_notes TO service_role;
GRANT SELECT ON public.patient_notes TO anon;

-- Patient Insurance
CREATE TABLE public.patient_insurance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    provider TEXT,
    policy_number TEXT,
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_insurance TO authenticated;
GRANT ALL ON public.patient_insurance TO service_role;
GRANT SELECT ON public.patient_insurance TO anon;

-- Patient Social History
CREATE TABLE public.patient_social_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    smoking TEXT, -- Never, Former, Current
    alcohol TEXT, -- Never, Occasionally, Frequently
    drug_use TEXT,
    exercise TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_social_history TO authenticated;
GRANT ALL ON public.patient_social_history TO service_role;
GRANT SELECT ON public.patient_social_history TO anon;

-- Patient Consent
CREATE TABLE public.patient_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    receive_sms BOOLEAN DEFAULT FALSE,
    receive_email BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    treatment_consent BOOLEAN DEFAULT FALSE,
    gdpr_consent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_consent TO authenticated;
GRANT ALL ON public.patient_consent TO service_role;
GRANT SELECT ON public.patient_consent TO anon;

-- Function to auto-generate patient number
CREATE OR REPLACE FUNCTION generate_patient_number()
RETURNS TRIGGER AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(SUBSTRING(patient_number FROM 3)::INTEGER), 1000) + 1
    INTO next_id
    FROM public.patients;
    
    NEW.patient_number := 'P-' || next_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_patient_number
BEFORE INSERT ON public.patients
FOR EACH ROW
WHEN (NEW.patient_number IS NULL)
EXECUTE FUNCTION generate_patient_number();

-- Enable RLS
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_dental_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_social_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_consent ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified for admin/assistant access)
CREATE POLICY "Admin/Assistant can do everything" ON public.patients FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Patients can view own record" ON public.patients FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Admin/Assistant can manage addresses" ON public.patient_addresses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage medical history" ON public.patient_medical_history FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage allergies" ON public.patient_allergies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage medications" ON public.patient_medications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage emergency contacts" ON public.patient_emergency_contacts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage dental history" ON public.patient_dental_history FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage documents" ON public.patient_documents FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage notes" ON public.patient_notes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage insurance" ON public.patient_insurance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage social history" ON public.patient_social_history FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
CREATE POLICY "Admin/Assistant can manage consent" ON public.patient_consent FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
