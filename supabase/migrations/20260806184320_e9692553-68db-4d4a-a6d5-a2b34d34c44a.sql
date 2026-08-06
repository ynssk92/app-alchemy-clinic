
-- Final sweep to fix remaining security linter issues

-- 1. Ensure search_path is set for ALL public functions
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    UPDATE public.profiles
    SET role = (SELECT role::text FROM public.user_roles WHERE user_id = NEW.user_id LIMIT 1)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_admin_invite_email()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.email := lower(NEW.email);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := public.next_invoice_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calc_invoice_item_total()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.total := ROUND((NEW.qty * NEW.unit_price) - COALESCE(NEW.discount,0) + COALESCE(NEW.tax,0), 2);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_invoice_from_items()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_invoice(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_invoice_from_payments()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  PERFORM public.recalc_invoice(COALESCE(NEW.invoice_id, OLD.invoice_id));
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_app_settings()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_app_settings_scope()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.id := true;
  RETURN NEW;
END;
$$;

-- 2. Revoke execute on any remaining SECURITY DEFINER functions from PUBLIC
REVOKE EXECUTE ON FUNCTION public.sync_profile_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_clinic_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_guest_booking(uuid,text,text,text,text,date,text,uuid,date,text,text) FROM PUBLIC, anon, authenticated;

-- Ensure service_role can still run them (needed for triggers/API)
GRANT EXECUTE ON FUNCTION public.sync_profile_role() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_clinic_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.create_guest_booking(uuid,text,text,text,text,date,text,uuid,date,text,text) TO service_role;
