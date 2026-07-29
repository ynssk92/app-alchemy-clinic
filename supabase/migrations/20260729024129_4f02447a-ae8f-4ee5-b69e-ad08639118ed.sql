REVOKE SELECT ON public.app_settings FROM anon, authenticated;
GRANT SELECT (id,logo_url,site_name,primary_hsl,secondary_hsl,accent_hsl,background_hsl,foreground_hsl,radius,updated_at,mobile_logo_url,favicon_url,contact_phone,contact_phone_secondary,contact_email,contact_address,map_url,emergency_phone,hours_weekdays,hours_saturday,hours_sunday)
  ON public.app_settings TO anon, authenticated;