# Digital Medical Archive Implementation Plan

Extend the clinic application with a permanent digital medical archive, integrated into the existing patient profile system.

## Database Schema (additive only)

- **patient_documents** (extend/verify): id, patient_id, document_name, category, document_type, file_path, metadata (JSONB), created_at, updated_at.
- **prescriptions**: id, patient_id, doctor_id, consultation_id, notes, created_at, updated_at.
- **prescription_items**: id, prescription_id, medication_name, dosage, frequency, duration, route, instructions, notes.
- **patient_timeline**: id, patient_id, event_type, event_title, event_description, metadata (JSONB), created_at.

## Components & Pages

1. **Medical Archive Section** (`src/components/admin/MedicalArchive.tsx`):
   - Integrated into `AdminPatientDetails.tsx` as a new tab.
   - Grid/Table view of documents.
   - Search, Filter by category, Sort.
   - Document Preview (PDF/Images).

2. **Document Upload/Scan Dialog** (`src/components/admin/UploadDocumentDialog.tsx`):
   - Multi-page upload support.
   - Camera capture fallback for "Scan".
   - Category selection (Ordonnance, Scanner, RIM, etc.).
   - Metadata input (Date, Description).

3. **Prescription Management** (`src/components/admin/PrescriptionList.tsx` & `AddPrescriptionDialog.tsx`):
   - History of prescriptions.
   - Form to add new prescriptions with multiple medications.
   - Printable PDF generation (reusing existing system).

4. **Timeline Integration**:
   - Update `AdminPatientDetails` to show document and prescription events.

## Technical Details

- **Storage**: Use `patient_documents` bucket.
- **Security**: Strict RLS policies on new tables.
- **Permissions**: Respect existing admin/doctor/assistant roles.
- **Localization**: Support i18n for new UI elements.

---
**CRITICAL**: NO DATABASE RESET. ALL CHANGES ARE ADDITIVE.
