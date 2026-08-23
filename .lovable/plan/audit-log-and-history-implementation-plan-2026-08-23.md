# Audit Log and History Implementation Plan

This plan implements a comprehensive audit log system, fixes the sidebar translation/navigation, and ensures the history page displays real data with working filters.

## User Review Required

> [!IMPORTANT]
> - Audit logs will capture metadata about actions like user creation, role changes, and patient updates.
> - Normal users will not be able to view, modify, or delete these logs.

## Proposed Changes

### Database (Supabase)
- Create `public.audit_logs` table: `id`, `actor_id`, `actor_email`, `action`, `target_type`, `target_id`, `details` (JSONB), `created_at`.
- Enable RLS: `SELECT` for admins only, no `UPDATE` or `DELETE`.
- Create `SECURITY DEFINER` function `log_action()` to securely record events.
- Implement triggers on key tables: `profiles`, `patient_intake`, `appointments`, `user_roles`, `admin_invites`.
- Grant appropriate permissions to `authenticated` and `service_role`.

### Frontend
- **Sidebar Fix**:
  - Update `src/pages/admin/AdminLayout.tsx` to use the explicit label "Historique" for the history navigation item.
  - Ensure the sidebar order is preserved: Users, Reports, Messages, Historique.
- **History Page overhaul**:
  - Modify `src/pages/admin/AdminHistory.tsx` to fetch real data from `public.audit_logs`.
  - Implement functional filters for Search (by user/email), Action Type, and Date Period.
  - Redesign the list to show actor, action, target, and formatted details.
  - Update the empty state to correctly distinguish between "no results" and "no activity".

### Security
- Use `auth.uid()` for `actor_id` to prevent impersonation.
- Ensure the audit log is append-only for the system and read-only for admins.

## Technical Details
- **Schema**: `audit_logs` will use `JSONB` for `details` to store flexible metadata (e.g., old/new role names).
- **Triggers**: PostgreSQL triggers will handle most logging to ensure consistency even if actions are performed via different parts of the app.
- **I18n**: While fixing the sidebar label to "Historique", I will also ensure the `nav.history` translation key is correctly defined in `fr.json` for consistency.

## Verification Plan
- [ ] Check sidebar displays "Historique".
- [ ] Verify AdminHistory loads real database records.
- [ ] Trigger an action (e.g., create a patient) and verify it appears in the logs.
- [ ] Test Search, Action, and Date filters on the History page.
- [ ] Verify a non-admin user cannot access the History page or the `audit_logs` table.
