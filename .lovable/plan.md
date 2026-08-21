# Plan - Patient Module Upgrade & Medical CRM Implementation

Extend the existing clinic application by upgrading the patient module into a central medical record system. This implementation follows a non-destructive approach, reusing existing database structures and additive schema changes where necessary.

## Database Extensions (Additive)

Create a migration to add missing fields to `patient_intake` and `profiles` to support the expanded patient file.

- **patient_intake**:
  - `patient_type`: enum ('adult', 'minor')
  - `languages`: text[]
  - `profession`: text
  - `family_situation`: text
  - `emergency_contact_name`: text
  - `emergency_contact_phone`: text
  - `emergency_contact_relation`: text
  - `insurance_name`: text
  - `insurance_number`: text
  - `insurance_policy`: text
  - `insurance_status`: text
  - `insurance_notes`: text
  - `birth_type`: text (pediatric)
  - `birth_weight`: numeric (pediatric)
  - `birth_height`: numeric (pediatric)
  - `apgar_score`: text (pediatric)
  - `breastfeeding`: text (pediatric)
  - `birth_complications`: text (pediatric)
  - `psychomotor_development`: text (pediatric)
  - `development_notes`: text (pediatric)
  - `rhesus`: text
  - `allergies`: text
  - `chronic_diseases`: text
  - `current_medications`: text
  - `medical_history`: text
  - `family_history`: text
  - `surgical_history`: text
  - `previous_hospitalizations`: text

- **profiles**: Sync relevant administrative fields (nationality, doc type/number already added in previous turns).

## UI & Component Upgrades

### 1. Patient Details Redesign (`AdminPatientDetails.tsx`)
- **Patient Header**: Professional medical header displaying photo/initials, full name, age (computed), gender, DOB, Patient ID, CIN/Passport, Phone, and Medical Alerts (Allergies/Chronic diseases).
- **Patient Navigation**: Tabs for Overview, Info, Medical File, Consultations, Prescriptions, Lab Results (Analyses), Documents, Hospitalizations, Medical Statements, Notes, History.
- **Overview Dashboard**: A "at-a-glance" view with general info, medical summaries (allergies, medications), and recent activity (consultations, prescriptions).
- **Quick Actions**: "New Consultation", "New Prescription", etc., pre-filling the `patient_id`.

### 2. Patient Form Overhaul (`EditPatientDialog.tsx` & `AdminPatientCreate.tsx`)
- Reorganize into 5 logical sections:
  1. General Information (Identity, Photo, Languages)
  2. Insurance & Coverage
  3. Personal Information (Address, Profession, Emergency Contact)
  4. Pediatric Information (Conditional visibility)
  5. Medical Information (Blood Group, Allergies, History)

### 3. Patient Routing & Context
- Ensure all medical sub-modules (Prescriptions, Consultations) respect the `:patientId` context when navigated from a profile.

## Technical Details
- Use `date-fns` for age calculations.
- Implement skeleton loading states using `Shadcn Skeleton`.
- Maintain existing RLS and data relationships.
- Ensure responsive layouts (Two-column desktop, one-column mobile).

## Safety Check
- No `DROP TABLE` or `RENAME COLUMN`.
- Nullable fields by default to prevent breaking existing records.
- Reuse `supabase` client and existing auth logic.
