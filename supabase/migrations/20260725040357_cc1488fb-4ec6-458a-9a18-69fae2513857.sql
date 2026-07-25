ALTER TABLE public.app_settings 
  ADD COLUMN IF NOT EXISTS mobile_logo_url text,
  ADD COLUMN IF NOT EXISTS favicon_url text;