# Codebase Structure

**Analysis Date:** 2026-04-01

## Directory Layout

```
exitpal-app/
├── src/                        # Primary application source
│   ├── App.tsx                 # Root component: providers + routes
│   ├── main.tsx                # React DOM entry point
│   ├── index.css               # Global styles (Tailwind base + CSS vars)
│   ├── components/             # Feature-specific components (src-owned)
│   │   ├── auth-provider.tsx   # AuthContext + useAuth hook
│   │   ├── usage-indicator.tsx # Daily message usage card
│   │   └── vonage-number-display.tsx  # ExitPal phone number card
│   ├── pages/                  # Route-level page components
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── PremiumPage.tsx
│   │   ├── TermsPage.tsx
│   │   └── PrivacyPage.tsx
│   └── lib/                    # Service layer + types
│       ├── supabase.ts         # Supabase client singleton + isSupabaseConfigured()
│       ├── message-service.ts  # CRUD, scheduling, real-time subscriptions
│       ├── vonage-service.ts   # Vonage proxy client + usage queries (ACTIVE)
│       ├── twilio-service.ts   # Twilio-era copy of vonage-service (ORPHANED)
│       └── database.types.ts   # Supabase schema TypeScript types
├── components/                 # Shared layout + shadcn/ui primitives
│   ├── navbar.tsx              # Site navigation bar
│   ├── footer.tsx              # Site footer
│   ├── theme-provider.tsx      # next-themes wrapper
│   ├── mode-toggle.tsx         # Dark/light toggle button
│   └── ui/                     # shadcn/ui component library (~40 files)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       ├── calendar.tsx
│       └── ...                 # (full shadcn/ui component set)
├── hooks/                      # Shared React hooks
│   └── use-toast.ts            # Toast hook (shadcn/ui)
├── lib/                        # Root-level utilities
│   ├── utils.ts                # cn() helper (clsx + tailwind-merge)
│   └── vonage-service.ts       # Root-level mock vonage service (unused by app, legacy)
├── supabase/                   # Supabase backend
│   ├── functions/              # Edge Functions (Deno)
│   │   ├── send-message/
│   │   │   └── index.ts        # Vonage SMS/voice dispatch + rate limiting
│   │   └── generate-ncco/
│   │       └── index.ts        # Vonage NCCO JSON generator for voice calls
│   └── migrations/             # SQL migration files (timestamped)
│       ├── 20250608201742_muddy_spark.sql   # Create profiles table + RLS
│       ├── 20250608201746_damp_haze.sql
│       ├── 20250608202134_morning_smoke.sql
│       ├── 20250608202139_shrill_scene.sql
│       ├── 20250608205835_green_mud.sql
│       ├── 20250612000919_shy_waterfall.sql
│       └── 20250612001429_mellow_cake.sql   # Latest migration
├── public/                     # Static assets served as-is
├── dist/                       # Build output (generated, not committed)
├── index.html                  # Vite HTML entry (references src/main.tsx)
├── vite.config.ts              # Vite build config + path aliases
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
├── tsconfig.node.json          # TypeScript config for Vite/Node tooling
├── postcss.config.js           # PostCSS config for Tailwind
├── netlify.toml                # Netlify deployment + SPA redirect rules
├── .env.example                # Documents required env vars
├── .eslintrc.cjs               # ESLint config
├── package.json                # Dependencies and scripts
└── .bolt/                      # Bolt.new project metadata (tooling only)
```

## Directory Purposes

**`src/pages/`:**
- Purpose: One file per route; self-contained page-level components
- Contains: Full-page views combining layout, data fetching, and form handling
- Key files: `DashboardPage.tsx` (core feature — message scheduling and management)

**`src/components/`:**
- Purpose: Feature-coupled components that depend on `AuthContext` or service layer
- Contains: Context providers, widgets tied to app domain logic
- Key files: `auth-provider.tsx` (required by all authenticated pages)

**`src/lib/`:**
- Purpose: Business logic and data access — the service layer
- Contains: Supabase client, message operations, Vonage proxy calls, TypeScript database types
- Key files: `message-service.ts` (core scheduling logic), `supabase.ts` (shared client + demo-mode gate)

**`components/`** (root-level):
- Purpose: Shared layout components and the full shadcn/ui primitive library
- Contains: Navbar, footer, theme provider, 40+ shadcn/ui components
- Key files: `navbar.tsx`, `footer.tsx`; all `components/ui/*.tsx`

**`components/ui/`:**
- Purpose: shadcn/ui components (Radix UI wrappers styled with Tailwind)
- Generated: Partially (scaffolded via `shadcn-ui` CLI, then committed)
- Contains: Buttons, cards, dialogs, tables, forms, calendars, etc.
- Do not add custom business logic here — keep as pure UI primitives

**`supabase/functions/`:**
- Purpose: Deno-based Edge Functions deployed to Supabase
- Contains: Server-side API proxy for Vonage (never exposes API keys to client)
- Runtime: Deno — imports via `https://deno.land/std` and `https://esm.sh`

**`supabase/migrations/`:**
- Purpose: Ordered SQL migration history for the Supabase Postgres database
- Generated: No — hand/tool authored, committed to repo
- Key files: `20250608201742_muddy_spark.sql` (profiles table), subsequent files add messages table, enums, RLS policies

**`hooks/`:**
- Purpose: Shared React hooks not tied to a specific component
- Contains: `use-toast.ts` only (shadcn/ui toast hook)

**`lib/`** (root-level):
- Purpose: Utilities shared across all parts of the codebase via `@/lib/` alias
- Contains: `utils.ts` with the `cn()` helper; also an orphaned `vonage-service.ts` mock

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React DOM mount, wraps with `BrowserRouter`
- `index.html`: HTML shell loaded by Vite

**Route Definitions:**
- `src/App.tsx`: All React Router `<Route>` declarations

**Auth:**
- `src/components/auth-provider.tsx`: Auth state, `useAuth` hook export

**Configuration:**
- `vite.config.ts`: Build configuration and `@` path alias (resolves to project root)
- `netlify.toml`: Deployment target, SPA catch-all redirect, security headers
- `.env.example`: Documents required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)

**Core Business Logic:**
- `src/lib/message-service.ts`: Schedule, retrieve, cancel, subscribe to messages
- `src/lib/vonage-service.ts`: Client-side proxy to Edge Function + usage query

**Edge Functions:**
- `supabase/functions/send-message/index.ts`: Vonage SMS/voice with auth + rate limit
- `supabase/functions/generate-ncco/index.ts`: NCCO JSON for Vonage voice calls

**Database Schema:**
- `src/lib/database.types.ts`: TypeScript types for `profiles` and `messages` tables
- `supabase/migrations/`: SQL source of truth for schema

## Naming Conventions

**Files:**
- React components: `PascalCase.tsx` for pages (`DashboardPage.tsx`); `kebab-case.tsx` for components (`auth-provider.tsx`, `vonage-number-display.tsx`)
- Services/utilities: `kebab-case.ts` (`message-service.ts`, `vonage-service.ts`)
- shadcn/ui components: `kebab-case.tsx` (`alert-dialog.tsx`, `input-otp.tsx`)

**Directories:**
- `src/pages/` — route-level views
- `src/components/` — feature components
- `src/lib/` — services and utilities
- `components/ui/` — primitive UI components

**Functions:**
- Exported service functions: camelCase (`scheduleMessage`, `cancelMessage`, `getMessagesByUserId`)
- React components: PascalCase (`AuthProvider`, `UsageIndicator`, `VonageNumberDisplay`)
- React hooks: camelCase prefixed with `use` (`useAuth`, `useToast`)

**Database columns:** snake_case (`user_id`, `is_premium`, `vonage_id`, `scheduled_time`)
**TypeScript types:** PascalCase (`ScheduledMessage`, `MessageType`, `MessageStatus`, `AuthContextType`)

## Where to Add New Code

**New Page/Route:**
1. Create `src/pages/NewPage.tsx`
2. Add `<Route path="/new-path" element={<NewPage />} />` in `src/App.tsx`
3. Add nav link in `components/navbar.tsx` if needed

**New Feature Component:**
- If it requires auth or service layer: `src/components/new-component.tsx`
- If it's a pure layout/presentational component: `components/new-component.tsx`
- If it's a shadcn/ui primitive: `components/ui/new-component.tsx`

**New Service Function:**
- Message-related: add to `src/lib/message-service.ts`
- Vonage API-related: add to `src/lib/vonage-service.ts`
- New domain: create `src/lib/new-service.ts`

**New Edge Function:**
- Create `supabase/functions/new-function/index.ts`
- Follow the Deno serve pattern from `send-message/index.ts`
- Import Supabase: `https://esm.sh/@supabase/supabase-js@2`

**New Database Table:**
- Create a new timestamped migration file in `supabase/migrations/`
- Add corresponding types to `src/lib/database.types.ts`

**Shared Utility:**
- Add to `lib/utils.ts` (accessible as `@/lib/utils`)

## Special Directories

**`dist/`:**
- Purpose: Vite production build output
- Generated: Yes
- Committed: No (in `.gitignore`)

**`.bolt/`:**
- Purpose: Bolt.new project tooling metadata
- Generated: Yes
- Committed: Yes (workspace config for the Bolt.new hackathon origin)

**`.planning/`:**
- Purpose: GSD planning documents
- Generated: By GSD tools
- Committed: Yes

---

*Structure analysis: 2026-04-01*
