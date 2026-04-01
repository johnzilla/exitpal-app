# Technology Stack

**Analysis Date:** 2026-04-01

## Languages

**Primary:**
- TypeScript 5.2 - All frontend source code in `src/`, `components/`, `lib/`, `hooks/`
- TSX (React JSX) - All UI components and pages

**Secondary:**
- Deno/TypeScript - Supabase Edge Functions in `supabase/functions/`
- SQL - Database migrations in `supabase/migrations/`
- JavaScript - Test utility script `test-vonage.js`

## Runtime

**Environment:**
- Browser (SPA) - Primary runtime target
- Deno - Supabase Edge Functions runtime (declared via `https://deno.land/std@0.168.0`)
- Node.js 18 - Build environment (declared in `netlify.toml`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- React 18.2 - UI rendering, declared in `src/main.tsx`
- React Router DOM 6.20 - Client-side routing, `BrowserRouter` in `src/main.tsx`, routes in `src/App.tsx`

**UI:**
- Radix UI - Full suite of headless primitives (accordion, dialog, dropdown, tabs, toast, etc.)
- Tailwind CSS 3.3 - Utility-first styling, config at `tailwind.config.js`
- shadcn/ui convention - Components assembled from Radix + Tailwind in `components/ui/`
- tailwindcss-animate 1.0 - Animation utilities, loaded as Tailwind plugin
- lucide-react 0.446 - Icon library
- react-icons 5.0 - Additional icons

**Forms:**
- react-hook-form 7.53 - Form state management
- zod 3.23 - Schema validation, paired with `@hookform/resolvers`

**Data & State:**
- @supabase/supabase-js 2.39 - Database client and auth, initialized in `src/lib/supabase.ts`
- React Context API - Auth state via `AuthProvider` in `src/components/auth-provider.tsx`

**Date & Time:**
- date-fns 3.6 - Date utilities
- react-day-picker 8.10 - Date picker UI component

**Charts:**
- recharts 2.12 - Charting library (imported but usage context unclear)

**Other UI:**
- embla-carousel-react 8.3 - Carousel
- cmdk 1.0 - Command palette
- input-otp 1.2 - OTP input
- react-resizable-panels 2.1 - Resizable panel layouts
- sonner 1.5 - Toast notifications (alongside Radix toast)
- vaul 0.9 - Drawer component

**Build/Dev:**
- Vite 5.0 - Build tool and dev server, config at `vite.config.ts`
- @vitejs/plugin-react 4.2 - React fast refresh and JSX transform

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.39 - Backend database, auth, and edge function invocation; initialized at `src/lib/supabase.ts`
- `react-router-dom` 6.20 - SPA routing; all routes defined in `src/App.tsx`
- `react-hook-form` + `zod` - Form validation throughout login, signup, and message scheduling flows

**Infrastructure:**
- `uuid` 9.0 - UUID generation for local storage message IDs in `src/lib/message-service.ts`
- `class-variance-authority` 0.7 + `clsx` 2.1 + `tailwind-merge` 2.5 - Variant-based component styling utilities at `lib/utils.ts`

## Configuration

**Environment:**
- Vite-based env vars using `VITE_` prefix (exposed to browser)
- Required client-side vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Template provided at `.env.example`
- Vonage credentials are NOT in client env — they live in Supabase Edge Function environment

**Build:**
- `vite.config.ts` - Build config with manual chunks: `vendor` (react/react-dom), `ui` (radix components), `supabase`
- `tsconfig.json` - Strict TypeScript, ES2020 target, path alias `@/*` maps to project root
- `tsconfig.node.json` - Node config for Vite config file itself
- `postcss.config.js` - PostCSS for Tailwind
- Source maps disabled in production builds

**Path Alias:**
- `@/` resolves to the project root (`.`), configured in both `vite.config.ts` and `tsconfig.json`

## Platform Requirements

**Development:**
- Node.js 18+ (as per `netlify.toml`)
- npm (lockfile present)
- Dev server runs on port 3000 (`vite.config.ts`)

**Production:**
- Netlify - Static site hosting, config at `netlify.toml`
- SPA redirect rule: all routes → `/index.html` (status 200)
- Security headers: X-Frame-Options DENY, X-XSS-Protection, X-Content-Type-Options, Referrer-Policy
- Static asset caching: 1-year immutable cache for `/assets/*`
- Supabase project required for auth + database + edge functions

---

*Stack analysis: 2026-04-01*
