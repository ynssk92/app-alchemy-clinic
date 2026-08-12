# Landing Page CMS Implementation Plan

Create a safe, incremental CMS for the landing page while reusing existing infrastructure and ensuring no backend disruption.

## User Review Required

> [!IMPORTANT]
> This plan uses existing tables (`site_pages`, `page_blocks`, `faqs`, `gallery_images`, `testimonials`) to avoid database duplication. New tables will only be added if strictly necessary for the "Draft/Publish" workflow.

- **Authentication**: Reuse existing admin role check.
- **Media**: Reuse existing `branding` bucket and Media Library.
- **Draft System**: Implement a `status` column in `page_blocks` (or similar) to handle Draft/Published states without duplicating tables.

## Technical Details

### 1. Database & Security
- Add `status` (enum: draft, published) and `published_at` columns to `page_blocks`, `faqs`, `testimonials`, `gallery_images`.
- Add `hero_config` JSONB column to `site_pages` (slug='home') for specialized Hero fields (video, CTAs, floating cards).
- Update RLS policies: Public users can only read where `status = 'published'`. Admins can read all.

### 2. Admin Interface
- **New Section**: Add "Landing Page" to `AdminLayout.tsx` under a new "CONTENT & WEBSITE" group.
- **CMS Page**: Create `src/pages/admin/AdminLandingPage.tsx` with tabs for each section (Hero, Services, Why Us, etc.).
- **Hero Editor**: Specialized UI for video/image background, headings, and CTAs.
- **Section Visibility**: Toggle `published` state for each block/section.

### 3. Frontend Integration
- Update `usePageContent` hook to fetch both `published` and `draft` content based on a `preview` flag.
- Refactor `HeroSection.tsx` to accept dynamic data from `usePageContent`.
- Refactor `Index.tsx` to conditionally render sections based on CMS toggles.

### 4. Workflow
- **Preview**: Open the home page with a `?preview=true` query param (only for admins).
- **Publish**: Bulk update `status` from 'draft' to 'published' for the modified section.

## Retro-compatibility
- All existing logic for Appointments, Billing, and Doctors remains untouched.
- Default values will be used if CMS content is empty to prevent UI crashes.
