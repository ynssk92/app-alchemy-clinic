# Plan: Extend Patient Profile with Appointments and Billing

Extend the `AdminPatientDetails.tsx` component to include two new tabs: **Rendez-vous** (Appointments) and **Facturation** (Billing). These sections will reuse existing logic and components to provide a complete view of the patient's interaction with the clinic.

## User Review Required

> [!IMPORTANT]
> - Should creating a new appointment from the patient profile open a dialog in place, or redirect to the existing "New Appointment" page with the patient pre-selected?
> - For billing, should we show a simplified "Create Invoice" button that automatically links to the current patient?

## Proposed Changes

### 1. `src/pages/admin/AdminPatientDetails.tsx`
- Add two new tab triggers: "Rendez-vous" and "Facturation".
- Implement `fetchAppointments` and `fetchInvoices` logic scoped to the current patient.
- **Rendez-vous Tab Content:**
    - List of appointments (Upcoming, Past, Cancelled).
    - Quick actions to edit status or delete.
    - "New Appointment" button (linking to `/admin/appointments/new?patientId=...`).
- **Facturation Tab Content:**
    - Financial summary card (Total Billed, Paid, Remaining Balance).
    - Table of invoices with status badges.
    - "New Invoice" button (linking to `/admin/billing/invoices/new?patientId=...`).

### 2. `src/pages/admin/AdminAppointmentNew.tsx` & `src/pages/admin/billing/CreateInvoice.tsx`
- Update these pages to read `patientId` from the URL query parameters to pre-fill the patient selection.

## Technical Details

- **Database Queries:** Use Supabase client to fetch `appointments` and `invoices` where `patient_id` matches the current profile.
- **Components:** Reuse `Card`, `Badge`, `Button`, and `Tabs` from the existing UI library.
- **State Management:** Add local states for `appointments`, `invoices`, and their respective loading/error states.
- **Status Mapping:** Reuse the existing `statusPill` helper in `AdminPatientDetails.tsx` for consistency.

## Workspace Impact
- No changes to database schema or RLS policies (reusing existing ones).
- Purely additive UI/UX improvement.
