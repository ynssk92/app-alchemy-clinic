# Plan: Redesign Public Landing Page for La Dune Clinic

Redesign the public-facing website to a premium, modern dental clinic aesthetic while maintaining complete separation from the admin dashboard and preserving all backend functionality.

## Proposed Changes

### 1. Layout and Navigation overhaul
- **Public Layout**: Create a dedicated `PublicLayout.tsx` to encapsulate the public website's header and footer, ensuring a consistent brand experience separate from the admin UI.
- **Header**: Redesign `SiteHeader.tsx` and `TopHeader.tsx` for a cleaner, more premium look (white background, thin borders, sticky behavior).
- **Footer**: Update `SiteFooter.tsx` with a refined multi-column layout including legal links.

### 2. Home Page (Landing Page) Redesign
- **Hero Section**: Replace the video background with a high-quality clinic image, large elegant typography, and dual CTAs ("Book Appointment" and "Discover Our Care").
- **Trust Section**: Add a refined section immediately below the hero highlighting clinic expertise.
- **Service Section**: Overhaul the display of dental services, loading real data from the database.
- **Expertise Section**: Create a premium technology/precision showcase.
- **Team Section**: Update "Meet Our Team" with elegant doctor cards.
- **Testimonials/Experience**: Add a "Patient Experience" section focused on human-centered care.
- **Blog & FAQ**: Integrate latest posts and a modern accordion for FAQs.
- **Contact**: Refine the contact information layout.

### 3. Component Updates
- **`DoctorCard.tsx`**: Enhance the card design for the public view (circular avatars, minimal metadata).
- **`ServiceCard.tsx`**: Improve visual styling for dental treatments.
- **`Faq.tsx`**: Update the FAQ page to match the new editorial style.

### 4. Visual Identity & Animations
- **Palette**: Strictly adhere to royal blue, soft blue, and mint accents on light backgrounds.
- **Typography**: Implement a premium sans-serif hierarchy.
- **Animations**: Add subtle scroll reveals and micro-interactions using `framer-motion`.

## Technical Details
- **No Backend Changes**: All data will be fetched using existing Supabase hooks (`usePageContent`, `supabase.from('doctors')`, etc.).
- **Responsiveness**: Use Tailwind CSS breakpoints for a seamless experience from mobile (320px) to ultra-wide (1920px).
- **Isolation**: Ensure all changes are contained within public routes (`/`, `/about`, `/soins`, etc.) and do not leak into the admin dashboard (`/admin/*`).
- **Dependencies**: Utilize `lucide-react` for iconography and `framer-motion` for smooth transitions.

## Verification Plan
- **Desktop/Mobile Inspection**: Use Playwright to capture screenshots at multiple breakpoints (375px, 768px, 1024px, 1440px).
- **Functionality Check**: Verify "Book Appointment" CTA navigates to the existing booking flow.
- **Data Loading**: Confirm services, doctors, and blog posts load correctly from the database.
- **Admin Isolation**: Verify that the admin dashboard UI remains unchanged.
