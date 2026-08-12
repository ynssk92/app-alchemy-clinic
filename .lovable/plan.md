# Redesign Home Page UI

Complete UI overhaul of the landing page to match the premium, medical healthcare aesthetic defined in previous redesigns.

## User Review Required

> [!IMPORTANT]
> This is a **frontend-only redesign**. Existing functionality, dynamic data fetching from the database, and content structure will remain intact.

- **Hero Section**: Modern video-background layout with premium typography and glassmorphism elements.
- **Service/Expertise Section**: Tabbed interface using the high-end `ServiceTabs` and `ServiceCard` components from the "Our Care" page.
- **Medical Team**: Polished presentation using the existing premium `DoctorCard`.
- **Blog Section**: Premium editorial cards matching the new Blog page design.
- **Trust Elements**: Refined "Emergency/Hours" section and a centralized "Quick Info" bar.

## Technical Details

### UI/UX Refactor (`src/pages/Index.tsx`)
- **Top Info Bar**: Modernize with semi-transparent backgrounds and sharper typography.
- **Hero Section**: 
  - Enhance the video overlay with a custom gradient.
  - Refine the text animation sequence.
  - Integrate `HeroCta` with updated shadow and hover states.
- **About/Intro Section**: 
  - Redesign image compositions with soft borders and "floating" effects.
  - Use `framer-motion` for smoother entrance animations.
- **Process/Steps Section**:
  - Replace the heavy cards with lightweight, iconography-focused blocks.
  - Add staggered reveal animations.
- **Services Section**:
  - Replace the current "Departments" grid with the `ServiceTabs` + `ServiceCard` pattern from `src/pages/Soins.tsx`.
  - Maintain the existing database slug/kind filtering logic.
- **Emergency & Stats**:
  - Use glassmorphism (backdrop-blur) for the emergency cards.
  - Redesign stats counters with a more editorial, high-contrast look.
- **Blog Grid**:
  - Replace current `Card` implementation with the premium `BlogCard` component.

### Components Updates
- **`src/components/SiteHeader.tsx`**: Add a scroll-triggered transformation (e.g., shrinking or changing background opacity).
- **`src/components/SiteFooter.tsx`**: Ensure the new shared footer is properly integrated with brand colors.

### Database Integration (Unchanged)
- Continue using `usePageContent("home")` for all sections.
- Continue using `useAppSettings()` for brand and contact info.
- Continue using `supabase` client for direct table queries (doctors, posts).
