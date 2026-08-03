CREATE TABLE public.consultation_reasons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  label text NOT NULL,
  icon text,
  is_other boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.consultation_reasons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultation_reasons TO authenticated;
GRANT ALL ON public.consultation_reasons TO service_role;

ALTER TABLE public.consultation_reasons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Consultation reasons are viewable by everyone"
  ON public.consultation_reasons FOR SELECT USING (true);
CREATE POLICY "Admins can insert consultation reasons"
  ON public.consultation_reasons FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update consultation reasons"
  ON public.consultation_reasons FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete consultation reasons"
  ON public.consultation_reasons FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_consultation_reasons_updated
  BEFORE UPDATE ON public.consultation_reasons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.appointments
  ADD COLUMN reason_id uuid REFERENCES public.consultation_reasons(id) ON DELETE SET NULL,
  ADD COLUMN custom_reason text;

INSERT INTO public.consultation_reasons (category, label, icon, is_other, sort_order) VALUES
  ('Soins généraux', 'Contrôle et détartrage', 'Sparkles', false, 10),
  ('Soins généraux', 'Carie / douleur dentaire', 'Activity', false, 20),
  ('Soins généraux', 'Traitement de canal', 'Syringe', false, 30),
  ('Soins généraux', 'Extraction dentaire', 'Scissors', false, 40),
  ('Esthétique', 'Blanchiment dentaire', 'Sun', false, 50),
  ('Esthétique', 'Facettes / esthétique du sourire', 'Smile', false, 60),
  ('Orthodontie', 'Bilan orthodontique', 'AlignJustify', false, 70),
  ('Orthodontie', 'Suivi d''appareil / gouttières', 'Braces', false, 80),
  ('Implantologie', 'Consultation implant', 'Anchor', false, 90),
  ('Implantologie', 'Couronne / bridge / prothèse', 'Crown', false, 100),
  ('Urgences', 'Urgence dentaire', 'Siren', false, 110),
  ('Urgences', 'Traumatisme / dent cassée', 'AlertTriangle', false, 120),
  ('Autre', 'Autre motif', 'PenLine', true, 999);

CREATE OR REPLACE FUNCTION public.create_guest_booking(_user_id uuid, _first_name text, _last_name text, _email text, _phone text, _dob date, _gender text, _doctor_id uuid, _date date, _time text, _reason text, _reason_id uuid DEFAULT NULL, _custom_reason text DEFAULT NULL)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, reason_id, custom_reason, status, reference, source)
  VALUES (_user_id, _doctor_id, _date, _time, _reason, _reason_id, NULLIF(trim(coalesce(_custom_reason,'')), ''), 'pending', v_ref, 'guest')
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
    jsonb_build_object('email', lower(_email), 'reference', v_ref, 'doctor_id', _doctor_id, 'reason_id', _reason_id));

  RETURN jsonb_build_object('appointment_id', v_appt_id, 'reference', v_ref, 'doctor_name', v_doctor_name);
END $function$;