
-- 1. Appointment extras
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'web';

CREATE UNIQUE INDEX IF NOT EXISTS appointments_reference_key ON public.appointments(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS appointments_slot_idx
  ON public.appointments(doctor_id, appointment_date, appointment_time);

-- 2. Appointment history
CREATE TABLE IF NOT EXISTS public.appointment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  status text NOT NULL,
  note text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.appointment_history TO authenticated;
GRANT ALL ON public.appointment_history TO service_role;
ALTER TABLE public.appointment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history readable by staff or owner" ON public.appointment_history
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'assistant')
    OR EXISTS (SELECT 1 FROM public.appointments a WHERE a.id = appointment_id AND a.patient_id = auth.uid())
  );

-- 3. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  audience text NOT NULL DEFAULT 'patient',
  type text NOT NULL DEFAULT 'appointment',
  title text NOT NULL,
  body text,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications readable" ON public.notifications
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR (audience IN ('admin','receptionist') AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'assistant')))
  );
CREATE POLICY "notifications updatable" ON public.notifications
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    OR (audience IN ('admin','receptionist') AND (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'assistant')))
  )
  WITH CHECK (true);

-- 4. Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  action text NOT NULL,
  entity text,
  entity_id uuid,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity logs staff only" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'assistant'));

-- 5. New patients are active immediately (no admin approval)
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'approved'::public.profile_status;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invite_id uuid;
BEGIN
  SELECT id INTO invite_id FROM public.admin_invites
    WHERE email = lower(new.email) AND claimed_at IS NULL;

  INSERT INTO public.profiles (id, full_name, status)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'approved'::public.profile_status
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'patient')
    ON CONFLICT (user_id, role) DO NOTHING;

  IF invite_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (new.id, 'admin')
      ON CONFLICT (user_id, role) DO NOTHING;
    UPDATE public.admin_invites SET claimed_at = now(), claimed_by = new.id WHERE id = invite_id;
  END IF;

  RETURN new;
END $function$;

UPDATE public.profiles SET status = 'approved'::public.profile_status WHERE status = 'pending'::public.profile_status;

-- 6. Atomic guest booking routine
CREATE OR REPLACE FUNCTION public.create_guest_booking(
  _user_id uuid,
  _first_name text,
  _last_name text,
  _email text,
  _phone text,
  _dob date,
  _gender text,
  _doctor_id uuid,
  _date date,
  _time text,
  _reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_full_name text := trim(coalesce(_first_name,'') || ' ' || coalesce(_last_name,''));
  v_ref text := 'RDV-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 6));
  v_appt_id uuid;
  v_doctor_name text;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.doctors WHERE id = _doctor_id AND is_available) THEN
    RAISE EXCEPTION 'Praticien indisponible';
  END IF;
  IF _date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Date invalide';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.appointments
    WHERE doctor_id = _doctor_id AND appointment_date = _date
      AND appointment_time = _time AND status <> 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Ce créneau vient d''être réservé';
  END IF;

  SELECT full_name INTO v_doctor_name FROM public.doctors WHERE id = _doctor_id;

  INSERT INTO public.profiles (id, full_name, phone, status)
  VALUES (_user_id, v_full_name, _phone, 'approved'::public.profile_status)
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
        phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
        status = 'approved'::public.profile_status,
        updated_at = now();

  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'patient')
    ON CONFLICT (user_id, role) DO NOTHING;

  IF NOT EXISTS (SELECT 1 FROM public.patient_intake WHERE user_id = _user_id) THEN
    INSERT INTO public.patient_intake (user_id, first_name, last_name, email, phone, dob, gender, status, primary_doctor_id)
    VALUES (_user_id, _first_name, _last_name, lower(_email), _phone, _dob, _gender, 'active', _doctor_id);
  END IF;

  INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, reference, source)
  VALUES (_user_id, _doctor_id, _date, _time, _reason, 'pending', v_ref, 'guest')
  RETURNING id INTO v_appt_id;

  INSERT INTO public.appointment_history (appointment_id, status, note, changed_by)
  VALUES (v_appt_id, 'pending', 'Demande de rendez-vous créée en ligne', _user_id);

  INSERT INTO public.notifications (user_id, audience, type, title, body, appointment_id)
  VALUES (_user_id, 'patient', 'appointment',
    'Votre demande de rendez-vous est enregistrée',
    'Référence ' || v_ref || ' — ' || coalesce(v_doctor_name,'') || ' le ' || to_char(_date,'DD/MM/YYYY') || ' à ' || _time,
    v_appt_id);

  INSERT INTO public.notifications (user_id, audience, type, title, body, appointment_id)
  VALUES
    (NULL, 'admin', 'appointment', 'Nouveau rendez-vous en ligne',
      v_full_name || ' — ' || coalesce(v_doctor_name,'') || ' le ' || to_char(_date,'DD/MM/YYYY') || ' à ' || _time, v_appt_id),
    (NULL, 'receptionist', 'appointment', 'Nouveau rendez-vous en ligne',
      v_full_name || ' — ' || coalesce(v_doctor_name,'') || ' le ' || to_char(_date,'DD/MM/YYYY') || ' à ' || _time, v_appt_id);

  INSERT INTO public.activity_logs (actor_id, action, entity, entity_id, meta)
  VALUES (_user_id, 'guest_booking_created', 'appointment', v_appt_id,
    jsonb_build_object('email', lower(_email), 'reference', v_ref, 'doctor_id', _doctor_id));

  RETURN jsonb_build_object('appointment_id', v_appt_id, 'reference', v_ref, 'doctor_name', v_doctor_name);
END $$;

REVOKE ALL ON FUNCTION public.create_guest_booking(uuid,text,text,text,text,date,text,uuid,date,text,text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_guest_booking(uuid,text,text,text,text,date,text,uuid,date,text,text) TO service_role;
