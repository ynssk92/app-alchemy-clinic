-- Add GIN indexes for fuzzy search support on key searchable columns
-- Using pg_trgm for efficient ILIKE searches

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Patients Table Indexes
CREATE INDEX IF NOT EXISTS idx_patients_first_name_trgm ON public.patients USING gin (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_last_name_trgm ON public.patients USING gin (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_phone_trgm ON public.patients USING gin (phone gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_email_trgm ON public.patients USING gin (email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_patient_number_trgm ON public.patients USING gin (patient_number gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_national_id_trgm ON public.patients USING gin (national_id gin_trgm_ops);

-- Doctors Table Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_full_name_trgm ON public.doctors USING gin (full_name gin_trgm_ops);

-- Appointments Table Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_reference_trgm ON public.appointments USING gin (reference gin_trgm_ops);
-- Skipping 'status' if it's an enum (based on previous error)

-- Invoices Table Indexes
CREATE INDEX IF NOT EXISTS idx_invoices_number_trgm ON public.invoices USING gin (invoice_number gin_trgm_ops);
-- Skipping 'status' as it is an enum (invoice_status)

-- Services Table Indexes
CREATE INDEX IF NOT EXISTS idx_services_name_trgm ON public.services USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_services_code_trgm ON public.services USING gin (code gin_trgm_ops);
