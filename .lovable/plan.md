# Plan: FINAL Invitation-Based Role Assignment System

Implement a secure, admin-controlled invitation system that serves as the source of truth for a user's initial role in the dental clinic application.

## User Review Required

> [!IMPORTANT]
> - This implementation hardens the existing role system to ensure invitations are respected during the first authentication (Google/Email).
> - Admins will be able to set roles for specific emails, which are automatically applied and "claimed" upon login.

## Proposed Changes

### Database & Backend (Supabase)

#### RPC: `claim_invitation_role`
- Implement a SECURITY DEFINER function to handle role resolution.
- **Logic:**
  1. Check if the authenticated user already has a role in `user_roles`. If yes, return it.
  2. Normalize the authenticated user's verified email.
  3. Search `admin_invites` for a `pending` invitation matching the normalized email.
  4. If found:
     - Assign the invited role to the user in `user_roles`.
     - Mark the invitation as `claimed` and record the `user_id`.
     - Return the role.
  5. If no invitation:
     - Assign the `patient` role (if they have no role).
     - Return `patient`.
  6. Return the resolved role.

#### RLS & Grants
- Ensure `admin_invites` is strictly admin-only for INSERT/UPDATE/DELETE.
- Enable RLS on `user_roles` (already done) and ensure users cannot modify their own roles.
- Grant `EXECUTE` on the new RPC to `authenticated`.

### Frontend (React)

#### Authentication Callback (`src/pages/AuthCallback.tsx`)
- Refactor to call the `claim_invitation_role` RPC immediately after authentication.
- Remove client-side checks for specific emails (except for the initial bootstrap if absolutely necessary, but prioritize the RPC).
- Ensure permissions and profiles are loaded/created after the role is confirmed.

#### Admin Invitation UI (`src/pages/admin/AdminUsers.tsx`)
- Keep the existing form but ensure it stores: `email`, `role`, `status` ('pending'), `created_by`.
- Display invitation status (Pending vs Claimed).

#### Auth Hook (`src/hooks/useAuth.tsx`)
- Ensure `loadRole` correctly fetches permissions and roles from the database without hardcoded overrides.

## Technical Details

- **Email Normalization:** `LOWER(TRIM(email))` in both database and frontend.
- **Security:** `claim_invitation_role` uses `SECURITY DEFINER` to bypass RLS during role assignment while verifying the caller's identity via `auth.uid()`.
- **RBAC:** Roles are mapped to permissions in the `role_permissions` table (existing architecture).

## Verification Plan

### Automated Tests
- Run Playwright tests for:
  - Admin invitation creation.
  - User login with pending invitation (verifying role assignment).
  - User login without invitation (verifying default patient role).
  - Prevention of self-role escalation.

### Manual Verification
1. Create an invite for a test email as Admin.
2. Sign in with that test email.
3. Verify role is correctly assigned and invitation is marked as claimed.
4. Verify non-admins cannot create invitations via the console.
