# Patient Module Upgrade & Medical CRM Implementation

Extend the existing clinic application into a professional Medical CRM by adding comprehensive identity, insurance, and medical data fields to the patient records while maintaining a premium SaaS interface.

## User Review Required

> [!IMPORTANT]
> - New medical fields will be added to both `profiles` and `patient_intake` tables.
> - The patient details view will be reorganized into sections: General, Insurance, Medical, and Pediatrics.
> - Existing patient data is preserved; new fields default to null/empty.

## Technical Details

### 1. Database Schema Extension
- **Tables**: `profiles`, `patient_intake`
- **New Fields**:
  - **Identity**: `patient_type` (adult/minor), `languages`, `profession`, `family_situation`.
  - **Emergency**: `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`.
  - **Insurance**: `insurance_name`, `insurance_number`, `insurance_policy`, `insurance_status`, `insurance_notes`.
  - **Medical**: `allergies`, `chronic_diseases`, `current_medications`, `medical_history`, `family_history`, `surgical_history`, `previous_hospitalizations`, `rhesus`.
  - **Pediatrics**: `birth_type`, `birth_weight`, `birth_height`, `apgar_score`, `breastfeeding`, `birth_complications`, `psychomotor_development`, `development_notes`.

### 2. Frontend Redesign
- **Patient Details (`AdminPatientDetails.tsx`)**:
  - New "Medical Profile" tab system.
  - Quick-view header with age, gender, blood group, and emergency contact.
  - Responsive layout for desktop (2-column) and mobile (1-column).
- **Patient Form (`EditPatientDialog.tsx` & `AdminPatientCreate.tsx`)**:
  - Reorganized into 5 clear sections.
  - Conditional rendering for Pediatric section based on `patient_type`.
  - Standardized premium input styling (46px height, slate-900 accents).

### 3. Logic & Sync
- Ensure data parity between `patient_intake` (guest records) and `profiles` (registered users).
- Use `date-fns` for accurate age calculation from DOB.
- Maintain existing RLS policies and admin permissions.
