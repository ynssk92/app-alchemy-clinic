-- Migration: Add medical and insurance fields to patient_intake and profiles
-- Date: 2026-08-21
-- Description: Additive changes to support a complete Medical CRM/EMR system.

-- 1. Create enum for patient type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_type') THEN
        CREATE TYPE public.patient_type AS ENUM ('adult', 'minor');
    END IF;
END$$;

-- 2. Add columns to patient_intake
ALTER TABLE public.patient_intake 
ADD COLUMN IF NOT EXISTS patient_type public.patient_type DEFAULT 'adult',
ADD COLUMN IF NOT EXISTS languages text[],
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS family_situation text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact_relation text,
ADD COLUMN IF NOT EXISTS insurance_name text,
ADD COLUMN IF NOT EXISTS insurance_number text,
ADD COLUMN IF NOT EXISTS insurance_policy text,
ADD COLUMN IF NOT EXISTS insurance_status text,
ADD COLUMN IF NOT EXISTS insurance_notes text,
ADD COLUMN IF NOT EXISTS birth_type text,
ADD COLUMN IF NOT EXISTS birth_weight numeric,
ADD COLUMN IF NOT EXISTS birth_height numeric,
ADD COLUMN IF NOT EXISTS apgar_score text,
ADD COLUMN IF NOT EXISTS breastfeeding text,
ADD COLUMN IF NOT EXISTS birth_complications text,
ADD COLUMN IF NOT EXISTS psychomotor_development text,
ADD COLUMN IF NOT EXISTS development_notes text,
ADD COLUMN IF NOT EXISTS rhesus text,
ADD COLUMN IF NOT EXISTS allergies text,
ADD COLUMN IF NOT EXISTS chronic_diseases text,
ADD COLUMN IF NOT EXISTS current_medications text,
ADD COLUMN IF NOT EXISTS medical_history text,
ADD COLUMN IF NOT EXISTS family_history text,
ADD COLUMN IF NOT EXISTS surgical_history text,
ADD COLUMN IF NOT EXISTS previous_hospitalizations text;

-- 3. Add columns to profiles (syncing relevant administrative fields)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS patient_type public.patient_type DEFAULT 'adult',
ADD COLUMN IF NOT EXISTS languages text[],
ADD COLUMN IF NOT EXISTS profession text,
ADD COLUMN IF NOT EXISTS family_situation text,
ADD COLUMN IF NOT EXISTS emergency_contact_name text,
ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
ADD COLUMN IF NOT EXISTS emergency_contact_relation text,
ADD COLUMN IF NOT EXISTS insurance_name text,
ADD COLUMN IF NOT EXISTS insurance_number text,
ADD COLUMN IF NOT EXISTS insurance_policy text,
ADD COLUMN IF NOT EXISTS insurance_status text,
ADD COLUMN IF NOT EXISTS insurance_notes text,
ADD COLUMN IF NOT EXISTS rhesus text;

-- 4. Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.patient_intake TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.patient_intake TO service_role;
GRANT SELECT ON public.profiles TO service_role;
