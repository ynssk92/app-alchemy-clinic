# Plan — Enhance Administration Reports Page (Part 2)

Extend the existing Reports dashboard into a comprehensive analytics center by integrating Medical Archive, Billing, Doctor Performance, and Insurance metrics using real clinic data.

## User Review Required

> [!IMPORTANT]
> All new sections (Billing, Archive, Insurance) will pull data from their respective tables. If no invoices or documents exist, these sections will display empty states.

- **Billing Reports**: Financial KPIs (Total Billed, Paid, Balance) with charts for revenue over time and by doctor/service/payment method.
- **Medical Archive Reports**: Document counts by category (Ordonnance, Scanner, etc.) and upload trends.
- **Doctor Activity**: Expanded stats including revenue per doctor and consultations vs. appointments.
- **Insurance Reports**: Metrics for insured patients and insurance-related billing if data exists.
- **Operational Summary**: A high-level overview of all clinic actions for the selected period.
- **Export Capabilities**: Buttons for PDF, CSV, and Print (using browser print and client-side data export).

## Technical Details

- **Tables Integrated**: `invoices`, `payments`, `patient_documents`, `patient_insurance`, `doctors`, `appointments`, `prescriptions`, `profiles`.
- **Joins & Aggregations**: Complex fetching of invoices with their related doctor and patient profiles.
- **UI Architecture**: Modularizing the reports into sections within `AdminReports.tsx` while maintaining the premium clinic theme.
- **Financial Format**: All currency displays will use MAD (Moroccan Dirham) as requested.
- **Filtering**: Synchronized date range and doctor filters across all report modules.

## Implementation Steps

1. **Data Layer Expansion**: Update `loadData` to fetch invoices, payments, and documents (done).
2. **Billing Module**: Implement financial KPI cards and revenue charts (done).
3. **Archive Module**: Implement document category breakdown and upload charts (done).
4. **Operations Module**: Aggregate across all modules for a complete clinic snapshot (done).
5. **Detailed Tables**: Add paginated lists for recent invoices, payments, and documents (done).
6. **Export Logic**: Implement CSV export functionality for the current filtered datasets (done).
7. **Refinement**: Ensure mobile responsiveness and loading skeletons for new sections (done).
