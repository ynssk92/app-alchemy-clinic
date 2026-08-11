# Plan: Redesign Expertise page inspired by Our Care page

The goal is to align the Expertise page UI/UX with the "Our Care" (Soins.tsx) page style, featuring a more immersive hero section, background gradients, and a tabbed interface if applicable, or simply adopting the same visual language (colors, typography, spacing).

## User Review Required

> [!IMPORTANT]
> The "Our Care" page uses a tabbed layout to navigate between different categories of treatments. Do you want the Expertise page to also use tabs (e.g., if there are multiple types of expertise like "Technology", "Clinical", etc.), or just adopt the visual aesthetic (gradients, header style) while keeping the grid layout?

## Technical Details

### Frontend Changes

- **Expertise.tsx**:
    - Update the header to match the `Soins.tsx` header (Sparkles badge, large typography with gradient accents).
    - Add the decorative background elements (gradients and blur orbs) from `Soins.tsx`.
    - Adjust padding and spacing to match the "Our Care" page's breathing room.
    - If appropriate, implement `ServiceTabs` to filter expertise if categories exist in the data.

- **ExpertiseCard.tsx**:
    - Refine the card styles to perfectly match `ServiceCard.tsx`'s aesthetic if they differ, or simply ensure consistency in border-radius, shadows, and backdrop-blur.

### Data & Logic

- No changes to data fetching; will continue to use `usePageContent("expertise")`.
- Will add logic to extract categories from blocks if a tabbed layout is requested/implemented.

## Steps

1.  Read `Soins.tsx` carefully to extract all style constants and layout patterns.
2.  Update `Expertise.tsx` to include the decorative background and revised header.
3.  Modify the grid container to match the spacing and alignment of `Soins.tsx`.
4.  Verify the responsiveness matches the "Our Care" page.
