# Plan: Patients List UI Redesign

Redesign the Patients List page (`src/pages/admin/AdminPatients.tsx`) to match a modern, premium clinic dashboard aesthetic without modifying backend logic or database structures.

## User Review Required

> [!IMPORTANT]
> - This is a UI/UX-only change.
> - The existing "View", "Edit", and "Delete" handlers will be preserved.
> - The registration status logic remains unchanged.

- **Visual Direction**: Clean Medical SaaS, minimal, elegant, professional healthcare management platform.
- **Header**: Updated hierarchy and a premium "Add New Patient" button.
- **Statistics**: New compact row showing Total, Registered, and Not Registered counts.
- **Toolbar**: Professional search and filter tabs.
- **List Layout**: Compact rows with avatars/initials, better typography, and refined status badges.
- **Interactions**: Subtle hover effects and responsive action buttons.

## Technical Details

- **File**: `src/pages/admin/AdminPatients.tsx`
- **Components used**: `Avatar` (from shadcn/ui), `Badge`, `Button`, `Card`, `Tooltip` (for icons).
- **Icons**: Lucide-react (`UserPlus`, `Users`, `UserCheck`, `UserMinus`, `Eye`, `Pencil`, `Trash2`, `Search`).
- **Logic**: No changes to `load()`, `remove()`, or `visibleRows` filtering logic.
- **Initials Helper**: A small utility function inside the component to extract initials from `full_name`.

## Constraints
- Do not change any backend functionality.
- Do not change database structure or queries.
- Do not change routing or API functions.
- Keep all existing actions exactly as they are.
