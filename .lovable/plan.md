# Redesign New Appointment Page

Redesign the "New Appointment" scheduling page into a premium, modern medical SaaS interface while strictly preserving all backend logic and data fetching.

## Technical Details

- **Visual Style**: Premium medical SaaS aesthetic with #F7F9FC background, white surfaces, and 16-20px rounded corners.
- **Layout**: Centered form card (max-width 850px) with sections for Patient/Doctor, Schedule, and Reason.
- **Components**:
    - `src/pages/admin/AdminAppointmentNew.tsx`: Complete UI overhaul.
    - `lucide-react`: Integrated `Calendar`, `Clock`, `User`, `Stethoscope`, `FileText`, and `Plus` icons.
    - `Select`, `Input`, `Textarea`: Styled with consistent 10-12px radius, subtle borders, and professional focus states.
- **Functionality**:
    - **No Logic Changes**: Preserved `form` state, `supabase` queries, `submit` handler, and validation logic.
    - **Responsive**: Two-column layout for Patient/Doctor and Date/Time on desktop, stacking elegantly on mobile.
- **Header**: Refined typography with a subtle calendar icon and muted subtitle.

## User Interface Improvements

- Organized the form into three clear, logical sections.
- Improved visual hierarchy with clean labels and helper icons.
- Added a premium "Create Appointment" button with a brand-consistent gradient/color.
- Implemented a lightweight "Cancel" button.
