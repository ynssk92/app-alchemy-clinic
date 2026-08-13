# Plan for Complete Multilingual System Implementation

This plan methodically addresses all hardcoded UI strings across the application, integrating them into the existing `i18next` framework with support for English, French, and Arabic.

## 1. Locale Infrastructure Expansion
- Update `src/i18n/locales/en/common.json`, `fr/common.json`, and `ar/common.json` to include comprehensive keys for:
    - **General**: Form labels (name, email, phone, DOB, address), buttons (Save, Cancel, Delete, Edit, Book), status indicators (Registered, Pending, Completed).
    - **Dashboard**: KPI labels, chart titles/descriptions, schedule headers, empty states.
    - **Clinic Management**: Specialties, Doctor profile fields (Experience, Clinic, Languages), Schedule/Holiday management.
    - **Patient Management**: Detail tiles (Vital Signs, Account Status), filter tabs, list headers.
    - **Booking Flow**: Step labels, summary headers, confirmation messages, "Next Steps" instructions.
    - **Public Pages**: Hero headings, trust items, expertise categories, blog editorial text, FAQ categories.

## 2. Admin Interface Localization
- **`AdminLayout.tsx`**: Localize sidebar group titles, search placeholder, and quick action menu items.
- **`AdminOverview.tsx`**: Replace hardcoded labels in KPI cards, Recharts titles, and recent activity lists.
- **`AdminPatients.tsx` & `AdminPatientDetails.tsx`**: Localize the entire patient record view, including status pills and data grid headers.
- **`AdminDoctors.tsx` & `DoctorScheduleDialog.tsx`**: Update the card grid and the complex schedule/holiday management modals.
- **`AdminLanguages.tsx`**: Ensure the translation management interface itself is fully translatable.

## 3. Patient Dashboard & Profile
- **`PatientDashboard.tsx`**: Localize greeting, health stats, upcoming visit cards, and gamification badges.
- **`Profile.tsx`**: Update security settings, account verification status, and profile edit labels.

## 4. Booking System & Public Website
- **`HeroSection.tsx`, `TrustSection.tsx`, `ExpertiseSection.tsx`**: Integrate CMS-backed content with static localized fallbacks.
- **`Booking.tsx` & sub-components**: Localize the multi-step form (Service selection -> Date/Time -> Guest details -> Summary).
- **`BookingConfirmed.tsx`**: Localize the success screen, PDF preview modal, and next step instructions.
- **`Equipe.tsx`, `Soins.tsx`, `Faq.tsx`**: Replace hardcoded French section headers and empty states.

## 5. Technical Details
- **Hook Usage**: Standardize on `const { t } = useTranslation()` across all functional components.
- **Default Values**: Use `t("key", { defaultValue: "English String" })` to ensure readability and fallback safety.
- **Date Formatting**: Ensure `format` and `toLocaleDateString` use the active locale from `i18n.language`.
- **RTL Integrity**: Verify that Arabic layouts maintain correct alignment and spacing using the existing Tailwind RTL classes.

## 6. Verification
- Manual verification of each page in the preview.
- Check that switching languages updates all charts, modals, and tooltips.
- Validate that the PDF generator in `BookingConfirmed` uses the correct language strings for labels.
