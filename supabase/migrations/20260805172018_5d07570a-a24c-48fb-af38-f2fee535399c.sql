ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS meta jsonb DEFAULT '{}'::jsonb;

-- Ensure RLS allows reading/writing meta for authorized roles (admin/staff)
-- The existing app_settings policies should already cover this, but we'll double check
-- Default grants should already be in place from previous turns for app_settings
