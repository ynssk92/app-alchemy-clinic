
CREATE TABLE public.doctor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
GRANT SELECT ON public.doctor_availability TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_availability TO authenticated;
GRANT ALL ON public.doctor_availability TO service_role;
ALTER TABLE public.doctor_availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Availability readable by all" ON public.doctor_availability FOR SELECT USING (true);
CREATE POLICY "Admins manage availability" ON public.doctor_availability FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX ON public.doctor_availability(doctor_id);

CREATE TABLE public.doctor_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);
GRANT SELECT ON public.doctor_holidays TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctor_holidays TO authenticated;
GRANT ALL ON public.doctor_holidays TO service_role;
ALTER TABLE public.doctor_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Holidays readable by all" ON public.doctor_holidays FOR SELECT USING (true);
CREATE POLICY "Admins manage holidays" ON public.doctor_holidays FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX ON public.doctor_holidays(doctor_id);
