# Role Synchronization & Security Hardening Plan (Revised)

Diagnose and resolve role mismatches, invitation RLS failures, and initial admin promotion issues with strict backend enforcement and data isolation.

## Diagnosis
- **`youness.skiri@gmail.com`**: Auth account exists (`c00aec5d...`) but has NO record in `public.user_roles`. The `handle_new_user` trigger likely failed or was bypassed, resulting in the user having no role, causing the frontend to default to `patient` while lacking backend permissions.
- **`thebirdagencyma@gmail.com`**: Has THREE roles in `user_roles`: `patient`, `assistant`, and `admin`. The frontend `loadRole` function picks `list[0]` (likely `patient` or whichever was inserted first), while RLS policies using `public.has_role()` return true for `admin` because `EXISTS` finds at least one match. This creates a state mismatch between UI badges and backend access.
- **`admin_invites` INSERT failure**: Current RLS policy "Admins manage invites" uses `is_admin()`. If the currently logged-in admin's `user_roles` entry is missing or inconsistent, `is_admin()` returns false, causing the RLS violation.
- **Admins List Mismatch**: `AdminUsers.tsx` filters users based on `user_roles`. If a user has multiple roles (like `thebirdagencyma@gmail.com`), the joined list might not reflect the primary role intended for the UI categories.

## Proposed Changes

### 1. Backend Security & Data Correction (SQL)
- **Role Cleanup**: Remove redundant `patient` and `assistant` roles for `thebirdagencyma@gmail.com` to ensure consistency.
- **Admin Promotion**: Explicitly insert the `admin` role for `youness.skiri@gmail.com`.
- **`admin_invites` RLS**: 
    - **Current**: `ALL` for `authenticated` using `is_admin()`.
    - **New**: Keep `INSERT/UPDATE/DELETE` gated by `is_admin()`. Remove broad `SELECT` for `authenticated`.
- **Secure Invitation Verification**: Create a `SECURITY DEFINER` function `verify_my_invitation()` that allows a user to check ONLY if an invite exists for their own authenticated email, without exposing other rows.
- **Hardened RPCs**: Ensure all `has_role`, `is_admin`, and `has_permission` functions are `SECURITY DEFINER` with `SET search_path = public`.

### 2. Auth Callback Logic (`AuthCallback.tsx`)
- **Preserve Admin Role**: Modify the flow to check for ANY existing staff roles before auto-assigning `patient`.
- **Invitation Sync**: Ensure that claiming an invitation correctly updates/sets the role without creating duplicates.
- **Order of Precedence**:
    1. Authenticate.
    2. Check existing roles (Preserve Admin/Doctor/Assistant).
    3. Verify and apply Invitation (if unclaimed).
    4. Bootstrap `INITIAL_ADMIN_EMAILS` (only if no roles exist).
    5. Default to `patient` (only if no roles exist).

### 3. Frontend Role Consistency
- **`useAuth.tsx`**: Update `loadRole` to handle multiple roles by prioritizing `admin` > `doctor` > `assistant` > `patient` for the `role` state variable.
- **Admin Users List**: Refactor the query in `AdminUsers.tsx` to correctly aggregate roles and display the highest privilege role.

## Technical Details
- **Tables**: `user_roles`, `admin_invites`, `role_permissions`.
- **Safety**: No `DROP` or `TRUNCATE`. Clinical data remains intact.

## Proposed SQL Migration
```sql
-- Correct roles for specified accounts
DELETE FROM public.user_roles 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'thebirdagencyma@gmail.com')
  AND role IN ('patient', 'assistant');

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'youness.skiri@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Secure Invitation RPC
CREATE OR REPLACE FUNCTION public.get_my_invitation()
RETURNS TABLE (id uuid, role public.app_role)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.role
  FROM public.admin_invites i
  WHERE i.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND i.claimed_at IS NULL;
END;
$$;

-- Harden admin_invites RLS
DROP POLICY IF EXISTS "Admins manage invites" ON public.admin_invites;
CREATE POLICY "Admins manage all invites" ON public.admin_invites
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users can see their own invite" ON public.admin_invites
  FOR SELECT TO authenticated USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
```
