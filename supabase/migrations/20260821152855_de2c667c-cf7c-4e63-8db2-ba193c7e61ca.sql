-- Add missing columns to patient_intake
ALTER TABLE public.patient_intake 
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS identity_document_type text,
ADD COLUMN IF NOT EXISTS identity_document_number text;

-- Add missing columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS identity_document_type text,
ADD COLUMN IF NOT EXISTS identity_document_number text;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.patient_intake TO authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
