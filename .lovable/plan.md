# Plan: Premium Medical SaaS UI Redesign

Redesign the clinic application UI with a focus on the Patient Edit/Create forms to achieve a modern, premium medical SaaS interface. This is a frontend-only change preserving all backend logic.

## 1. Global Layout Adjustments
- Update `AdminLayout.tsx` to use a cleaner, soft neutral gray background for the main content area.

## 2. Redesign Patient Edit Dialog (`EditPatientDialog.tsx`)
- **Header**: Refine to include a medical icon, clear "Registered Patient File" title, and supporting subtitle.
- **Form Structure**:
    - Organize into 3 clear sections: **1. Patient Identity**, **2. Personal Information**, **3. Address**.
    - Add small section numbers and refined typography for titles.
    - Implement a responsive 2-column grid for desktop, 1-column for mobile.
- **Input Design**:
    - Set height to 44-48px.
    - Set border radius to 8-10px.
    - Use subtle neutral borders and white backgrounds.
    - Compact, scannable labels.
- **Footer**: Distinct white background with a subtle top border, primary "Save Changes" and ghost "Cancel" buttons.

## 3. Redesign Patient Creation Page (`AdminPatientCreate.tsx`)
- Apply the same sectioned layout, input styling, and premium medical aesthetic as the edit dialog.
- Ensure the header and card styling match the new visual direction.

## 4. Redesign Patient Details Edit Section (`PatientEditSection.tsx`)
- Update the inline edit form in the patient details view to match the sectioned, 2-column premium UI.

## 5. Visual Identity & Tokens
- **Colors**: Use deep navy (`#1e293b`) for primary buttons/headers and refined blue (`#3b82f6`) for accents/focus.
- **Shadows**: Use very subtle, soft shadows (`shadow-sm` or custom soft shadows).
- **Typography**: Modern sans-serif (Inter/Geist) with clear hierarchy.

## 6. Verification
- Verify that all forms still function correctly (fetching/saving data).
- Ensure responsiveness across mobile, tablet, and desktop.
- Confirm that no backend logic or database schema was touched.
