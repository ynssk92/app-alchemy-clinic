
CREATE TABLE public.patient_intake (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  gender TEXT,
  blood_group TEXT,
  status TEXT DEFAULT 'active',
  primary_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  address_1 TEXT,
  address_2 TEXT,
  country TEXT,
  state TEXT,
  city TEXT,
  pincode TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_intake TO authenticated;
GRANT ALL ON public.patient_intake TO service_role;

ALTER TABLE public.patient_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and assistants manage patient intake"
ON public.patient_intake FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));

CREATE TRIGGER patient_intake_set_updated_at
BEFORE UPDATE ON public.patient_intake
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX patient_intake_email_idx ON public.patient_intake(lower(email));
