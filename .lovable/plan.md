# Plan: Redesign Expertise Page

Redesign the Expertise section with a premium, minimal healthcare aesthetic, using a navy/blue-gray palette and editorial layout, while preserving existing data integration and functionality.

## Proposed Changes

### Components

#### [ExpertiseCard](src/components/ExpertiseCard.tsx)
- Update styling to match premium clinic aesthetic: white background, subtle border, 20px radius, extremely soft shadow.
- Implement refined featured variant:
    - Left-to-right layout on desktop.
    - Large clean icon container.
    - Labels: "Featured expertise" and "Discover this expertise →".
- Implement simplified regular variant:
    - [icon], title, description, and "Learn more →" link.
    - Remove long benefit lists from the card view as requested.
- Add subtle hover animations (250ms transition, 4px lift, arrow slide).

### Pages

#### [Expertise](src/pages/Expertise.tsx)
- Update header with requested English strings as primary fallbacks:
    - Eyebrow: "OUR EXPERTISE"
    - Title: "Advanced Care. Proven Expertise."
    - Subheading: "Discover the expertise, technology and treatments that help us deliver precise, comfortable and personalized care."
- Refine the editorial grid layout:
    - Max-width 1280px.
    - 4-column layout on desktop (featured item spans 2).
    - 2-column on tablet, 1-column on mobile.
- Update CTA section at the bottom:
    - Text: "Need personalized care?", "Talk to our team..."
    - Buttons: "Book an appointment →" and "Meet our doctors".
- Add staggered entrance animations using `framer-motion`.

## Technical Details
- Colors: Heading (`#1a2b4b` / deep navy), Body (muted blue-gray), Accent (primary blue).
- Shadows: Use `--shadow-soft`.
- Border Radius: `rounded-[20px]`.
- Responsive Grid: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8`.

## Verification Plan
- Visual check: verify the new palette and layout in preview.
- Responsiveness: check mobile (375px), tablet (768px), and desktop (1280px+).
- Data: ensure existing expertise blocks from Supabase are still rendered.
- Interaction: verify hover effects and links.
