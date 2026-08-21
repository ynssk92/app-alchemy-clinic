# Implementation Plan - Sync Home Page with CMS & Grant Admin Permissions

The goal is to ensure the Homepage content is fully dynamic, driven by the Website CMS (site_pages and page_blocks), and that admins can edit all content via a unified interface.

## User Review Required

> [!IMPORTANT]
> The current "Landing Page CMS" and "Pages" admin views are separate. I will unify them to make all sections editable from one place, ensuring a better experience for managing the entire homepage.

- Do you prefer all homepage sections (Trust, Expertise, Why Choose Us, etc.) to be editable directly in the **Landing Page CMS** tab, or are you comfortable with it linking to the **Pages** editor as it currently does for some blocks? (I recommend unifying them for better "sync").

## Proposed Changes

### 1. Unified Admin CMS (`src/pages/admin/AdminLandingPage.tsx`)
- Enhance the Landing Page editor to handle all homepage blocks directly.
- Add tabs or sections for:
    - **Hero Section** (Existing)
    - **Trust Section** (Currently in /admin/pages)
    - **Expertise** (Currently in /admin/pages)
    - **Why Us** (Currently in /admin/pages)
    - **Experience** (Currently in /admin/pages)
    - **SEO** (Existing)
- This ensures "Admin can change and edit all contents" from a single intuitive view.

### 2. Full Homepage CMS Sync (`src/pages/Index.tsx`)
- Ensure all sections on the live homepage strictly use the `blocks` returned by `usePageContent('home')`.
- Remove any hardcoded fallbacks that don't match the CMS structure.
- Map the "Our Dental Care" (ServiceTabs/ServiceCard) section to CMS blocks if not already fully dynamic.

### 3. Permissions & Access Control
- Verify that `AdminLayout.tsx` and `usePermissions.tsx` allow admins full access to these CMS routes.
- The sidebar already has "Website CMS" and "Landing Page" visible to admins; I will ensure all sub-sections are correctly authorized.

## Technical Details

- **Database**: Uses `public.site_pages` (for SEO and Hero config) and `public.page_blocks` (for all other sections).
- **Frontend**: The `usePageContent` hook already fetches this data; I will ensure the mapping in `Index.tsx` covers every visible element.
- **Admin**: I will refactor `AdminLandingPage.tsx` to include the block editing logic currently found in `AdminPages.tsx`, but specialized for the homepage layout.

---
*I will proceed with the implementation once you approve this plan.*
