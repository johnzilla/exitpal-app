# Coding Conventions

**Analysis Date:** 2026-04-01

## Naming Patterns

**Files:**
- React pages: PascalCase with `Page` suffix — `DashboardPage.tsx`, `LoginPage.tsx`, `SignupPage.tsx`
- React components: kebab-case — `auth-provider.tsx`, `usage-indicator.tsx`, `vonage-number-display.tsx`
- shadcn/ui components: kebab-case in `components/ui/` — `button.tsx`, `card.tsx`, `dialog.tsx`
- Service/lib modules: kebab-case — `message-service.ts`, `vonage-service.ts`, `supabase.ts`
- Hooks: kebab-case with `use-` prefix — `use-toast.ts`
- Top-level layout components: kebab-case — `navbar.tsx`, `footer.tsx`, `theme-provider.tsx`

**Functions (exported service functions):**
- camelCase — `scheduleMessage`, `cancelMessage`, `getMessagesByUserId`, `subscribeToMessages`
- Boolean helpers prefixed with `is` or `get` — `isSupabaseConfigured`, `getDailyUsage`

**Functions (React event handlers):**
- camelCase with `handle` prefix — `handleSubmit`, `handleInputChange`, `handleCancelMessage`, `handleGoogleSignIn`

**React components:**
- PascalCase — `AuthProvider`, `UsageIndicator`, `VonageNumberDisplay`, `Navbar`

**Types and interfaces:**
- PascalCase — `ScheduledMessage`, `MessageType`, `MessageStatus`, `AuthContextType`, `SendMessageRequest`
- Union types for constrained strings — `type MessageType = 'sms' | 'voice'`
- `type` keyword for object shapes and context types; `interface` for database schema types in `database.types.ts`

**Variables:**
- camelCase — `formData`, `isLoading`, `isSubmitting`, `scheduledTime`
- Boolean state uses `is` prefix — `isLoading`, `isSubmitting`, `isMenuOpen`, `isScrolled`

**Constants:**
- camelCase for exported functions that return constants — `getDefaultVonageNumber()`, `getAvailableVonageNumbers()`
- SCREAMING_SNAKE_CASE not used; no top-level `const SOME_CONSTANT` pattern observed

## Code Style

**Formatting:**
- No Prettier config found. Formatting is enforced by TypeScript strict mode and ESLint only.
- Single quotes for strings (JS/TS), double quotes in JSX attributes — `value="sms"`, `className="w-full"`
- No trailing semicolons in most files; some files (primarily `components/ui/`) use semicolons consistently
- 2-space indentation throughout

**Linting:**
- ESLint configured at `.eslintrc.cjs`
- Extends: `eslint:recommended`, `plugin:react/recommended`, `plugin:@typescript-eslint/recommended`, `plugin:react/jsx-runtime`
- Key rule: `@typescript-eslint/no-unused-vars` as `warn` with `argsIgnorePattern: '^_'`
- Max warnings: 0 (enforced via `npm run lint` — `--max-warnings 0`)

**TypeScript:**
- Strict mode enabled in `tsconfig.json` (`"strict": true`)
- `noUnusedLocals` and `noUnusedParameters` both set to `false` — unused vars only warned by ESLint
- Target: ES2020, module: ESNext
- `any` type is used in some places, particularly for database row conversion — `const convertToScheduledMessage = (row: any)`
- Type assertions used when narrowing — `value as MessageType`, `checked as boolean`

## Import Organization

**Order observed in pages/components:**
1. React built-ins — `import { useState, useEffect } from 'react'`
2. Third-party libraries — `import { useNavigate } from 'react-router-dom'`, `import { format } from 'date-fns'`
3. UI components via `@/` alias — `import { Button } from '@/components/ui/button'`
4. Shared layout components via `@/` — `import { Navbar } from '@/components/navbar'`
5. Local/relative imports — `import { useAuth } from '../components/auth-provider'`
6. Local lib/service imports — `import { scheduleMessage } from '../lib/message-service'`

**Path Aliases:**
- `@/` resolves to the project root (`.`) — configured in both `tsconfig.json` and `vite.config.ts`
- Usage is inconsistent: some imports use `@/components/navbar`, others use relative `../components/navbar`. Both patterns co-exist in the same files (e.g., `DashboardPage.tsx` uses `@/` for ui components but `../` for local components).

## Error Handling

**Async operations follow a consistent try/catch/finally pattern:**
```typescript
try {
  setIsLoading(true)
  await someAsyncOperation()
  toast({ title: "Success", description: "..." })
} catch (error) {
  toast({ variant: "destructive", title: "Failed", description: "..." })
} finally {
  setIsLoading(false)
}
```

**Service functions return `boolean` or throw:**
- Functions like `cancelMessage` return `false` on error rather than throwing — `return false`
- Service entry points re-throw after logging — `console.error(...); throw error`
- Edge functions catch all errors and return a structured JSON error response with HTTP 400

**Error propagation:**
- Pages consume errors from auth/service calls and display them via the `toast` system (`useToast` from `@/hooks/use-toast`)
- Service layer logs with `console.error` before re-throwing or returning `false`
- Specific Supabase error codes are checked — `error.code === 'PGRST116'` for "not found"
- `instanceof Error` check before accessing `.message` in `SignupPage.tsx`

**Guard clauses:**
- Early returns used to guard against missing user — `if (!user) return`
- Supabase availability checked at the top of every service function with `if (!isSupabaseConfigured())`

## Logging

**Framework:** `console` (no logging library)

**Patterns:**
- Emoji prefixes used extensively throughout auth and service code to indicate log type:
  - `🔧` configuration checks
  - `✅` success
  - `❌` failure
  - `⚠️` warnings/fallback mode
  - `💥` caught exceptions
  - `📅` scheduling
  - `🚀` initiation
  - `🎭` demo/mock operations
- Production console logs are not stripped — debug-level logging ships to production
- Edge function `send-message/index.ts` uses plain `console.log` and `console.error`

## Comments

**When to Comment:**
- Section dividers in JSX use inline comments — `{/* Storage indicator */}`
- JSDoc-style block comments used on exported service functions:
  ```typescript
  /**
   * Schedule a new message using Supabase or localStorage fallback
   */
  export const scheduleMessage = async (...) => { ... }
  ```
- Inline comments explain non-obvious logic — `// Ensure user owns the message`

**JSDoc:**
- Used selectively on exported async service functions in `message-service.ts` and `vonage-service.ts`
- Not used on React components or hooks

## Function Design

**Size:**
- Page components are large (200-570 lines) — they contain all form logic, state, and JSX inline
- Service functions are focused — typically 20-50 lines each

**Parameters:**
- Event handlers receive typed React events — `e: React.ChangeEvent<HTMLInputElement>`
- Service functions use positional parameters; complex input uses `Omit<T, 'id' | 'createdAt'>` pattern

**Return Values:**
- Service functions return typed objects — `Promise<ScheduledMessage>`, `Promise<boolean>`
- Vonage service returns `{ success: boolean; vonageId?: string; error?: string }`
- `subscribeToMessages` returns a cleanup function `() => void`

## Module Design

**Exports:**
- Services use named exports for all functions — `export const scheduleMessage = ...`
- React components use a mix: pages use `export default`, named components use named exports — `export function Navbar()`
- `AuthProvider` and `useAuth` are both named exports from `auth-provider.tsx`

**Barrel Files:**
- Not used. Each import path is explicit to the source file.

## State Management

**Pattern:**
- All state is local React `useState` — no global store (Redux, Zustand, etc.)
- Auth state is provided via a custom context (`AuthContext`) in `src/components/auth-provider.tsx`
- Form state is managed as a single `formData` object updated via spread — `setFormData(prev => ({ ...prev, [name]: value }))`

## Component Structure Pattern

Pages follow a consistent layout:
1. Imports
2. `export default function PageName()`
3. Context hooks (`useAuth`, `useNavigate`, `useToast`)
4. State declarations
5. `useEffect` for initialization/subscriptions
6. Event handler functions (`handleX`)
7. Helper render functions (`getStatusIcon`)
8. Early return guard (`if (!user) return null`)
9. Return JSX wrapped in `<div className="flex flex-col min-h-screen">` with `<Navbar />` and `<Footer />`

---

*Convention analysis: 2026-04-01*
