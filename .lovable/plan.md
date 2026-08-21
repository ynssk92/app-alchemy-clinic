# Upgrade Administration Reports Page

Transform the existing Reports stub into a comprehensive clinic analytics dashboard with real-time data from patients, appointments, and prescriptions.

## Technical Details

### Database & Data Fetching
- **Real-time Data**: Aggregate data from `patients`, `appointments`, `doctors`, and `prescriptions` tables.
- **Date Filtering**: Implement a range selector (Today, Week, Month, Year, Custom) that updates all statistics.
- **Efficient Queries**: Use Supabase aggregation and targeted fetches to ensure performance.

### UI Components
- **Top Bar**: Unified header with Title, Date Range Selector, Refresh, and Export functionality.
- **KPI Dashboard**: Summary cards for Total Patients, New Patients, Appointments (Total, Completed, Cancelled, No-show), and Prescriptions.
- **Visual Analytics**: Use `recharts` to visualize trends:
  - New Patients over time.
  - Appointments by status and type.
  - Doctor activity breakdown.
  - Prescription trends.
- **Detailed Data Tables**: Paginated lists for Appointments, Consultations (derived from appointments), and Prescriptions.
- **Responsive Layout**: Three-tier grid for desktop, stacking for tablet/mobile.

### Features
- **Empty & Loading States**: Skeleton loaders for each section to prevent page blocking.
- **Export & Print**: Support for report generation based on filtered data.
- **Security**: Strict enforcement of existing RLS policies and admin permissions.

## Implementation Steps
1. Create `src/pages/admin/AdminReports.tsx` with the new dashboard architecture.
2. Update `src/App.tsx` to import the new component instead of the stub.
3. Clean up `src/pages/admin/AdminStubs.tsx`.
4. Implement data aggregation logic and chart integrations.
