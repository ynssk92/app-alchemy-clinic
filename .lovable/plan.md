# Plan: Harden Role and Permission System

Enhance the security architecture by implementing fine-grained permissions, server-side enforcement (RLS), and patient data isolation.

## Technical Details

### 1. Database Schema & Authorization (Additive)
- **Permissions Architecture**: Implement a strictly role-based permission system. Permissions are mapped to roles in `public.role_permissions`. Users inherit permissions exclusively from their assigned roles in `public.user_roles`.
- **No Per-User Overrides**: Do not create any user-specific permission tables or overrides.
- **Enhanced `public.has_permission(_permission text)`**: A `SECURITY DEFINER` function to check if the current user's role (via `user_roles`) has the required permission mapped in `role_permissions`.
- **RLS Policies**: Update RLS on clinical and billing tables:
  - **Staff**: Access granted via `has_permission()` based on their role.
  - **Patients**: Strict ownership-based access (`uid = auth.uid()`).
  - **Admins**: Full access bypass/override via role check.

### 2. Staff & Patient Isolation
- **Patients**: RLS will strictly limit patients to `uid = auth.uid()` for all tables.
- **Staff**: RLS will grant access based on `has_permission()` checks.

### 3. Frontend Integration
- **`useAuth` Hook**: Update to fetch and expose `permissions` for the current user.
- **Navigation**: Update sidebar and dashboard to hide modules where the user lacks `.view` permissions.
- **Protected Routes**: Enhance `ProtectedRoute` to optionally check for specific permissions.

### 4. Privilege Escalation Protection
- **`user_roles` RLS**: Only allow admins to modify roles.
- **Self-Modification**: Add RLS or triggers to prevent users from modifying their own roles.
- **Last Admin Protection**: Reuse/harden the existing trigger that prevents deleting the last administrator.

## Implementation Steps

### Database Migrations
1. Add `permissions` metadata and the `has_permission` function.
2. Populate `role_permissions` with default mappings for `doctor` and `assistant`.
3. Harden RLS policies across all clinical and billing tables.

### Frontend Updates
1. Modify `src/hooks/useAuth.tsx` to include permission state.
2. Update `src/components/ProtectedRoute.tsx` for permission-based blocking.
3. Update `src/pages/admin/AdminLayout.tsx` for dynamic sidebar items.
4. Update `src/pages/admin/RoleVerification.tsx` to reflect new permission logic.
5. Revert `src/components/HeroSection.tsx` badge to "CLINIQUE LA DUNE DENTAIRE".
