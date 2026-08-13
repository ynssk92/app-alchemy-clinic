# Security Hardening Plan

Implement targeted security fixes for four identified vulnerabilities in the clinic application without breaking existing functionality.

## Technical Details

### Issue 1: Guest Booking Identity Spoofing
- **Current Behavior**: `guest-booking` edge function matches email to existing accounts and books under that ID.
- **Fix**: 
    - Modify `create_guest_booking` RPC to check if the `_user_id` belongs to a pre-existing authenticated user who hasn't verified this specific booking session.
    - If email exists, create the appointment but flag it as `pending_verification` or `unverified_guest`.
    - Do not update the existing profile with guest-provided data.

### Issue 2: Doctor License Number Exposure
- **Current Behavior**: `Public read doctors` policy allows anyone to read `license_number`.
- **Fix**:
    - Update RLS policy for `doctors` to exclude `license_number` from public `SELECT`.
    - Create a secure view `public_doctors` or update the policy to use a `CASE` or column-level restriction if possible (Supabase RLS is row-level, so we typically restrict the policy and use a view or ensure the frontend doesn't rely on it for public users).
    - Refactor: Keep `SELECT *` for admins, but for `anon`/`authenticated`, allow everything *except* `license_number`.

### Issue 3: Appointment Reminders Authorization
- **Current Behavior**: Triggerable by anyone with the anon key (or no key if not checked).
- **Fix**:
    - Update `appointment-reminders` edge function to validate the `Authorization` header against the `service_role` key.
    - Ensure the `pg_cron` job continues to pass the correct secret.

### Issue 4: Admin Diagnostic Authorization
- **Current Behavior**: `verify-assistants` is public.
- **Fix**:
    - Update `verify-assistants` edge function to check for `service_role` (for cron) OR a valid admin JWT (for manual triggers).

## Proposed Changes

### Database Migrations
- Update `doctors` RLS policies.
- Update `create_guest_booking` function logic.
- Add granular grants for restricted columns if necessary.

### Edge Functions
- `supabase/functions/guest-booking/index.ts`: Update logic to handle existing users securely.
- `supabase/functions/verify-assistants/index.ts`: Add auth checks.
- `supabase/functions/appointment-reminders/index.ts` (if found/created): Add auth checks.

### Frontend
- No UI changes requested, but will verify that the doctors page still functions without the `license_number` field.
