# Fix Doctor Profile Photo Display in Patient Dashboard

This plan addresses the issue where doctor profile photos are not displayed in the "Your Appointments" section of the patient dashboard, even though they are uploaded and visible in the admin section.

## User Review Required

> [!NOTE]
> This is a safe, targeted frontend fix. No database schema changes or migrations will be performed.

## Proposed Changes

### Patient Dashboard

- **Data Fetching**: Update the Supabase query in `src/pages/PatientDashboard.tsx` to include the `avatar_url` field from the `doctors` table.
- **UI Component**: Modify the appointment card in the "Your Appointments" section to use a profile photo if available.
- **Fallback Logic**: Implement a graceful fallback to the existing initials-based avatar if the `avatar_url` is missing or invalid.
- **Styling**: Ensure the photo is displayed correctly within the existing avatar container using `object-fit: cover`.

## Technical Details

- **File**: `src/pages/PatientDashboard.tsx`
- **Query Modification**: Change `.select("id, appointment_date, appointment_time, status, doctors(full_name, specialties(name))")` to `.select("id, appointment_date, appointment_time, status, doctors(full_name, avatar_url, specialties(name))")`.
- **Type Definition**: Update the `Appt` type to include `avatar_url: string | null` in the `doctors` object.
- **Component Update**: Replace the existing initials-based `<span>` or incorporate it into a conditional rendering logic using the `avatar_url`.

## Verification Plan

### Automated Tests
- N/A (Manual verification is more suitable for this visual fix).

### Manual Verification
1. Log in as an administrator.
2. Upload a profile photo for a doctor.
3. Ensure an appointment exists for that doctor and a patient.
4. Log in as the patient.
5. Navigate to the dashboard.
6. Verify that the doctor's profile photo is visible in the "Your Appointments" card.
7. Verify that doctors without photos still show their initials.
