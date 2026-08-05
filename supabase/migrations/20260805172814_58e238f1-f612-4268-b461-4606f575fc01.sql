-- Add role and status columns to profiles if they don't exist
-- First, let's ensure we use the existing profile_status enum or create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_status') THEN
        CREATE TYPE public.profile_status AS ENUM ('active', 'inactive', 'blocked', 'pending');
    END IF;
END $$;

-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text;
-- Update the existing status column to use the enum if it's currently text
-- (We saw it was already using the enum in the types, but let's be safe)
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'pending';

-- Create an app_role enum for the role column if preferred, but text is fine too for now
-- Let's stick with text to match the user's request for flexibility.

-- Create a helper function to sync roles from user_roles table if it exists
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET role = (SELECT role::text FROM public.user_roles WHERE user_id = NEW.user_id LIMIT 1)
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to keep profiles.role in sync with user_roles
DROP TRIGGER IF EXISTS tr_sync_profile_role ON public.user_roles;
CREATE TRIGGER tr_sync_profile_role
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_role();

-- Initial sync
UPDATE public.profiles p
SET role = (SELECT role::text FROM public.user_roles ur WHERE ur.user_id = p.id LIMIT 1);
