# Plan: Admin Translation Management System

Implement a comprehensive translation management interface within the admin panel to allow staff to manage multilingual content without modifying source code directly.

## User Interface

- **Search & Filter**: Search keys and values across all languages.
- **Language Tabs**: Switch between EN, FR, and AR views.
- **Inline Editing**: Edit translation values directly in the list.
- **Reset Functionality**: Revert specific keys to their original JSON-defined values.
- **Missing Keys Detection**: Highlight keys that are missing translations in specific languages.

## Technical Details

- **Storage**: While the base translations live in JSON files, overrides will be stored in a new `public.translation_overrides` table in the database.
- **State Management**: A custom hook `useTranslations` will merge base JSON files with database overrides at runtime.
- **Admin Page**: New route at `/admin/languages` using the `AdminLayout`.
- **Backend Safety**:
    - `CREATE TABLE public.translation_overrides (id uuid, lang text, key text, value text, primary key (lang, key))`
    - RLS policies to restrict editing to `admin` role.
    - Grants to `authenticated` and `service_role`.

## Implementation Steps

1. **Database Migration**: Create the `translation_overrides` table with RLS and Grants.
2. **Translation Service**: Create a utility to load/save overrides from Supabase.
3. **Admin Page**: Build `src/pages/admin/AdminLanguages.tsx` with search, filtering, and editing capabilities.
4. **Integration**: Register the new route in `App.tsx` and add a sidebar link in `AdminLayout.tsx`.
5. **Dynamic Loading**: Update `i18n/index.ts` to fetch overrides on initialization.
