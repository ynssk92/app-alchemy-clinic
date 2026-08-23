# Plan - Role-Based Authorization Hardening

Extend the existing role-based permission system to support granular roles (Admin, Doctor, Assistant, Patient) in invitations, automated role assignment on signup, and a centralized role management UI.

## Database Changes (Additive & Non-Destructive)

- **Extend `admin_invites` table**:
  - Add `role` column (enum `app_role`, default 'admin' for backward compatibility).
  - Update `GRANT`s to ensure `authenticated` users can read their own invite during callback.
- **Permission Seeding**:
  - Populate `role_permissions` with the requested defaults for `doctor`, `assistant`, and `patient`.
  - Permissions use the `module.action` format (e.g., `patients.view`, `billing.view`).
- **RLS Hardening**:
  - Update `user_roles` policy to allow users to read their own roles.
  - Ensure `has_permission()` function correctly handles the staff roles.

## Frontend Changes

### 1. Invitations Update
- **Modify `AdminUsers.tsx`**:
  - Update the "Admin Invites" section to a "Staff & Patient Invitations" UI.
  - Add a Role selector (Admin, Doctor, Assistant, Patient) to the invite form.
  - Store the selected role in `admin_invites`.

### 2. Automated Role Assignment
- **Update `AuthCallback.tsx`**:
  - When a user signs in, check for a pending invitation matching their email.
  - If found, assign the `role` specified in the invitation to `user_roles`.
  - Mark invitation as claimed.
  - Maintain the `INITIAL_ADMIN_EMAILS` bootstrap as a fallback.

### 3. Role & Permission Management
- **Enhance `AdminRoles.tsx`**:
  - Create a professional UI to manage permissions *per role*.
  - List all roles and their associated `module.action` permissions.
  - Ensure changes to a role's permissions immediately affect all users with that role.
- **Update `AdminUsers.tsx`**:
  - Allow Admins to change a user's role via a dropdown.
  - Display the permissions inherited by the user based on their active role.
  - Prevent self-demotion (existing logic).

### 4. UI Polish
- **Update `HeroSection.tsx`**: Apply the requested literal display text to the badge as requested.
- **Update `AdminLayout.tsx`**: Ensure sidebar visibility correctly reflects the new granular permissions.

## Technical Details
- Roles: `admin`, `doctor`, `assistant`, `patient`.
- RLS ownership: Patients can only access records where `uid = auth.uid()`.
- Staff access: Doctors/Assistants access records via `has_permission()`.
- Admin access: Bypasses permission checks (Superuser).

## Verification Plan
- Use `/admin/verify-role` to test each role's access to Dashboard, Patients, and Billing.
- Verify that a new invite with role `doctor` correctly promotes the user upon login.
- Verify that changing `doctor` permissions in the DB/UI reflects for all doctors.
