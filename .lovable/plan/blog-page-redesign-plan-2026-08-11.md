# Blog Page Redesign Plan

Redesign the Blog page to match a premium editorial healthcare aesthetic inspired by "La Dune Clinique Dentaire" visual identity.

## User Review Required
> [!IMPORTANT]
> - The redesign will preserve all existing blog posts and functionality.
> - No database changes or data deletions will occur.
> - The visual style will shift to a 3-column editorial grid with a compact header.

## Proposed Changes

### Design & UI
- **Compact Hero Header:** Replace the large hero area with a refined editorial header (Small eyebrow, main title, description) on a subtle light blue-gray background.
- **Premium Blog Cards:**
    - White background with soft rounded corners (16-20px) and 1px borders.
    - Full-width images with a hover zoom effect.
    - **Date Badge:** Overlapping the image bottom-right in La Dune blue.
    - Metadata with small blue icons (date, author/category if available).
    - Refined "Read article →" editorial link.
- **Grid Layout:** 3 columns on desktop, 2 on tablet, 1 on mobile.
- **Responsive Improvements:** Optimized spacing and typography across all viewports.
- **State Handling:** Skeleton loaders for loading states and branded empty/error messages.

### Technical Implementation
- **Component Refactor:** Create a new `BlogCard` component to encapsulate the premium design.
- **Data Integration:** Reuse existing `blog_posts` query from Supabase, mapping fields (`title`, `slug`, `excerpt`, `cover_image_url`, `published_at`) to the new UI.
- **Framer Motion:** Add smooth entrance animations for the grid and hover transitions for the cards.

## Technical Details
- **Colors:** Primary navy (`--primary`), secondary light blue-gray (`--muted`), accent blue (`--secondary`).
- **Icons:** Use `lucide-react` for metadata icons.
- **Styling:** Tailwind CSS with semantic tokens from `index.css`.
- **Images:** Use `object-fit: cover` with aspect ratio management for consistent grid alignment.
