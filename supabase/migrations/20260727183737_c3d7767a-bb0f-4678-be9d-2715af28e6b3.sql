ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS contact_phone_secondary text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_address text,
  ADD COLUMN IF NOT EXISTS map_url text,
  ADD COLUMN IF NOT EXISTS emergency_phone text,
  ADD COLUMN IF NOT EXISTS hours_weekdays text,
  ADD COLUMN IF NOT EXISTS hours_saturday text,
  ADD COLUMN IF NOT EXISTS hours_sunday text;

UPDATE public.app_settings SET
  contact_phone = COALESCE(contact_phone, '+212 5 28 00 00 00'),
  contact_email = COALESCE(contact_email, 'contact@ladune.ma'),
  contact_address = COALESCE(contact_address, 'Agadir, Maroc'),
  hours_weekdays = COALESCE(hours_weekdays, '9:00 - 19:00'),
  hours_saturday = COALESCE(hours_saturday, '9:00 - 13:00'),
  hours_sunday = COALESCE(hours_sunday, 'Fermé');