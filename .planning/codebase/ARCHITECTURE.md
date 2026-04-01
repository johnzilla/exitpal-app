# Architecture

**Analysis Date:** 2026-04-01

## Pattern Overview

**Overall:** Single-Page Application (SPA) with a BFF (Backend-for-Frontend) pattern via Supabase Edge Functions

**Key Characteristics:**
- React SPA with client-side routing (React Router v6)
- Supabase as the backend platform (auth, database, real-time, edge functions)
- Dual-mode operation: Supabase (production) and localStorage/mock (demo fallback)
- All sensitive API calls proxied through Supabase Edge Functions (Deno runtime) to keep credentials out of the browser
- Row Level Security (RLS) enforced at the database layer

## Layers

**UI Layer (Pages):**
- Purpose: Route-level views composed from components
- Location: `src/pages/`
- Contains: Full page components — `HomePage`, `LoginPage`, `SignupPage`, `DashboardPage`, `PremiumPage`, `TermsPage`, `PrivacyPage`
- Depends on: Auth context, service layer, shared components
- Used by: React Router routes defined in `src/App.tsx`

**UI Layer (Shared Components):**
- Purpose: Reusable presentational and layout components
- Location: `components/` (root-level layout: `navbar.tsx`, `footer.tsx`, `theme-provider.tsx`, `mode-toggle.tsx`) and `src/components/` (feature-specific: `auth-provider.tsx`, `usage-indicator.tsx`, `vonage-number-display.tsx`)
- Contains: Navbar, footer, auth context provider, usage display
- Depends on: Auth context, service layer (for usage data), shadcn/ui primitives
- Used by: Pages

**UI Primitives:**
- Purpose: Unstyled/styled base components (shadcn/ui wrapping Radix UI)
- Location: `components/ui/`
- Contains: 40+ shadcn/ui components (button, card, dialog, table, calendar, etc.)
- Depends on: Radix UI, Tailwind CSS, `lib/utils.ts` for `cn()`
- Used by: All components and pages

**Service Layer:**
- Purpose: Business logic and data access — abstracts Supabase vs localStorage fallback
- Location: `src/lib/`
- Contains:
  - `message-service.ts` — CRUD for scheduled messages, real-time subscriptions, timer-based dispatch
  - `vonage-service.ts` — Client-side Vonage proxy (calls Edge Function), daily usage queries
  - `twilio-service.ts` — Orphaned Twilio-era copy of vonage-service (unused, not imported)
  - `supabase.ts` — Supabase client singleton + `isSupabaseConfigured()` helper
  - `database.types.ts` — TypeScript types generated from Supabase schema
- Depends on: Supabase client, env vars
- Used by: Pages, components (usage-indicator, vonage-number-display)

**Auth Layer:**
- Purpose: Auth state management, profile sync, navigation on auth events
- Location: `src/components/auth-provider.tsx`
- Contains: `AuthProvider` React context + `useAuth` hook
- Depends on: Supabase auth, profiles table, React Router `useNavigate`
- Used by: All pages and components needing user context; root layout in `src/App.tsx`

**Edge Functions (Server-side):**
- Purpose: Secure API proxy for Vonage — keeps credentials off the client
- Location: `supabase/functions/`
- Contains:
  - `send-message/index.ts` — Verifies auth, checks rate limits, dispatches SMS or voice via Vonage REST API
  - `generate-ncco/index.ts` — Returns Vonage NCCO JSON for voice call TTS content
- Runtime: Deno (Supabase Edge Runtime)
- Depends on: Supabase service role key (env), Vonage API key/secret (env)
- Used by: `src/lib/vonage-service.ts` via `fetch`

**Database Layer:**
- Purpose: Persistent storage with RLS
- Location: `supabase/migrations/`
- Tables:
  - `profiles` — User profile linked to `auth.users`, tracks `phone` and `is_premium`
  - `messages` — Scheduled messages with status (`pending`/`sent`/`failed`) and `vonage_id`
- RLS: Enforced per-user on both tables

## Data Flow

**Message Scheduling (Supabase mode):**

1. User fills the schedule form in `src/pages/DashboardPage.tsx`
2. `DashboardPage` calls `scheduleMessage()` from `src/lib/message-service.ts`
3. `message-service` inserts a row into Supabase `messages` table with `status: 'pending'`
4. `message-service` sets a `setTimeout` for the scheduled delivery time
5. At delivery time, `message-service` calls `sendMessage()` from `src/lib/vonage-service.ts`
6. `vonage-service` POSTs to the Supabase Edge Function `send-message` with the user's Bearer token
7. Edge Function verifies the JWT, checks the daily usage limit, then calls the Vonage REST API
8. Edge Function updates `messages.status` to `sent` or the client falls back to `updateMessageStatus()`
9. Real-time Supabase channel subscription in `DashboardPage` pushes the updated message list to state

**Message Scheduling (Demo/localStorage mode):**

1. Same form submission path
2. `isSupabaseConfigured()` returns false — service functions use localStorage under key `exitpal-messages-{userId}`
3. `simulateMessageSending()` fires a `setTimeout` that randomly marks the message sent or failed
4. Polling (5-second interval) replaces Supabase real-time channel

**Auth Flow:**

1. User submits login/signup form in `src/pages/LoginPage.tsx` or `src/pages/SignupPage.tsx`
2. Page calls `login()` or `signUp()` on the `AuthContext` from `src/components/auth-provider.tsx`
3. `AuthProvider` calls `supabase.auth.signInWithPassword()` or `supabase.auth.signUp()`
4. On session creation, `onAuthStateChange` fires `loadUserProfile()` which upserts the `profiles` row
5. `AuthProvider` sets user state; React Router navigates to `/dashboard`

**State Management:**
- Auth state: React Context via `AuthProvider` — one `User` object (`id`, `email`, `phone`, `isPremium`)
- Message list: `useState` in `DashboardPage`, updated via Supabase real-time channel or polling
- Usage counts: Local `useState` in `UsageIndicator` component, polled every 30 seconds
- Theme: `next-themes` ThemeProvider wrapping the entire app

## Key Abstractions

**`isSupabaseConfigured()` flag:**
- Purpose: Enables zero-config demo mode without environment variables
- Location: `src/lib/supabase.ts`
- Pattern: Every service function gates its real vs mock path on this boolean. If Supabase env vars are absent or placeholder values, demo mode engages.

**`ScheduledMessage` type:**
- Purpose: Canonical message shape used throughout the service layer and dashboard
- Location: `src/lib/message-service.ts`
- Fields: `id`, `userId`, `contactName`, `messageContent`, `phoneNumber`, `scheduledTime`, `messageType` (`sms`|`voice`), `status` (`pending`|`sent`|`failed`), `vonageId`

**`AuthContext`:**
- Purpose: Global auth state and action surface (login, signUp, signInWithGoogle, logout, updateUser)
- Location: `src/components/auth-provider.tsx`
- Pattern: `createContext` + `useContext` with `useAuth` export hook; throws if used outside `AuthProvider`

**`Database` type:**
- Purpose: Supabase type-safe client — generated schema types for all tables/enums
- Location: `src/lib/database.types.ts`
- Used by: Supabase client instantiation in `src/lib/supabase.ts`

## Entry Points

**Browser Entry:**
- Location: `src/main.tsx`
- Triggers: Vite dev server or production build loads `index.html` → `src/main.tsx`
- Responsibilities: Mounts React root, wraps with `BrowserRouter`

**App Shell:**
- Location: `src/App.tsx`
- Responsibilities: Wraps with `ThemeProvider` and `AuthProvider`; defines all React Router routes; renders `Toaster`

**Edge Function Entry (send-message):**
- Location: `supabase/functions/send-message/index.ts`
- Triggers: HTTP POST from `src/lib/vonage-service.ts` at delivery time
- Responsibilities: Auth verification, rate limiting, Vonage SMS/voice dispatch, status update

**Edge Function Entry (generate-ncco):**
- Location: `supabase/functions/generate-ncco/index.ts`
- Triggers: HTTP GET from Vonage API during a voice call answer phase
- Responsibilities: Returns NCCO JSON with TTS `talk` action for the scheduled message content

## Error Handling

**Strategy:** Try/catch at service function boundaries; errors surfaced to users via shadcn/ui `toast` notifications

**Patterns:**
- Service functions catch and log errors, returning `false` or an empty array (graceful degradation)
- `AuthProvider` rethrows auth errors so pages can display them
- Edge Functions return `400` JSON with `error` field; client checks `response.ok`
- Supabase real-time subscription failure silently falls back to manual re-fetch
- Voice call auth uses a simplified Bearer token rather than a proper Vonage JWT (noted in `send-message/index.ts` comment)

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.error` with emoji prefixes (e.g., `✅`, `❌`, `🔧`) throughout all layers — no structured logging library
**Validation:** Client-side only, inline in form `handleSubmit` handlers in pages; no shared validation schema (e.g., Zod)
**Authentication:** Enforced by `AuthProvider` redirecting to `/login` if `user` is null; Edge Functions verify Supabase JWT via `auth.getUser()`; database enforces RLS
**Theme:** `next-themes` with `ThemeProvider` in `src/App.tsx`, defaulting to dark mode; toggle in `components/mode-toggle.tsx`

---

*Architecture analysis: 2026-04-01*
