# Plan - Premium Patient List Redesign

Redesign the Patient List in the Admin Panel (`src/pages/admin/AdminPatients.tsx`) to provide a modern, clean, and premium medical-clinic dashboard experience. This is a UI-only change that preserves all existing backend logic and functionality.

## Proposed Changes

### 1. Header & Stats Refinement
- Improve the layout of the page title and the "Add New Patient" button.
- Refine the three KPI cards (Total, Registered, Not Registered) with better spacing, iconography, and subtle shadows to match a premium clinic aesthetic.

### 2. Toolbar & Search Redesign
- Upgrade the search bar: larger, cleaner, with a clearer search icon and refined placeholder.
- Visually separate the search and filter toolbar from the results area.
- Style the tabs (All, Registered, Not Registered) to look more professional with better hover and active states.

### 3. Patient List (Desktop & Mobile)
- **Desktop**: Transform the current list into a clean, spacious table-like list layout.
- **Patient Items**: 
    - Larger avatars with initials fallback.
    - Stronger typography for patient names.
    - Clear secondary info (phone, email, date) using the existing data.
    - Subtle borders, rounded corners, and generous padding for each row.
    - Enhanced hover animations and selected states.
- **Mobile**: Ensure responsive behavior where rows transition into clean patient cards without losing accessibility or search functionality.

### 4. States & Feedback
- Redesign the empty state, loading placeholders, and no-results view to be more visually engaging while maintaining the existing clinic design language (royal blue palette).

## Technical Details
- **File**: `src/pages/admin/AdminPatients.tsx`
- **Design Tokens**: Use deep royal blue palette, smooth gradients, and card-based layout as defined in `mem://style/visual-identity`.
- **Backend Integrity**: No changes to Supabase queries, hooks, RLS, or data structures. The existing `Row` type and data-fetching `load` function remain untouched.

## Verification Plan
- **Visual Check**: Preview the Patients page to ensure the new layout uses the full width and looks professional.
- **Functionality Check**: Verify that search, filtering, viewing patient details, editing, and deleting still work as expected.
- **Responsiveness**: Test on mobile and desktop viewports.
