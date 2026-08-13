# Multilingual System Implementation Plan

This plan implements a professional i18n architecture with English, French, and Arabic (RTL) support. It features a global language switcher, RTL layout mirroring, and a central translation management interface for administrators.

## Technical Details

- **i18n Engine**: `react-i18next` with `i18next` and `i18next-browser-languagedetector`.
- **RTL Implementation**: Dynamic `dir="rtl"` on `<html>` with Tailwind `rtl:` utilities and logical properties.
- **CMS Integration**: Extend `site_pages` to support multilingual JSON content blocks.
- **Translation Management**: New Admin interface for editing static keys and managing auto-translation.
- **Auto-Translation**: Securely proxy DeepL API through an Edge Function.

## Implementation Steps

### 1. Foundation & Global Configuration
- [x] Create directory structure: `src/i18n/locales/{en,fr,ar}`.
- [x] Configure `i18next` in `src/i18n/index.ts` with RTL detection.
- [x] Initialize i18n in `src/main.tsx`.
- [x] Implement premium `LanguageToggle.tsx` component.

### 2. Frontend Modernization (i18n keys)
- [ ] Migrate `SiteHeader.tsx`, `Sidebar.tsx`, and `AdminLayout.tsx` to use translation keys.
- [ ] Implement `rtl:` specific styling for the Sidebar and global layout components.
- [ ] Migrate `AdminOverview.tsx` (Dashboard) and its KPI/Widget cards to i18n.
- [ ] Add translation keys for common UI elements (Buttons, Toasts, Empty States).

### 3. CMS & Dynamic Content Translation
- [ ] Update `usePageContent` hook to fetch language-specific content based on current i18n state.
- [ ] Modify `AdminLandingPage.tsx` to support editing different language versions of hero and sections.
- [ ] Implement local caching for translations to minimize redundant DB/API calls.

### 4. Admin Translation Management
- [ ] Create `src/pages/admin/AdminTranslationManager.tsx`.
- [ ] Build a searchable grid for viewing and editing translation keys.
- [ ] Integrate "Auto-Translate" button using the `translate-batch` Edge Function.
- [ ] Add translation progress indicators (percentage complete per language).

### 5. RTL Polish & Verification
- [ ] Audit all absolute/fixed positioning in CSS to use logical counterparts or RTL overrides.
- [ ] Ensure icons with directionality (arrows, chevron) are mirrored in RTL mode.
- [ ] Verify form alignment and table column ordering in Arabic.

### 6. Safety & Finalization
- [ ] Confirm zero breaking changes to existing booking, billing, or patient logic.
- [ ] Verify DeepL API key security (no exposure in client code).
- [ ] Add fallback mechanism to English for any missing translations.
