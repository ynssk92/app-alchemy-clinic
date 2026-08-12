# Plan: Enable Admin Patient Management

Allow administrators to view and edit all patient information on the Patient Details page while maintaining strict security and data integrity.

## User Review Required

> [!IMPORTANT]
> - This update assumes administrators should have full control over all fields in the `patient_intake` and `profiles` tables.
> - "Vital Signs" will remain read-only for now as the current database schema does not have a dedicated table for them.

## Proposed Changes

### Database & Security
- Add an RLS policy to the `profiles` table allowing `authenticated` users with the `admin` role to `UPDATE` any record.
- Verify the existing `admin` role can already `UPDATE` `patient_intake` records based on existing policies.

### Admin UI (Patient Details Page)
- Enhance `src/pages/admin/AdminPatientDetails.tsx` to include an "Edit Mode" toggled by a new "Edit Patient" button in the header.
- Transform the "Registration Status" and "About" cards into interactive forms when in Edit Mode.
- Implement proper form controls:
  - Date picker for Date of Birth.
  - Dropdowns for Gender and Blood Group.
  - Validated text inputs for Name, Phone, Email, Address, and City.
- Add "Save Changes" and "Cancel" buttons that persist updates to both `profiles` and `patient_intake` tables.
- Display real-time feedback with loading states and success/error notifications.

### Data Integrity
- Ensure only modified fields are updated.
- Preserve all existing relationships (appointments, transactions, doctors).
- Maintain immutable identifiers (IDs, UUIDs).

## Technical Details

- **RLS Policy**:
  ```sql
  CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
  ```
- **Form State**: Manage in-page edit state using React `useState` to avoid navigation and preserve context.
- **API Integration**: Use Supabase JS client for targeted `UPDATE` operations on `profiles` and `patient_intake` tables.
