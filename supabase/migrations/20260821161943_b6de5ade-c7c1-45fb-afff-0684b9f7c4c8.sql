-- 1. Create tables for Medical History
CREATE TABLE IF NOT EXISTS public.patient_medical_history_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    condition TEXT NOT NULL,
    diagnosis_date DATE,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Family History
CREATE TABLE IF NOT EXISTS public.patient_family_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    condition TEXT NOT NULL,
    family_member TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Allergies
CREATE TABLE IF NOT EXISTS public.patient_allergies_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    allergy TEXT NOT NULL,
    reaction TEXT,
    severity TEXT,
    date_identified DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Chronic Diseases
CREATE TABLE IF NOT EXISTS public.patient_chronic_diseases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    disease TEXT NOT NULL,
    diagnosis_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Medications
CREATE TABLE IF NOT EXISTS public.patient_medications_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    medication TEXT NOT NULL,
    dosage TEXT,
    frequency TEXT,
    route TEXT,
    start_date DATE,
    end_date DATE,
    prescribing_doctor TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Surgeries
CREATE TABLE IF NOT EXISTS public.patient_surgeries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    surgery TEXT NOT NULL,
    surgery_date DATE,
    hospital TEXT,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Hospitalizations
CREATE TABLE IF NOT EXISTS public.patient_hospitalizations_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    hospital TEXT NOT NULL,
    admission_date DATE,
    discharge_date DATE,
    reason TEXT,
    diagnosis TEXT,
    doctor TEXT,
    treatment TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Vaccinations
CREATE TABLE IF NOT EXISTS public.patient_vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL,
    vaccine TEXT NOT NULL,
    vaccination_date DATE,
    dose TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Apply GRANTS
GRANT ALL ON public.patient_medical_history_v2 TO authenticated;
GRANT ALL ON public.patient_medical_history_v2 TO service_role;

GRANT ALL ON public.patient_family_history TO authenticated;
GRANT ALL ON public.patient_family_history TO service_role;

GRANT ALL ON public.patient_allergies_v2 TO authenticated;
GRANT ALL ON public.patient_allergies_v2 TO service_role;

GRANT ALL ON public.patient_chronic_diseases TO authenticated;
GRANT ALL ON public.patient_chronic_diseases TO service_role;

GRANT ALL ON public.patient_medications_v2 TO authenticated;
GRANT ALL ON public.patient_medications_v2 TO service_role;

GRANT ALL ON public.patient_surgeries TO authenticated;
GRANT ALL ON public.patient_surgeries TO service_role;

GRANT ALL ON public.patient_hospitalizations_v2 TO authenticated;
GRANT ALL ON public.patient_hospitalizations_v2 TO service_role;

GRANT ALL ON public.patient_vaccinations TO authenticated;
GRANT ALL ON public.patient_vaccinations TO service_role;

-- Enable RLS
ALTER TABLE public.patient_medical_history_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_family_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_chronic_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_medications_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_hospitalizations_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_vaccinations ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY patient_medical_history_v2_staff_access ON public.patient_medical_history_v2 FOR ALL TO authenticated USING (true);
CREATE POLICY patient_family_history_staff_access ON public.patient_family_history FOR ALL TO authenticated USING (true);
CREATE POLICY patient_allergies_v2_staff_access ON public.patient_allergies_v2 FOR ALL TO authenticated USING (true);
CREATE POLICY patient_chronic_diseases_staff_access ON public.patient_chronic_diseases FOR ALL TO authenticated USING (true);
CREATE POLICY patient_medications_v2_staff_access ON public.patient_medications_v2 FOR ALL TO authenticated USING (true);
CREATE POLICY patient_surgeries_staff_access ON public.patient_surgeries FOR ALL TO authenticated USING (true);
CREATE POLICY patient_hospitalizations_v2_staff_access ON public.patient_hospitalizations_v2 FOR ALL TO authenticated USING (true);
CREATE POLICY patient_vaccinations_staff_access ON public.patient_vaccinations FOR ALL TO authenticated USING (true);
