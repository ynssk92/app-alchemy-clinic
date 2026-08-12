# Dental Clinic Services Management Module Plan

I will implement a professional Services Management module. I found that an existing `src/pages/admin/billing/Services.tsx` already exists, so I will redesign and enhance it to meet the new requirements while preserving existing functionality. I will reuse the existing `services` and `service_categories` tables.

## User Review Required

> [!IMPORTANT]
> - I will enhance the existing `src/pages/admin/billing/Services.tsx` to match the requested premium design and functionality.
> - I will use the existing `services` and `service_categories` tables found in the database.
> - Currency will be set to MAD (Moroccan Dirham) as requested.
> - Default dental categories will be seeded into `service_categories` if it is empty.

## Proposed Changes

### Database & Security
- Ensure RLS policies on `services` and `service_categories` allow admins to manage their clinic's records.
- Grant necessary permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) to the `authenticated` role (scoped by RLS).

### Services Management Page Enhancement
- Redesign `src/pages/admin/billing/Services.tsx`:
    - Premium medical SaaS UI with excellent spacing and rounded cards.
    - Responsive table/card layout for listing services.
    - Search by name, code, or category.
    - Filters for Category and Status (Active/Inactive).
    - Sorting by Name, Price, Category, and Duration.
    - Export functionality if needed.

### Service Editor
- Create/Enhance a Service Dialog component:
    - Form to Create/Edit services.
    - Fields: Name, Category (dropdown from `service_categories`), Code, Description, Duration (minutes), Price (MAD), Tax, and Status.
    - Validation for required fields.

### Integration
- Verify "Services" is correctly linked in the Admin sidebar.
- Ensure only active services appear in appointment/billing selectors.
- Implement "Soft Delete" (Deactivate) for services used in historical records.

## Technical Details
- **Tables used**: `public.services`, `public.service_categories`.
- **UI Components**: Shadcn UI (Table, Dialog, Form, Input, Select, Badge) with Framer Motion.
- **Security**: RLS enforces `clinic_id` isolation.
