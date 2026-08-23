# Plan: FINAL Invitation-Based Role Assignment System (Revised)

Implement a secure, admin-controlled invitation system that serves as the source of truth for a user's initial role, with strict priority for privileged roles and protection against automatic downgrades.

## User Review Required

> [!IMPORTANT]
> - This implementation hardens the existing role system to ensure invitations are respected during authentication.
> - **Priority Logic:** Existing privileged roles (Admin, Doctor, Assistant) are never overwritten. Pending invitations override the "Patient" role or provide the role for new users.

## Proposed Changes

### Database & Backend (Supabase)

#### RPC: `claim_invitation_role`
- Implement a SECURITY DEFINER function with `SET search_path = public`.
- **Logic (Atomic & Idempotent):**
  1. Verify `auth.uid()` is not null.
  2. Get the authenticated user's **verified email** directly from `auth.users`.
  3. Normalize the email: `LOWER(TRIM(email))`.
  4. Check existing `user_roles` for the user.
  5. **Resolution Rules:**
     - IF existing role is `admin`, `doctor`, or `assistant`: **KEEP IT** and return it.
     - IF existing role is `patient` OR **NO ROLE** exists:
       - Check `admin_invites` for a `pending` invitation matching the normalized email (and not expired).
       - IF invitation exists:
         - **ATOMICALLY** replace the existing role (if any) with the invited role.
         - Mark invitation as `claimed`, set `claimed_by = auth.uid()`, and `claimed_at = now()`.
         - Return the invited role.
       - IF NO invitation exists:
         - IF user had no role, assign `patient`.
         - Return `patient`.
  6. Return the resolved role.

#### RLS & Permissions
- Hardened `admin_invites` RLS (admin-only).
- Grant `EXECUTE` on `claim_invitation_role` to `authenticated`.

### Frontend (React)

#### Auth Callback (`src/pages/AuthCallback.tsx`)
- Call `claim_invitation_role` RPC immediately after session acquisition.
- **Remove** all client-side logic that creates a "patient" role before the RPC.
- Use the RPC's returned role for redirection logic.

#### Auth Hook (`src/hooks/useAuth.tsx`)
- Ensure roles and permissions are fetched based on the database state, respecting the hierarchy.

## Technical Details

- **Security:** The RPC is the sole authority for role assignment during login. It does not accept parameters for `user_id` or `email`, fetching them securely from the auth context.
- **Initial Admin:** The bootstrap for `youness.skiri@gmail.com` remains but only triggers via the RPC if no privileged role or invitation is found.

## Verification Plan

### Manual Verification Scenarios
1. **Invite New User:** Invite `test@example.com` as Assistant -> Sign in -> Confirm Assistant role & claimed status.
2. **Existing Patient Upgrade:** User is Patient -> Admin invites as Doctor -> Sign in -> Confirm Doctor role.
3. **Privileged Protection:** User is Admin -> Admin invites as Patient -> Sign in -> Confirm **remains Admin**.
4. **No Invite:** New user signs in -> Confirm default Patient role.
