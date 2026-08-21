# Plan — Upgrade Administration Reports Page

Transform the existing Reports stub into a professional clinic analytics dashboard using real-time data from Supabase.

## User Review Required

> [!IMPORTANT]
> The dashboard will use real data from the `profiles`, `appointments`, and `prescriptions` tables. If the database is empty, the charts will show empty states.

- **Date Filtering**: Users can select predefined ranges (Today, This Month, etc.) to filter all statistics.
- **KPI Cards**: Summary cards for Total/New Patients, Appointments (Total, Completed, Upcoming), and Prescriptions.
- **Visual Analytics**: Interactive charts using `recharts` for appointment status breakdown and service type distribution.
- **Practitioner Performance**: A detailed table showing doctor activity (appointments, completion rate, prescriptions).
- **Recent Activity**: Feeds for the latest appointments and prescriptions.

## Technical Details

- **Component**: `src/pages/admin/AdminReports.tsx` (Complete redesign).
- **Data Fetching**: Efficient Supabase queries joining `profiles`, `doctors`, and `services`.
- **UI System**: Leverages existing `KpiCard` and `WidgetCard` components for consistency.
- **Charts**: `recharts` for Pie and Bar charts with the clinic's premium color palette.
- **State Management**: Local state for date ranges and aggregated data.
- **Responsive Design**: Mobile-friendly grid and scrollable tables.

## Implementation Steps

1. **Schema Verification**: Confirm `appointments` and `profiles` fields (done).
2. **Dashboard Component**: Implement `AdminReports.tsx` with full layout and filtering logic (done).
3. **App Integration**: Update `src/App.tsx` to route to the new component instead of the stub (done).
4. **Clean up**: Remove the stub from `src/pages/admin/AdminStubs.tsx` (done).
5. **Final Validation**: Ensure build passes and UI renders correctly (pending).
