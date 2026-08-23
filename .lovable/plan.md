---
title: Hardened Role-Based RLS and Backend Security
description: Implementation plan to enforce role-based permissions and patient isolation at the database level using Supabase RLS.
---

# Plan - Hardened Role-Based RLS and Backend Security

Harden the existing role-based authorization system by enforcing permissions and data isolation at the database level (Supabase RLS). This ensures that frontend visibility controls are backed by robust backend security.

## User Review Required

> [!IMPORTANT]
> - RLS policies will be updated for `patients`, `appointments`, `prescriptions`, `invoices`, and `patient_medical_history`.
> - A new helper function `owns_patient_record(user_id, target_patient_id)` will be created to unify patient ownership checks.
> - Access will be strictly tied to `public.has_permission()` for staff and ownership for patients.

## Proposed Changes

### Database Schema & Security (Supabase)

#### 1. Security Helper Functions
- Create a `SECURITY DEFINER` function `owns_patient_record(user_id uuid, target_patient_id uuid)`:
  - Returns true if `user_id` is the owner of the patient record (via `patients.user_id`).
  - This avoids repetitive join logic in multiple RLS policies.

#### 2. RLS Policy Hardening
Update RLS policies for the following tables to ensure both staff permission checks and patient ownership checks:

- **`patients`**:
  - `SELECT`: `has_permission('patients.view')` OR `user_id = auth.uid()`.
  - `INSERT/UPDATE`: `has_permission('patients.edit')` OR `user_id = auth.uid()` (for own profile).
  - `DELETE`: `has_role(auth.uid(), 'admin')`.

- **`appointments`**:
  - `SELECT`: `has_permission('appointments.view')` OR `owns_patient_record(auth.uid(), patient_id)`.
  - `INSERT/UPDATE`: `has_permission('appointments.edit')` OR `owns_patient_record(auth.uid(), patient_id)`.

- **`prescriptions`**:
  - `SELECT`: `has_permission('prescriptions.view')` OR `owns_patient_record(auth.uid(), patient_id)`.
  - `INSERT/UPDATE`: `has_permission('prescriptions.edit')`.

- **`invoices`**:
  - `SELECT`: `has_permission('billing.view')` OR `owns_patient_record(auth.uid(), patient_id)`.
  - `INSERT/UPDATE`: `has_permission('billing.edit')`.

- **`patient_medical_history`** & **`patient_medical_history_v2`**:
  - `SELECT`: `has_permission('medical_records.view')` OR `owns_patient_record(auth.uid(), patient_id)`.
  - `INSERT/UPDATE`: `has_permission('medical_records.edit')`.

- **`user_roles`** & **`role_permissions`**:
  - Restrict `INSERT/UPDATE/DELETE` to `admin` role only.

### Frontend Updates

#### 1. Hero Badge Literal Text
- Update `src/components/HeroSection.tsx` to display the large instruction block as literal text in the badge.

#### 2. Component Protection Refinement
- Ensure `src/components/ProtectedRoute.tsx` and `src/components/permissions.tsx` are fully synced with the database permissions (already mostly implemented in previous steps, will double-check).

## Technical Details

- **Ownership Logic**: `patients.user_id` maps to `auth.users.id`. All clinical records (`appointments`, `prescriptions`, etc.) reference `patient_id` (the `patients.id` UUID).
- **Migration Strategy**: Use `DROP POLICY IF EXISTS` followed by `CREATE POLICY` to ensure clean updates without breaking existing data.
- **Permission Mapping**: Use the existing `app_permission` enum values: `patients.view`, `patients.edit`, `appointments.view`, etc.

## Data Safety Confirmation
- No `DROP TABLE` or `TRUNCATE` operations.
- Existing records in all clinical and auth tables will be preserved.
- Policies are additive or corrective, ensuring no loss of access for authorized users.
