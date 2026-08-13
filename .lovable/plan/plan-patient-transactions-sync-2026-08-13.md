# Plan: Patient Transactions Sync

Implement a Transactions tab within the Patient Profile to display all associated invoices and financial records, reusing the existing database schema and relationships.

## Proposed Changes

### Database & RLS
- Verify `invoices` table RLS policies to ensure `authenticated` users (Admin/Staff) and the `patient` themselves (via `patient_id = auth.uid()`) can read their own invoices. *Note: Existing policy "Billing staff view payments" suggests a similar pattern for invoices.*
- Ensure `invoice_items` and `payments` are readable for authorized users associated with the patient ID.

### Frontend: Patient Profile
- Modify `src/pages/admin/AdminPatientDetails.tsx`:
    - Fetch invoices associated with the current patient (`patient.profileId`).
    - Implement a clean, responsive table in the "Transactions" tab showing:
        - Invoice Number
        - Date (`issue_date`)
        - Status
        - Total Amount
        - Paid Amount
        - Remaining Balance (`due`)
    - Add a "View Invoice" action linking to the existing invoice viewer (`/admin/billing/invoices/:id`).
    - Include sub-details if available (e.g., Doctors or Appointments referenced in the invoice).
    - Implement a "Loading" state and error handling ("Unable to load transactions").

### Verification
- Create a test patient and an invoice for them.
- Verify the invoice appears automatically in the patient's profile.
- Verify that "Paid" and "Remaining" balances update correctly when payments are recorded.

## Technical Details
- Query `invoices` table filtering by `patient_id`.
- Join with `doctors` (optional, for UI) or fetch them as part of the query.
- Use the existing `formatMoney` utility for currency display.
- No new tables or columns will be created; only existing data will be read.
