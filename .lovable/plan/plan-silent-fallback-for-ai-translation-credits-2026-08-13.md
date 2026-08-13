# Plan: Silent Fallback for AI Translation Credits

The `translate-batch` Edge Function is currently returning a `402: Payment Required` error because the workspace has exceeded its credit limit (23.46/5.00). This causes frequent error messages in the browser. I will modify both the Edge Function and the frontend to handle this gracefully by falling back to the original text without raising errors.

## Proposed Changes

### Backend (Edge Function)
- **Modify `supabase/functions/translate-batch/index.ts`**:
    - Update the `fetch` logic to check if the status is `402`.
    - If `402` (or any other non-OK status) is encountered, return a `200 OK` response with the `translations` field set to the original `texts`.
    - This prevents the Edge Function from failing the request, effectively treating "out of credits" as a "pass-through" mode.

### Frontend
- **Update `src/lib/autoTranslate.ts`**:
    - Further sanitize the error logging to be less prominent when it's a known credit issue.
    - Ensure that any 200 responses with pass-through text don't trigger warnings.

## Technical Details
- The Edge Function will now return: `{ "translations": [...original texts...], "status": "fallback", "reason": "out_of_credits" }` with a 200 status when credits are exhausted.
- Frontend `requestTranslation` will be updated to handle this silently.

## User Impact
- No more "Edge function returned 402" errors in the console or admin logs.
- The app will continue to function in French (original language) until credits are topped up.
- English translation will resume automatically once credits are available.
