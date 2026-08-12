# Plan: Fix Appointment History "notes" Error

Identify and fix the database schema mismatch where the code attempts to write to a non-existent `notes` column in `appointment_history`.

## Technical Details

- **Investigation Result**: The table `public.appointment_history` has a column named `note` (singular), but the database function `create_guest_booking` (and potentially other migrations) uses `notes` (plural).
- **Target File**: `supabase/migrations/20260812185916_1a530c93-040d-4ca5-af17-c4c2a6f16958.sql` contains the latest definition of `create_guest_booking`.
- **Action**: Update the function to use the correct column name `note`.
- **Safety**: No schema changes (DDL) other than updating the function logic.

## Steps

1. **Update Database Function**: Apply a migration to redefine `public.create_guest_booking` using the correct `note` column.
2. **Verify Types**: Check if `src/integrations/supabase/types.ts` reflects the correct schema (it already does, showing `note`).
3. **Verification**: Confirm the appointment creation flow works without the "column notes does not exist" error.
