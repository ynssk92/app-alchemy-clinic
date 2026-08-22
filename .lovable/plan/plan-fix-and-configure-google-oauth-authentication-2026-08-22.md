# Plan - Fix and Configure Google OAuth Authentication

Implement a safe and reliable Google OAuth authentication flow that integrates with the existing system and ensures correct role-based redirection.

## Proposed Changes

### 1. Hero Section Update
- Update `src/components/HeroSection.tsx` badge text to display the requested literal command text.

### 2. Authentication Callback Handling
- Modify `src/pages/AuthCallback.tsx` to intelligently redirect users based on their role after a successful OAuth login.
- Implement patient profile check to ensure new OAuth users have a profile created or linked.
- Redirect patients to `/patient-dashboard` and staff/admins to `/admin`.

### 3. Google OAuth Login Flow
- Update `handleOAuthLogin` in `src/pages/Auth.tsx` to use the standard Supabase OAuth flow if `lovable.auth` is not already configured for the specific redirect requirements.
- Ensure `redirectTo` points to `${window.location.origin}/auth/callback`.

### 4. Patient Profile Linking Logic
- Enhance `loadRole` in `src/hooks/useAuth.tsx` (or implement in `AuthCallback`) to detect if a new authenticated user lacks a profile and trigger profile creation if necessary, reusing their auth email/metadata.

## Technical Details
- **Role Detection**: Use the `user_roles` table to check for 'admin' or 'assistant' roles.
- **Patient Profile**: Check the `profiles` table for an existing entry; if missing, create one.
- **Redirection**:
  - `admin` or `assistant` -> `/admin`
  - `patient` (or default) -> `/patient-dashboard`
- **Safety**: No changes to existing RLS policies or database schema. Additive logic only for profile creation.

## Verification Plan
- **Google Login (Existing Patient)**: Verify redirection to `/patient-dashboard`.
- **Google Login (New Patient)**: Verify profile creation and redirection to `/patient-dashboard`.
- **Google Login (Admin/Doctor)**: Verify redirection to `/admin`.
- **Email/Password Login**: Verify it remains functional and redirects correctly.
- **Unauthorized Access**: Verify `/patient-dashboard` remains protected.
- **Callback Route**: Verify `/~oauth/callback` (aliased or handled via `/auth/callback`) processes sessions correctly.
