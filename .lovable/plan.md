# Plan: Secure Admin-Only Patient Email Update

This plan implements a secure, admin-only feature to update a patient's email address using a server-side Edge Function. The email will be editable in the "Patient Identity" section for admins only, while remaining read-only in the "Coordonnées" section for all users. The implementation ensures security by using a server-side component to handle `auth.users` updates via the service role, maintaining synchronization across all related tables without duplicating identities.

## User Review Required

> [!IMPORTANT]
> The email update will be performed via a new Supabase Edge Function `admin-update-patient-email`. This function will use the Supabase Auth Admin API (Service Role) to securely update the target user's email.
> 
> **Note on Supabase Auth Behavior:** If Supabase is configured to require email confirmation for changes, the patient will receive a confirmation link. The Edge Function will follow the project's configured Auth settings.

- I will proceed with creating the Edge Function `admin-update-patient-email`.

## Technical Details

### Backend (Edge Function)
1. **Create Edge Function**: `admin-update-patient-email`
   - **Authentication**: Verifies the caller is authenticated via the JWT.
   - **Authorization**: Checks if the caller has the `admin` role using the `public.has_role` check or checking the `user_roles` table directly via the service role client.
   - **Input Validation**: Accepts `target_user_id` and `new_email`. Validates and normalizes the email (lowercase, trimmed).
   - **User Verification**: Checks if the target user exists and if the new email is already in use by another account.
   - **Update Operation**: Uses `auth.admin.updateUserById` to update the email in `auth.users`.
   - **Synchronization**: Updates the `email` field in `public.profiles` and `public.patient_intake` to match the new authoritative source.

### Frontend
1. **`src/components/admin/EditPatientDialog.tsx`**:
   - **Patient Identity Section**:
     - Check `isAdmin` from `useAuth`.
     - Set the Email `Input` to `readOnly={!isAdmin}` and `disabled={!isAdmin}`.
     - Ensure the `Input` uses a stable pattern to maintain focus during continuous typing.
   - **Coordonnées Section**:
     - Keep the Email `Input` as `readOnly` and `disabled` for everyone.
   - **Submission Logic (`onSubmit`)**:
     - Detect if the email has changed from the original loaded value.
     - If changed and user is Admin:
       1. Call `supabase.functions.invoke('admin-update-patient-email', ...)` first.
       2. If successful, proceed with the existing profile and intake updates.
       3. If it fails, stop execution and show an error toast without updating the rest of the profile.
     - If the email is unchanged, proceed with the normal update.
   - **Persistence**: Ensure the updated email is reflected in the form state and subsequent queries.

2. **`src/pages/admin/AdminPatientDetails.tsx`**:
   - The `onSaved` callback already triggers a refresh of the patient data, which will pull the updated email for both sections.

## Constraints
- **Security**: No service role keys in the frontend. No direct SQL updates to `auth.users`.
- **Data Integrity**: No duplicate user accounts. No changes to existing clinical data or roles.
- **UX**: Maintain continuous typing focus for the admin email field.
