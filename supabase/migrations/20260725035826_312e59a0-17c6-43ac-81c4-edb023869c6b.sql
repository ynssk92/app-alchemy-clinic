CREATE TABLE IF NOT EXISTS public.app_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  logo_url text,
  site_name text NOT NULL DEFAULT 'La Dune Clinique Dentaire',
  primary_hsl text NOT NULL DEFAULT '230 60% 34%',
  secondary_hsl text NOT NULL DEFAULT '220 70% 55%',
  accent_hsl text NOT NULL DEFAULT '210 90% 60%',
  background_hsl text NOT NULL DEFAULT '210 40% 98%',
  foreground_hsl text NOT NULL DEFAULT '222 47% 11%',
  radius text NOT NULL DEFAULT '0.75rem',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_settings readable by everyone"
  ON public.app_settings FOR SELECT
  USING (true);

CREATE POLICY "app_settings writable by admins"
  ON public.app_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "app_settings updatable by admins"
  ON public.app_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.app_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_app_settings()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_touch_app_settings ON public.app_settings;
CREATE TRIGGER trg_touch_app_settings
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_app_settings();