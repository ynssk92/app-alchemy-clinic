-- Create separate profile tables for each role
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    office_location text,
    access_level text DEFAULT 'standard',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    specialty_id uuid REFERENCES public.specialties(id),
    biography text,
    license_number text,
    experience_years integer,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_profiles (
    profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    blood_group text,
    allergies text,
    emergency_contact_name text,
    emergency_contact_phone text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Grant access
GRANT SELECT, INSERT, UPDATE ON public.admin_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.doctor_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_profiles TO authenticated;

GRANT ALL ON public.admin_profiles TO service_role;
GRANT ALL ON public.doctor_profiles TO service_role;
GRANT ALL ON public.patient_profiles TO service_role;

-- Enable RLS
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies (users can manage their own specific profile)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own admin profile') THEN
        CREATE POLICY "Users can manage own admin profile" ON public.admin_profiles FOR ALL TO authenticated USING (auth.uid() = profile_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own doctor profile') THEN
        CREATE POLICY "Users can manage own doctor profile" ON public.doctor_profiles FOR ALL TO authenticated USING (auth.uid() = profile_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own patient profile') THEN
        CREATE POLICY "Users can manage own patient profile" ON public.patient_profiles FOR ALL TO authenticated USING (auth.uid() = profile_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all sub-profiles') THEN
        CREATE POLICY "Admins can view all sub-profiles" ON public.admin_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all doctor sub-profiles') THEN
        CREATE POLICY "Admins can view all doctor sub-profiles" ON public.doctor_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all patient sub-profiles') THEN
        CREATE POLICY "Admins can view all patient sub-profiles" ON public.patient_profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;
