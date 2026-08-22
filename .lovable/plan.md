# Plan - Secure Multi-Admin Role-Based Access Control

Implement a secure, multi-admin authorization system leveraging the existing `user_roles` and `admin_invites` architecture.

## User Review Required

> [!IMPORTANT]
> To bootstrap the system, I will add a configuration point in `AuthCallback.tsx`. Please provide the initial administrator email address to be promoted.

- **Initial Admin Configuration**: I will add a constant `INITIAL_ADMIN_EMAILS` in the auth flow. Anyone in this list will be promoted to `admin` if they don't already have the role.

## Proposed Changes

### Database & Security (Supabase)
- **Non-destructive Migration**:
    - Add a `SECURITY DEFINER` function `is_admin()` to safely check admin status in RLS policies without recursion.
    - Update RLS policies on `user_roles` and `admin_invites` to use `is_admin()` for strict access control.
    - Add a constraint or trigger to prevent deleting the last administrator.
    - Ensure `authenticated` users can only view their own roles, while `admin` users can manage all.

### Frontend Authorization
- **Auth Hook Hardening**:
    - Update `useAuth` to reactive-ly track roles and ensure `isAdmin` is strictly derived from the backend `user_roles` table.
- **Route Protection**:
    - Ensure `ProtectedRoute` strictly redirects non-admins away from `/admin/*`.
    - Verify `PermissionRoute` (used in sub-pages) correctly integrates with the central `isAdmin` state.

### Admin Management UI
- **Admin Invites Flow**:
    - Hardenable `AdminUsers.tsx` to ensure only existing admins can grant/revoke admin status.
    - Implement a "Self-demotion prevention" check in the UI to prevent admins from locking themselves out.

### UI Cleanup
- Revert the `HeroSection` badge from the instruction text back to "CLINIQUE LA DUNE DENTAIRE".

## Technical Details
- **Role Hierarchy**: `admin` > `staff` (`doctor`, `assistant`) > `patient`.
- **Logic Location**: `AuthCallback.tsx` will handle the initial auto-promotion for `INITIAL_ADMIN_EMAILS`.
- **RLS Enforcement**:
  ```sql
  CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin');
  $$ LANGUAGE sql SECURITY DEFINER;
  ```

## Verification Plan
- **Test Admin Access**: Log in with an admin email -> verify access to `/admin`.
- **Test Patient Access**: Log in with a new Google account -> verify redirect to `/patient-dashboard` and 403/Redirect on `/admin`.
- **Test Privilege Escalation**: Attempt to call `supabase.from('user_roles').insert(...)` from console as non-admin -> verify RLS failure.
- **Test Data Integrity**: Confirm existing appointments and patient records remain visible and editable by authorized roles.
