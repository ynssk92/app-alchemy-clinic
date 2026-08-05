-- Add expanded fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS preferred_communication TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS dob DATE,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"appointment_reminders": true, "email_notifications": true, "sms_notifications": false, "marketing_emails": false, "browser_notifications": true}'::jsonb,
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"profile_visibility": "private", "data_sharing": false}'::jsonb;

-- Ensure patient_intake has matching fields or can sync
-- patient_intake already has: blood_group, dob (dob), city, country, etc.
-- Adding missing fields to patient_intake for full sync
ALTER TABLE public.patient_intake
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
ADD COLUMN IF NOT EXISTS insurance_number TEXT,
ADD COLUMN IF NOT EXISTS allergies TEXT,
ADD COLUMN IF NOT EXISTS medical_conditions TEXT;

-- Update doctors table for professional info
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS license_number TEXT,
ADD COLUMN IF NOT EXISTS consultation_duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS biography TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{fr}';

-- Grant permissions (standard procedure)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.patient_intake TO authenticated;
GRANT SELECT, UPDATE ON public.doctors TO authenticated;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
