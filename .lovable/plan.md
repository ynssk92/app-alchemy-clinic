# Plan - Redesign "Meet our experts" Section

Redesign the medical team section on the home page to match the premium editorial style of the reference image. The new design will feature a clean hierarchy, justified layout, and improved interactive elements.

## Proposed Changes

### Frontend Improvements

- **Section Header Redesign**: 
  - Update the layout to match the reference: "PRACTITIONERS" (eyebrow) in small uppercase bold blue.
  - Large, bold H2: "Meet our experts".
  - Refined lead paragraph text.
  - Position a "See all the team" secondary button with an arrow icon on the right side of the header area.

- **Doctor Card Redesign (`DoctorCard.tsx`)**:
  - Implement a cleaner, lighter card aesthetic.
  - Center-align all content within the card.
  - Use a circular avatar with a subtle shadow and border.
  - Add a prominent teal "Get Appointment" button immediately below the avatar.
  - Display the doctor's name in bold, followed by their specialty in teal uppercase, and consultation phone number.
  - Remove redundant icons and stats to achieve a more minimal look.

- **Grid Layout (`Index.tsx`)**:
  - Ensure the grid is responsive and matches the spacing in the reference image.
  - Add subtle background elements if necessary to match the premium "Our Care" page patterns.

### Technical Details

- Use Tailwind CSS for the new styling.
- Maintain existing Framer Motion animations for reveal effects.
- Ensure the "Get Appointment" button correctly links to the booking flow with the specific doctor selected.
- Keep the `DoctorProfileDialog` functional but ensure the trigger (if any) fits the new design (e.g., clicking the name or avatar).

## Impact

- Improves visual consistency with the new premium medical/dental clinic aesthetic.
- Streamlines the user journey to booking an appointment directly from the team section.
- Enhances the professional and trustworthy appearance of the clinic's experts.
