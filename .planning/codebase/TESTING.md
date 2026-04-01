# Testing Patterns

**Analysis Date:** 2026-04-01

## Test Framework

**Runner:**
- None configured. No `jest.config.*`, `vitest.config.*`, or testing library dependency found in `package.json`.

**Assertion Library:**
- None.

**Run Commands:**
```bash
# No test script defined in package.json
# "scripts" only contains: dev, build, lint, preview
```

## Test File Organization

**Location:**
- No test files found anywhere in the project. No `*.test.*` or `*.spec.*` files exist.

**Naming:**
- Not applicable — no tests exist.

**Structure:**
- Not applicable.

## Test Structure

No automated tests exist in this codebase. The project was built as a hackathon submission (see `HACKATHON_SUBMISSION.md`) and no unit, integration, or end-to-end tests were written.

## Mocking

**Framework:** None.

No mocking infrastructure exists. The codebase does however contain production mock/simulation code (not test mocks):
- `src/lib/vonage-service.ts` exports `sendSMS` and `makeVoiceCall` as explicit mock functions with simulated 90% success rates and `setTimeout` delays
- `src/lib/message-service.ts` has `simulateMessageSending()` as a fallback when Supabase is not configured
- `src/components/auth-provider.tsx` creates mock user objects (`mockUser`) for demo mode when Supabase is unconfigured

These are runtime fallbacks, not test infrastructure.

## Fixtures and Factories

**Test Data:** None — no test fixtures or factories exist.

**Location:** Not applicable.

## Coverage

**Requirements:** None enforced.

**View Coverage:**
```bash
# Not available — no test runner configured
```

## Test Types

**Unit Tests:** Not present.

**Integration Tests:** Not present.

**E2E Tests:** Not present.

## Manual Testing Infrastructure

While no automated tests exist, the codebase has built-in manual testing support:

**Demo mode** (`src/lib/supabase.ts`):
- `isSupabaseConfigured()` returns `false` when env vars are missing
- All service functions branch into localStorage-backed demo paths
- Auth provider creates mock users stored in `localStorage` under key `exitpal-user`
- Messages stored under `exitpal-messages-{userId}`

**Console-based verification** (`src/lib/supabase.ts`):
- `testSupabaseConnection()` exported for manual connection testing
- Verbose emoji-prefixed logging throughout auth/service layer for tracing

**Standalone test script:**
- `test-vonage.js` at project root — a standalone Node.js script for manually testing the Vonage integration outside of the app

## Adding Tests

If tests are added, the recommended setup based on the existing stack (Vite + React + TypeScript) would be:

**Vitest** (aligns with Vite build tooling):
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `vite.config.ts`:
```typescript
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './src/test/setup.ts',
}
```

**Where to place tests:**
- Unit tests for services: co-locate as `src/lib/message-service.test.ts`
- Component tests: co-locate as `src/components/usage-indicator.test.tsx`
- Page tests: co-locate as `src/pages/DashboardPage.test.tsx`

**Key modules to test first (highest risk, no coverage):**
- `src/lib/message-service.ts` — scheduling logic, localStorage fallback, Supabase branching
- `src/components/auth-provider.tsx` — auth context, demo mode vs Supabase mode
- `src/lib/vonage-service.ts` — `getDailyUsage` limit calculation
- `supabase/functions/send-message/index.ts` — rate limiting, STOP/HELP compliance logic

---

*Testing analysis: 2026-04-01*
