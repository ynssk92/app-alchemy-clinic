DROP POLICY IF EXISTS "app_settings updatable by admins" ON public.app_settings;

CREATE POLICY "app_settings updatable by authorized staff"
ON public.app_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'settings', 'edit'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_permission(auth.uid(), 'settings', 'edit'));

CREATE OR REPLACE FUNCTION public.enforce_app_settings_scope()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Non-admins with settings.edit may only change contact/hours fields
  IF (NEW.site_name IS DISTINCT FROM OLD.site_name)
     OR (NEW.logo_url IS DISTINCT FROM OLD.logo_url)
     OR (NEW.mobile_logo_url IS DISTINCT FROM OLD.mobile_logo_url)
     OR (NEW.favicon_url IS DISTINCT FROM OLD.favicon_url)
     OR (NEW.primary_hsl IS DISTINCT FROM OLD.primary_hsl)
     OR (NEW.secondary_hsl IS DISTINCT FROM OLD.secondary_hsl)
     OR (NEW.accent_hsl IS DISTINCT FROM OLD.accent_hsl)
     OR (NEW.background_hsl IS DISTINCT FROM OLD.background_hsl)
     OR (NEW.foreground_hsl IS DISTINCT FROM OLD.foreground_hsl)
     OR (NEW.radius IS DISTINCT FROM OLD.radius)
  THEN
    RAISE EXCEPTION 'Only administrators can change branding or theme settings';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_app_settings_scope_trg ON public.app_settings;
CREATE TRIGGER enforce_app_settings_scope_trg
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.enforce_app_settings_scope();