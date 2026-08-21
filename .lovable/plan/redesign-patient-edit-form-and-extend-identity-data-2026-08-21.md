# Redesign Patient Edit Form and Extend Identity Data

Redesign the patient form UI to be premium, sectioned, and two-column, while safely adding identity document fields to the backend.

## Technical Details

### 1. Database Schema Update
- Add nullable columns to `patient_intake`: `nationality` (if missing), `identity_document_type`, `identity_document_number`.
- Add nullable columns to `profiles`: `identity_document_type`, `identity_document_number` (it already has `nationality`).
- Ensure all new columns are additive and safe (no destructive changes).

### 2. Form UI Redesign (`EditPatientDialog.tsx` & `AdminPatientCreate.tsx`)
- **Sections**:
    1. **Patient Identity**: Full name, Email, Phone, Nationality, Document Type, Document Number.
    2. **Personal Information**: DOB, Gender, Blood Group.
    3. **Address**: Address, City, Country.
- **Layout**: Two-column grid on desktop, single-column on mobile.
- **Aesthetic**: Premium medical UI with white cards, subtle borders, and generous spacing.
- **Validation**: Keep existing required fields (Full name, etc.) and validation logic.

### 3. Data Flow
- Ensure `identity_document_type` and `identity_document_number` are saved to `patient_intake` and synced to `profiles` where applicable.
- Preserve all existing patient relationships and history.

## User Review Required

> [!IMPORTANT]
> - Do you have a specific list of nationalities you'd like to prioritize in the dropdown, or should it be a free-text input?
> - For the "Patient Photo", the current application does not seem to have a dedicated storage bucket for patient photos in the default schema. I will omit this for now as requested to avoid breaking the workflow unless I find an existing one.
