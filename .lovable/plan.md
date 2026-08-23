# Plan - Fix Role Verification Tool Security and Redesign

I will secure the Role Verification Tool by implementing strict admin-only access, preventing self-role escalation, and redesigning the UI to manage selected users instead of the current user.

## Proposed Security Changes (Database/RLS)

1. **Prevent Self-Role Escalation via RLS**:
   Modify `public.user_roles` RLS to:
   - Deny `INSERT`, `UPDATE`, or `DELETE` if `user_id = auth.uid()`.
   - Only allow these operations if the requester has the `admin` role.
   - Ensure at least one admin remains (last-admin protection).

2. **Create Secure RPC for Role Management**:
   Implement a `manage_user_role` function with `SECURITY DEFINER` that:
   - Verifies the requester is an `admin`.
   - Verifies the requester is not the target user.
   - Validates the requested role.
   - Safely updates the target user's role.

## User Review Required

> [!IMPORTANT]
> To prevent self-role escalation, the database will now reject any attempt by a user to change their own role, even for administrators. Role changes must be performed by a *different* administrator. Does this meet your requirements for "Self-Modification Protection"?

## Technical Details

### Backend
- **SQL Migration**:
  - Revoke direct `INSERT/UPDATE/DELETE` on `user_roles` for most users.
  - Add RLS policy: `CREATE POLICY "Admins can manage other users' roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') AND user_id != auth.uid())`.
  - Add `manage_user_role(target_user_id uuid, new_role app_role)` function.
  - Implement last-admin check within the RPC or a trigger.

### Frontend
- **RoleVerification.tsx**:
  - Add user search/selection interface.
  - Update `fetchRole` and `switchRole` to operate on a selected user.
  - Implement confirmation dialog with user/role details.
  - Fetch and display permissions for the selected user's role (read-only).
  - Use the new RPC instead of direct `supabase.from('user_roles')` calls.
- **AdminLayout.tsx & App.tsx**:
  - Ensure visibility and routing are restricted to `adminOnly`.
- **HeroSection.tsx**:
  - Update badge text as requested.

## Verification Plan

### Automated Tests
- **tests/role-security.spec.ts**:
  - Patient cannot access `/admin/verify-role`.
  - Patient cannot call role management RPC.
  - Doctor cannot access tool or switch own role.
  - Admin can access tool and switch another user's role.
  - Admin cannot switch their own role.

### Manual Verification
- Log in as admin, try to change a patient's role.
- Log in as patient, try to access `/admin/verify-role`.
- Verify the confirmation dialog appears before any changes.
