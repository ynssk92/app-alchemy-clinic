# Medical Record System Implementation Plan

We will implement a comprehensive medical record system for the clinic, focusing on storing and managing detailed patient health history while reusing existing data structures where possible.

## User Review Required

> [!IMPORTANT]
> - Should I proceed with creating these tables now, or would you like to review the specific database schema first?
> - All new records will be linked to the current patient context automatically.

## Proposed Changes

### Database Schema (Supabase)

I will add the following tables to store specialized medical data, all linked via `patient_id` (referencing either `profiles.id` or `patient_intake.id` depending on current app patterns):

- `patient_medical_history_v2`: Detailed conditions, diagnosis dates, and status.
- `patient_family_history`: Family member associations and conditions.
- `patient_allergies_v2`: Specific reactions, severity, and identification dates.
- `patient_chronic_diseases`: Long-term illness tracking.
- `patient_medications_v2`: Precise dosage, frequency, route, and prescribing doctor.
- `patient_surgeries`: Hospital records and reasons for procedures.
- `patient_hospitalizations_v2`: Admission/discharge dates and treatments.
- `patient_vaccinations`: Vaccine types, doses, and dates.

### UI Improvements (Admin Dashboard)

- **Patient Overview Integration**: Update the patient details page to show summaries of allergies, chronic diseases, and medications.
- **Medical Dashboard**: A new, clean interface within the patient profile using the existing premium design system (cards, badges, professional tables).
- **Quick Actions**: "Add Record" buttons that automatically inherit the current patient's identity.

## Technical Details

- **RLS Policies**: Ensure all new tables have Row-Level Security enabled, granting access to authenticated `admin`, `doctor`, and `assistant` roles.
- **Data Integrity**: Use triggers or application logic to prevent overwriting historical records.
- **Context Management**: Use React context or URL parameters to ensure the correct `patient_id` is always used without re-selection.

## Verification Plan

- [ ] Verify database migrations apply correctly without touching existing patient data.
- [ ] Test CRUD operations for each new medical section.
- [ ] Ensure patient relationships are preserved through session changes (refresh, logout/login).
- [ ] Validate that all records persist in the Supabase backend and not just local storage.
