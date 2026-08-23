# Plan: Admin-Only Patient Email Editing

This plan implements an admin-only feature to edit a patient's email address within the "Patient Identity" section of the Edit Patient Profile dialog. The email in the "Coordonnées" section will remain read-only for all users. Changes to the email will use the application's existing authentication architecture while maintaining data synchronization between `auth.users`, `profiles`, and `patient_intake`.

## User Review Required

> [!IMPORTANT]
> The admin-only email update will rely on the `service_role` key (via an Edge Function or RPC) to securely update `auth.users` without triggering full email confirmation flows if possible, or using the standard Supabase admin update methods. Since Lovable Cloud handles the `service_role`, I will implement this using a database function or secure logic that respects existing RLS.

- Do you have a specific Edge Function for admin-initiated user updates already, or should I create a new secure RPC? (I will assume a new RPC `admin_update_patient_email` for maximum security and minimal impact).

## Technical Details

### Database / Backend
1. **Create RPC Function**: `admin_update_patient_email(target_user_id uuid, new_email text)`
   - Defined as `SECURITY DEFINER`.
   - Checks if the executing user `public.has_role(auth.uid(), 'admin')`.
   - Updates `auth.users` (using `update users set email = ... where id = ...`).
   - Updates `public.profiles.email` and `public.patient_intake.email` to keep them in sync.
   - Handles unique constraint violations (e.g., if the new email already exists).

### Frontend
1. **`useAuth` Hook**:
   - Ensure `isAdmin` is available and reliable (already confirmed in `src/hooks/useAuth.tsx`).

2. **`EditPatientDialog.tsx`**:
   - Update `FormItem` for "Email" in the **Patient Identity** section:
     - If `isAdmin`, set `readOnly={false}` and `disabled={false}`.
     - Else, keep `readOnly={true}` and `disabled={true}`.
   - Update `FormItem` for "Email" in the **Coordonnées** section:
     - Always keep `readOnly={true}` and `disabled={true}` for everyone.
   - Update `onSubmit` logic:
     - Detect if `email` has changed.
     - If changed and user is admin, call the `admin_update_patient_email` RPC before or during the profile/intake update.
     - Ensure focus remains on the input while typing (already has a fix, but will verify it's not broken by the conditional `readOnly`).

3. **`AdminPatientDetails.tsx`**:
   - Ensure the view refreshes both email displays after a successful save (already triggered by `onSaved` callback).

## Constraints
- No changes to existing role priorities.
- No changes to RLS policies except what's required for the RPC.
- Maintain premium UI and "Non renseigné" fallbacks.
