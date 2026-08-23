# Role Synchronization & Security Hardening Plan

Diagnose and resolve role mismatches, invitation RLS failures, and initial admin promotion issues while preserving all clinical data.

## Proposed Changes

### 1. Backend Security & Data Correction (SQL)
- **Hardening `admin_invites` RLS**: Update policies to explicitly use `is_admin()` for INSERT, ensuring only verified administrators can issue invitations.
- **Granting Privileges**: Ensure `anon` and `authenticated` roles have appropriate access to `admin_invites` (SELECT for discovery during auth, but only Admin for management).
- **Data Correction**: 
    - Ensure `youness.skiri@gmail.com` is promoted to `admin` in `user_roles`.
    - Investigate and correct `thebirdagencyma@gmail.com` role state if it was incorrectly assigned or cached.
- **Permission Mapping**: Verify `role_permissions` contains `user_management.create` or similar for `admin` role to allow invitation creation.

### 2. Auth Callback Logic (`AuthCallback.tsx`)
- **Fix Overwrite Bug**: Modify the logic to prevent overwriting existing roles (especially `admin`) with `patient` during sign-in.
- **Invitation Logic**: Ensure invitations are verified by email and the assigned role is persisted correctly in `user_roles`.
- **Initial Admin Bootstrap**: Harden the check for `INITIAL_ADMIN_EMAILS` to only run if the user has NO roles assigned yet.

### 3. Frontend Role Consistency
- **`useAuth.tsx`**: Ensure roles are reloaded on every state change and that permissions are correctly mapped from `user_roles` + `role_permissions`.
- **Admin Users List**: Verify the query in `AdminUsers.tsx` correctly joins with `user_roles` to show the authoritative role.
- **Sidebar & Dashboard**: Ensure visibility is strictly controlled by the `role` and `permissions` returned by `useAuth`.

### 4. Verification Scenarios
- Verify `youness.skiri@gmail.com` can create invitations.
- Verify a normal Google user receives `patient` role by default.
- Verify invitations correctly assign `doctor`/`assistant`/`admin` roles.

## Technical Details

- **Supabase RPCs**: `has_role`, `is_admin`, `has_permission`.
- **Tables**: `user_roles`, `admin_invites`, `role_permissions`, `profiles`.
- **No Data Loss**: All clinical records (patients, appointments, etc.) remain untouched.

## User Roles Source of Truth
ONE table: `public.user_roles`.
ONE source in React: `useAuth` hook.
ONE source in SQL: `has_role()` / `is_admin()` functions.
