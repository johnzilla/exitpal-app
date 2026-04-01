# Codebase Concerns

**Analysis Date:** 2026-04-01

## Tech Debt

**Client-side message scheduling via `setTimeout`:**
- Issue: Messages are scheduled using browser `setTimeout` in `src/lib/message-service.ts` (lines 293, 330). Any page refresh, browser close, or tab sleep after scheduling but before delivery will silently drop the scheduled message. The timer only lives in the browser's JS runtime.
- Files: `src/lib/message-service.ts` (`scheduleMessageSending`, `simulateMessageSending`)
- Impact: Core product feature is unreliable — users who schedule a message and then close the tab will never receive it. No retry or recovery mechanism exists.
- Fix approach: Use a server-side job queue (Supabase pg_cron, a cron Edge Function, or a dedicated job runner). Store pending delivery times in the DB and poll/trigger from server.

**Orphaned `twilio-service.ts` file:**
- Issue: `src/lib/twilio-service.ts` is a near-identical copy of `src/lib/vonage-service.ts` (same interface, same Edge Function endpoint, Twilio branding in variable names like `twilioSid`). It is not imported anywhere in the app but still ships in the bundle source.
- Files: `src/lib/twilio-service.ts`
- Impact: Dead code bloat, confusion about which service is authoritative, and risk of a future developer importing the wrong service module.
- Fix approach: Delete `src/lib/twilio-service.ts`.

**Hardcoded real phone number in source code:**
- Issue: `getDefaultVonageNumber()` in `src/lib/message-service.ts` (line 21) returns the literal string `"14792659352"`, a real phone number committed to the repository. Mock "Coming Soon" numbers in `getAvailableVonageNumbers()` (lines 24–30) mix real and fabricated numbers.
- Files: `src/lib/message-service.ts`
- Impact: Phone number is publicly visible in version history and deployed JS bundles. Cannot rotate the number without a code change and redeploy.
- Fix approach: Move the default number to a `VITE_VONAGE_DEFAULT_NUMBER` env var read via `import.meta.env`.

**Demo/production dual-path throughout the codebase:**
- Issue: Every function in `src/lib/message-service.ts` and `src/components/auth-provider.tsx` has an `if (!isSupabaseConfigured())` branch that writes to/reads from `localStorage`. `isSupabaseConfigured()` is called at least 14 times across the codebase (`src/lib/supabase.ts` line 31, called in `auth-provider.tsx`, `message-service.ts`, `DashboardPage.tsx`). Each branch is independently maintained.
- Files: `src/lib/message-service.ts`, `src/components/auth-provider.tsx`, `src/lib/supabase.ts`
- Impact: Cognitive overhead on every change. Risk of demo path diverging from production path and masking real bugs. `updateMessageStatus` in demo mode iterates all localStorage keys (line 190–209) — an O(n) scan with no scoping.
- Fix approach: Decide whether demo mode is a permanent product feature or a development convenience. If the latter, remove it. If the former, extract it to a proper adapter pattern (`StorageAdapter` interface with `LocalStorageAdapter` and `SupabaseAdapter` implementations).

**`any` type overuse in data access layer:**
- Issue: `convertToScheduledMessage(row: any)` (line 33), `messages.map((msg: any) => ...)` (line 53), and `const updateData: any = { status }` (line 213) in `src/lib/message-service.ts` bypass TypeScript's type system for all database read/write paths.
- Files: `src/lib/message-service.ts`
- Impact: Silent runtime errors if Supabase schema changes. No compile-time safety on the critical data path.
- Fix approach: Use the generated `Database` types from `src/lib/database.types.ts` for all Supabase query return types. Replace `any` with `Database['public']['Tables']['messages']['Row']`.

**`isSupabaseConfigured()` logs sensitive env var values to the console:**
- Issue: `src/lib/supabase.ts` lines 40–46 log `{ url: supabaseUrl }` — the full Supabase project URL — to the browser console on every configuration check. `auth-provider.tsx` also logs `supabaseUser.id`, `profile` objects, and session details at debug severity in production builds.
- Files: `src/lib/supabase.ts`, `src/components/auth-provider.tsx`
- Impact: 84 `console.log/warn/error` calls are present in `src/`. In production these expose internal architecture and user identifiers to anyone with DevTools open.
- Fix approach: Wrap all `console.log` calls in a `isDev` guard (`import.meta.env.DEV`) or replace with a structured logger that strips in production builds.

## Known Bugs

**Demo login creates a new user ID on every login:**
- Symptoms: When Supabase is not configured, `login()` in `src/components/auth-provider.tsx` (line 150) generates `"demo-user-" + Date.now()` as the user ID. Each login produces a different ID, so localStorage message data from a prior session is never loaded.
- Files: `src/components/auth-provider.tsx` (lines 149–159)
- Trigger: Log out and log back in while in demo mode.
- Workaround: None.

**`cancelMessage` in demo mode deletes by `messageId` but does not check ownership:**
- Symptoms: `cancelMessage` in localStorage mode (lines 157–164 of `src/lib/message-service.ts`) filters the array by `msg.id !== messageId` without verifying `msg.userId === userId`. Any user ID can cancel any message ID if they know it.
- Files: `src/lib/message-service.ts` (lines 154–177)
- Trigger: Demo mode only. The Supabase path correctly enforces `.eq('user_id', userId)`.
- Workaround: Not applicable in production (Supabase enforced).

**Voice call JWT auth is incorrect:**
- Symptoms: The voice call path in `supabase/functions/send-message/index.ts` (line 173) sends `Authorization: Bearer ${vonageApiKey}` to `https://api.nexmo.com/v1/calls`. The Vonage Voice API requires a JWT signed with the application private key, not the raw API key.
- Files: `supabase/functions/send-message/index.ts` (lines 168–195)
- Trigger: Any voice call scheduled when Supabase + Vonage are both configured.
- Workaround: None — voice calls will always fail in production.

**`HELP` keyword handling is a no-op:**
- Symptoms: In `supabase/functions/send-message/index.ts` (lines 75–80), the `HELP` keyword is detected and logged but the help message is never sent — the code continues to send the original content instead.
- Files: `supabase/functions/send-message/index.ts` (lines 75–80)
- Trigger: Scheduling a message with content exactly `"help"`.
- Workaround: None.

## Security Considerations

**No route-level authentication protection:**
- Risk: `src/App.tsx` defines all routes without a `ProtectedRoute` wrapper. `DashboardPage` and `PremiumPage` each implement ad-hoc `if (!user) { navigate('/login') }` checks inside the component body (after render begins). During the initial auth loading state (`loading === true`), the components render `null` but have already mounted.
- Files: `src/App.tsx`, `src/pages/DashboardPage.tsx` (line 72), `src/pages/PremiumPage.tsx` (line 26)
- Current mitigation: The check prevents meaningful interaction, but the components do mount and the initial data fetch (`subscribeToMessages`) runs before the redirect fires if `user` becomes null mid-session.
- Recommendations: Implement a `ProtectedRoute` component that checks `loading` and `user` before rendering children. Block render until auth state is known.

**Demo mode accepts any credentials as valid:**
- Risk: When Supabase is not configured, `login()` accepts any email/password combination and creates a valid authenticated session stored in localStorage (`src/components/auth-provider.tsx` lines 147–159).
- Files: `src/components/auth-provider.tsx`
- Current mitigation: This path is only reachable when env vars are missing, which should not happen in production.
- Recommendations: Add an explicit `NODE_ENV !== 'production'` guard around the demo login path, or remove demo mode entirely for production builds.

**CORS wildcard on Edge Functions:**
- Risk: Both `supabase/functions/send-message/index.ts` (line 6) and `supabase/functions/generate-ncco/index.ts` (line 6) set `'Access-Control-Allow-Origin': '*'`. The `send-message` function is authenticated (checks JWT), but `generate-ncco` is entirely unauthenticated and publicly accessible.
- Files: `supabase/functions/send-message/index.ts`, `supabase/functions/generate-ncco/index.ts`
- Current mitigation: `generate-ncco` only reads a `message` query parameter and returns NCCO JSON, so direct abuse impact is low.
- Recommendations: Restrict CORS to the production domain. Add authentication or a signed URL scheme to `generate-ncco` so that voice call scripts cannot be invoked arbitrarily.

**Phone number passed from client without server-side validation:**
- Risk: The `to` phone number in `supabase/functions/send-message/index.ts` is taken directly from the request body without format validation or E.164 normalization. A malformed number passed to Vonage may cause an error that exposes internal API error messages to the client.
- Files: `supabase/functions/send-message/index.ts` (line 47)
- Current mitigation: Vonage API will reject badly-formed numbers with an error.
- Recommendations: Validate E.164 format server-side before calling Vonage. The signup form regex (`/^\+?[0-9\s\-()]{10,15}$/` in `src/pages/SignupPage.tsx` line 60) is client-only and easily bypassed.

**`isPremium` is set client-side with no server verification:**
- Risk: `PremiumPage.tsx` calls `updateUser({ isPremium: true })` after a simulated mock payment (`handleMockPayment`, line 49). There is no payment gateway integration. The `updateUser` function in `auth-provider.tsx` writes directly to the `profiles` table.
- Files: `src/pages/PremiumPage.tsx` (lines 47–61), `src/components/auth-provider.tsx` (lines 288–319)
- Current mitigation: The Supabase RLS policies allow a user to update their own profile row, which includes `is_premium`.
- Recommendations: `is_premium` should only be set by a server-side webhook from an actual payment provider (Stripe, etc.). Remove client-side `updateUser({ isPremium: true })` until a payment integration exists.

## Performance Bottlenecks

**`isSupabaseConfigured()` runs on every call including console logging:**
- Problem: The function at `src/lib/supabase.ts` lines 31–47 executes a `console.log` with object creation on every invocation. It is called 14+ times during page load and on every message operation.
- Files: `src/lib/supabase.ts`
- Cause: No memoization; function re-executes and logs on every call.
- Improvement path: Compute the result once at module initialization and export a constant: `export const SUPABASE_CONFIGURED = !!(supabaseUrl && ...)`. Remove the console.log.

**`UsageIndicator` polls Supabase every 30 seconds:**
- Problem: `src/components/usage-indicator.tsx` (line 31) runs `getDailyUsage()` every 30 seconds. `getDailyUsage()` makes two sequential Supabase queries (profile fetch + messages count).
- Files: `src/components/usage-indicator.tsx`, `src/lib/vonage-service.ts` (`getDailyUsage`)
- Cause: Polling instead of using the existing Supabase real-time subscription channel.
- Improvement path: Subscribe to the `messages` channel (already open in `subscribeToMessages`) and re-compute usage count from the messages state already held in `DashboardPage`.

**Demo mode `subscribeToMessages` polls localStorage every 5 seconds:**
- Problem: `src/lib/message-service.ts` lines 245–252 set up a 5-second interval polling localStorage when Supabase is not configured. localStorage reads are synchronous and block the main thread, though the dataset is small.
- Files: `src/lib/message-service.ts`
- Cause: Simulating real-time behavior via polling.
- Improvement path: Use a custom event or a `BroadcastChannel` to notify on localStorage writes instead of polling.

## Fragile Areas

**Message delivery depends on the browser tab remaining open:**
- Files: `src/lib/message-service.ts` (`scheduleMessageSending`, lines 285–317)
- Why fragile: `setTimeout` is cleared when the page unloads. There is no persistence of pending timers, no server-side fallback scheduler, and no indication to the user that closing the tab will prevent delivery.
- Safe modification: Do not change the timing logic without also adding a server-side delivery mechanism. Any refactor must handle messages already stored in Supabase as `pending` that have no active timer.
- Test coverage: None — no test files exist in the project.

**Auth state races in `AuthProvider`:**
- Files: `src/components/auth-provider.tsx`
- Why fragile: `initAuth` is async and sets up a separate `onAuthStateChange` listener (line 71) outside the async function body. There is a window where both the `getSession` callback and the `onAuthStateChange` listener could call `loadUserProfile` concurrently for the same session, causing duplicate profile fetches or state setting.
- Safe modification: Unify auth initialization into a single `onAuthStateChange` subscription. Cancel in-flight `loadUserProfile` calls on rapid state changes.
- Test coverage: None.

**`DashboardPage` uses DOM query to switch tabs:**
- Files: `src/pages/DashboardPage.tsx` (lines 500–503)
- Why fragile: The "Schedule Your First Message" button switches tabs by calling `document.querySelector('[value="schedule"]')?.click()`. This couples the UI to a DOM selector string. Any refactor of the `Tabs` component or value attribute will silently break navigation.
- Safe modification: Use a React state variable to control the active tab instead of DOM manipulation.
- Test coverage: None.

## Missing Critical Features

**No real payment integration:**
- Problem: The entire premium upgrade flow is a mock (`handleMockPayment` in `src/pages/PremiumPage.tsx` line 47). Clicking "Confirm Payment" sets `isPremium: true` with no charge.
- Blocks: Revenue generation and proper access control for premium features (higher message limits, premium numbers).

**No server-side message scheduler:**
- Problem: As documented above, all message delivery is client-side via `setTimeout`. There is no cron job, queue, or edge function that checks for `pending` messages past their `scheduled_time`.
- Blocks: Reliable core product functionality.

**No opt-out/STOP list persistence:**
- Problem: The `STOP` keyword check in `supabase/functions/send-message/index.ts` (lines 55–73) logs the opt-out and returns an error but does not update any database field. A user who texts STOP will continue to have messages attempted on their number until they are manually removed.
- Blocks: TCPA/10DLC compliance.

## Test Coverage Gaps

**No test suite exists:**
- What's not tested: The entire codebase. No test runner (`jest`, `vitest`) is configured. The only "tests" are the manual mock script `test-vonage.js` at the project root.
- Files: All of `src/`, `supabase/functions/`
- Risk: Every feature — auth, message scheduling, delivery, cancellation, usage limits — can break without any automated detection.
- Priority: High

---

*Concerns audit: 2026-04-01*
