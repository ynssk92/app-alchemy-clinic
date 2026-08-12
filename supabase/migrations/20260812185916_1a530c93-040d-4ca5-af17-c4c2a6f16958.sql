CREATE OR REPLACE FUNCTION public.create_guest_booking(_user_id uuid, _first_name text, _last_name text, _email text, _phone text, _dob date DEFAULT NULL::date, _gender text DEFAULT NULL::text, _doctor_id uuid DEFAULT NULL::uuid, _date date DEFAULT NULL::date, _time text DEFAULT NULL::text, _reason text DEFAULT NULL::text, _service_id uuid DEFAULT NULL::uuid, _reason_id uuid DEFAULT NULL::uuid, _custom_reason text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_patient_id uuid;
  v_appointment_id uuid;
  v_reference text;
BEGIN
  -- 1. Ensure profile exists
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (_user_id, _first_name || ' ' || _last_name, _phone)
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone;

  -- 2. Ensure patient_intake exists
  INSERT INTO public.patient_intake (id, first_name, last_name, email, phone, dob, gender)
  VALUES (_user_id, _first_name, _last_name, _email, _phone, _dob, _gender)
  ON CONFLICT (id) DO NOTHING;

  -- 3. Create appointment
  v_reference := 'APP-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  
  INSERT INTO public.appointments (
    patient_id, doctor_id, appointment_date, appointment_time, 
    reason, service_id, reason_id, custom_reason, status, reference, source
  )
  VALUES (
    _user_id, _doctor_id, _date, _time, 
    _reason, _service_id, _reason_id, _custom_reason, 'upcoming', v_reference, 'web'
  )
  RETURNING id INTO v_appointment_id;

  -- 4. Log history
  INSERT INTO public.appointment_history (appointment_id, status, changed_by, notes)
  VALUES (v_appointment_id, 'upcoming', _user_id, 'Rendez-vous créé en ligne (Guest)');

  RETURN json_build_object(
    'appointment_id', v_appointment_id,
    'reference', v_reference
  );
END;
$function$;