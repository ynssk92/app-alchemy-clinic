# Dental Clinic Services Management Module Plan

I will implement a professional Services Management module, reusing the existing `services` and `service_categories` tables. The module will include a clean list view, search/filter capabilities, and a detailed creation/editing interface, all restricted to admin users and scoped to the clinic.

## User Review Required

> [!IMPORTANT]
> - I will use the existing `services` and `service_categories` tables found in the database.
> - Currency will be set to MAD (Moroccan Dirham) as requested, unless a global currency setting is found.
> - Default dental categories will be seeded into `service_categories` if it is empty.

## Proposed Changes

### Database & Security
- Ensure RLS policies on `services` and `service_categories` allow admins to manage their clinic's records.
- Grant necessary permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) to the `authenticated` role (scoped by RLS).

### Services Management Page
- Create `src/pages/admin/AdminServices.tsx`:
    - Responsive table/card layout for listing services.
    - Search by name, code, or category.
    - Filters for Category and Status (Active/Inactive).
    - Sorting by Name, Price, and Duration.
    - Summary metrics (Total, Active).

### Service Editor
- Create `src/components/admin/ServiceDialog.tsx`:
    - Form to Create/Edit services.
    - Fields: Name, Category (dropdown from `service_categories`), Code, Description, Duration (minutes), Price (MAD), and Status.
    - Validation for required fields.

### Integration
- Add "Services" to the Admin sidebar navigation.
- Ensure only active services appear in appointment/billing selectors (if those modules are updated).

## Technical Details
- **Tables used**: `public.services`, `public.service_categories`.
- **State Management**: React State for filters/sorting, TanStack Query (or existing patterns) for data fetching.
- **UI Components**: Shadcn UI (Table, Dialog, Form, Input, Select, Badge) with Framer Motion for smooth transitions.
- **Security**: RLS enforces `clinic_id` isolation.
