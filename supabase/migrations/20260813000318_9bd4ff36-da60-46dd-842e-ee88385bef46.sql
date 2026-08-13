-- Fix create_guest_booking return type mismatch
DROP FUNCTION IF EXISTS public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text);
DROP FUNCTION IF EXISTS public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text, uuid, uuid, text);
DROP FUNCTION IF EXISTS public.create_guest_booking(uuid, text, text, text, text, date, text, uuid, date, text, text, uuid, text); -- Just in case

-- Issue 1: Guest Booking Identity Spoofing
CREATE OR REPLACE FUNCTION public.create_guest_booking(
  _user_id uuid, 
  _first_name text, 
  _last_name text, 
  _email text, 
  _phone text, 
  _dob date DEFAULT NULL, 
  _gender text DEFAULT NULL, 
  _doctor_id uuid DEFAULT NULL, 
  _date date DEFAULT NULL, 
  _time text DEFAULT NULL, 
  _reason text DEFAULT NULL, 
  _service_id uuid DEFAULT NULL, 
  _reason_id uuid DEFAULT NULL, 
  _custom_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_full_name text := trim(coalesce(_first_name,'') || ' ' || coalesce(_last_name,''));
  v_ref text := 'RDV-' || to_char(now(), 'YYYY') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 6));
  v_appt_id uuid;
  v_doctor_name text;
  v_user_existed boolean;
  v_status text := 'pending';
BEGIN
  -- Check if user already has a profile (existed before this call)
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id) INTO v_user_existed;

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

  -- 1. Identity Handling
  IF v_user_existed THEN
    -- If user existed, don't overwrite their profile with guest data
    -- and set appointment to a status that requires verification
    v_status := 'pending_verification';
  ELSE
    -- New user: create/update profile
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
  END IF;

  -- 2. Create Appointment
  INSERT INTO public.appointments (
    patient_id, doctor_id, appointment_date, appointment_time, 
    reason, service_id, reason_id, custom_reason, status, reference, source
  )
  VALUES (
    _user_id, _doctor_id, _date, _time, 
    _reason, _service_id, _reason_id, _custom_reason, v_status, v_ref, 'guest'
  )
  RETURNING id INTO v_appt_id;

  -- 3. History
  INSERT INTO public.appointment_history (appointment_id, status, note, changed_by)
  VALUES (v_appt_id, v_status, 'Demande de rendez-vous créée en ligne (Guest)', _user_id);

  -- 4. Notifications
  INSERT INTO public.notifications (user_id, audience, type, title, body, appointment_id)
  VALUES (_user_id, 'patient', 'appointment',
    CASE WHEN v_user_existed THEN 'Vérification requise pour votre rendez-vous' ELSE 'Votre demande de rendez-vous est enregistrée' END,
    'Référence ' || v_ref || ' — ' || coalesce(v_doctor_name,'') || ' le ' || to_char(_date,'DD/MM/YYYY') || ' à ' || _time,
    v_appt_id);

  INSERT INTO public.notifications (user_id, audience, type, title, body, appointment_id)
  VALUES
    (NULL, 'admin', 'appointment', 'Nouveau rendez-vous (Guest' || CASE WHEN v_user_existed THEN ' - Existant' ELSE '' END || ')',
      v_full_name || ' — ' || coalesce(v_doctor_name,'') || ' le ' || to_char(_date,'DD/MM/YYYY') || ' à ' || _time, v_appt_id);

  INSERT INTO public.activity_logs (actor_id, action, entity, entity_id, meta)
  VALUES (_user_id, 'guest_booking_created', 'appointment', v_appt_id,
    jsonb_build_object('email', lower(_email), 'reference', v_ref, 'doctor_id', _doctor_id, 'existed', v_user_existed));

  RETURN jsonb_build_object(
    'appointment_id', v_appt_id, 
    'reference', v_ref, 
    'doctor_name', v_doctor_name,
    'pending_verification', v_user_existed
  );
END;
$$;

-- Issue 2: Doctor License Number Exposure
-- 1. Drop existing permissive policy
DROP POLICY IF EXISTS "Public read doctors" ON public.doctors;

-- 2. Create restricted public policy
-- We use REVOKE/GRANT for column level but also need the policy to allow row access.
REVOKE SELECT (license_number) ON public.doctors FROM anon, authenticated;
GRANT SELECT (id, full_name, specialty_id, clinic_id, bio, avatar_url, experience_years, rating, is_available, created_at, updated_at, consultation_duration, biography, languages, user_id) ON public.doctors TO anon, authenticated;

CREATE POLICY "Public read doctors" ON public.doctors
FOR SELECT TO anon, authenticated
USING (true);

-- Ensure service_role and admins still have full access
GRANT SELECT ON public.doctors TO service_role;
-- (authenticated role already has the restricted grant above, 
-- but Admins manage doctors policy handles their specific elevated access via has_role)
