
CREATE TABLE public.clinic_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid,
  clinic_name text,
  action text NOT NULL,
  actor_id uuid,
  changed_fields text[] DEFAULT '{}',
  old_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.clinic_audit_log TO authenticated;
GRANT ALL ON public.clinic_audit_log TO service_role;

ALTER TABLE public.clinic_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view clinic audit log"
  ON public.clinic_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.log_clinic_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  changed text[] := '{}';
  k text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.clinic_audit_log(clinic_id, clinic_name, action, actor_id, new_values)
    VALUES (NEW.id, NEW.name, 'create', auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    FOR k IN SELECT jsonb_object_keys(to_jsonb(NEW)) LOOP
      IF to_jsonb(NEW)->k IS DISTINCT FROM to_jsonb(OLD)->k
         AND k NOT IN ('created_at') THEN
        changed := array_append(changed, k);
      END IF;
    END LOOP;
    IF array_length(changed, 1) IS NOT NULL THEN
      INSERT INTO public.clinic_audit_log(clinic_id, clinic_name, action, actor_id, changed_fields, old_values, new_values)
      VALUES (NEW.id, NEW.name, 'update', auth.uid(), changed, to_jsonb(OLD), to_jsonb(NEW));
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.clinic_audit_log(clinic_id, clinic_name, action, actor_id, old_values)
    VALUES (OLD.id, OLD.name, 'delete', auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END $$;

CREATE TRIGGER clinics_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.clinics
FOR EACH ROW EXECUTE FUNCTION public.log_clinic_changes();
