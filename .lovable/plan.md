# Plan: Translation Credit & AI Monitor Admin Page

Implement a new admin page to monitor Lovable AI Gateway translation credits, track usage, and view recent translation errors.

## User Review Required

> [!IMPORTANT]
> The translation feature currently uses a shared credit system. If credits are exhausted (as seen in recent 402 errors), translations fallback to original text. This admin page will provide visibility into that state.

## Proposed Changes

### Database & Backend
- No schema changes required. We will use the `credits--get_credit_balance` capability (via a frontend helper or local mock if needed, but since I am an agent I can just query it now and provide a snapshot, though the request asks for a *page*).
- For "last translation error timestamps", I will use `localStorage` or a dedicated simple table if persistent logs are needed. Given the "minimal change" constraint, I'll start with a client-side log in `localStorage` that catches `autoTranslate` failures.

### Admin Interface
- **New Page**: `src/pages/admin/AdminTranslationMonitor.tsx`
    - Display current credit usage vs limit.
    - Status indicator (Healthy / Credits Exhausted / Error).
    - List of recent translation errors with timestamps.
    - Quick links to Lovable billing (external links to common billing paths).
- **Navigation**:
    - Add "AI & Translation" to `AdminLayout.tsx` under the "System" section.
- **AutoTranslate Integration**:
    - Update `src/lib/autoTranslate.ts` to log errors to a shared utility that `AdminTranslationMonitor` can read.

## Technical Details
- **Credit Data**: Since the actual credit API is not accessible to the client-side code directly (it's a tool I have, but the app doesn't have a direct Supabase table for it), I will implement a placeholder UI that explains how to check credits, or use a simulated fetch if the user wants real-time dashboard data (which might require a custom Edge Function). *Correction*: I'll provide the UI structure and explain that real-time credit data requires an admin edge function or manual check, but I'll implement the error logging immediately.
- **Error Logging**: Simple `JSON.parse(localStorage.getItem('translation_errors') || '[]')`.

## Verification Plan
- **Automated Tests**: Playwright script to navigate to the new page and check if error logs are displayed.
- **Manual Verification**: Trigger a translation failure (mocked) and verify it appears in the monitor page.
