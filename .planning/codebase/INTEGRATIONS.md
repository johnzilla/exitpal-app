# External Integrations

**Analysis Date:** 2026-04-01

## APIs & External Services

**Communications:**
- Vonage (Nexmo) - SMS delivery and voice calls
  - SMS endpoint: `https://rest.nexmo.com/sms/json` (called from `supabase/functions/send-message/index.ts`)
  - Voice calls endpoint: `https://api.nexmo.com/v1/calls` (called from `supabase/functions/send-message/index.ts`)
  - NCCO generation: served from `supabase/functions/generate-ncco/index.ts` — Vonage calls this URL to get call control instructions
  - Auth: API key + API secret for SMS; Application ID + Private Key JWT for voice
  - Default outbound number: `14792659352` (hardcoded in `src/lib/message-service.ts`)
  - No Vonage SDK installed — integration is via direct HTTP fetch in Edge Functions
  - NOTE: `src/lib/twilio-service.ts` also exists as a parallel stub (identical shape, Twilio SIDs) — appears to be a legacy or alternate implementation not currently wired into `message-service.ts`

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `VITE_SUPABASE_URL` (client), `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (Edge Functions)
  - Client: `@supabase/supabase-js` 2.39, initialized at `src/lib/supabase.ts`
  - Tables:
    - `profiles` — user records linked to `auth.users`, fields: `id`, `email`, `phone`, `is_premium`, `created_at`
    - `messages` — scheduled messages, fields: `id`, `user_id`, `contact_name`, `message_content`, `phone_number`, `scheduled_time`, `message_type` (enum: sms|voice), `status` (enum: pending|sent|failed), `vonage_id`, `created_at`
  - Row Level Security (RLS) enabled on both tables — users can only access their own rows
  - Real-time subscriptions: used in `src/lib/message-service.ts` via `supabase.channel('messages')` with `postgres_changes` listener

**File Storage:**
- Local filesystem only (no object storage detected)

**Caching:**
- None (no Redis, Memcached, or similar)

**LocalStorage Fallback:**
- When Supabase is not configured, the app falls back to `localStorage` keyed by `exitpal-messages-{userId}` and `exitpal-user`
- This covers auth state (`src/components/auth-provider.tsx`) and message CRUD (`src/lib/message-service.ts`)

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: `src/components/auth-provider.tsx` — React Context wrapping `supabase.auth`
  - Methods: email/password (`signInWithPassword`, `signUp`), Google OAuth (`signInWithOAuth` with provider `google`)
  - Session persistence: `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: true` (configured in `src/lib/supabase.ts`)
  - Redirect after Google OAuth: `${window.location.origin}/dashboard`
  - Profile auto-creation: on first login, a row is inserted into `profiles` table
  - Premium flag: `profiles.is_premium` boolean controls daily message limits (3 free / 50 premium)

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar)

**Logs:**
- `console.log` / `console.error` throughout — verbose debug logging with emoji prefixes in development
- Edge Function logs go to Supabase dashboard

## CI/CD & Deployment

**Hosting:**
- Netlify — static SPA hosting, config at `netlify.toml`
- Build command: `npm run build` → output to `dist/`
- Node version pinned to 18

**CI Pipeline:**
- Not detected (no GitHub Actions, CircleCI, etc.)

## Environment Configuration

**Required env vars (client-side):**
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase anonymous (public) key

**Required env vars (Supabase Edge Functions — set in Supabase Dashboard):**
- `SUPABASE_URL` — injected automatically by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — injected automatically by Supabase
- `VONAGE_API_KEY` — Vonage dashboard credential
- `VONAGE_API_SECRET` — Vonage dashboard credential
- `VONAGE_DEFAULT_NUMBER` — outbound phone number (E.164 format)
- `VONAGE_APPLICATION_ID` — required for voice calls only
- `VONAGE_PRIVATE_KEY` — required for voice calls only (JWT signing)

**Secrets location:**
- Client secrets: Netlify environment variables (for `VITE_*` vars)
- Server secrets: Supabase Edge Function environment variables (never in client bundle)
- Template: `.env.example` documents all vars with instructions

## Webhooks & Callbacks

**Incoming:**
- Vonage NCCO callback: `GET /functions/v1/generate-ncco?message=...` — Vonage calls this during a voice call to retrieve the call control script (NCCO). Handled by `supabase/functions/generate-ncco/index.ts`. Returns JSON array with `talk` action using voice `Amy`.

**Outgoing:**
- Vonage SMS API: `POST https://rest.nexmo.com/sms/json` — triggered from `supabase/functions/send-message/index.ts` when a scheduled SMS fires
- Vonage Voice API: `POST https://api.nexmo.com/v1/calls` — triggered from `supabase/functions/send-message/index.ts` when a scheduled voice call fires

---

*Integration audit: 2026-04-01*
