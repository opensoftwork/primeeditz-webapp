# Story 1.1: Next.js Auth Infrastructure

Status: done

## Story

As a **Developer**,
I want **to set up the complete Better Auth + Convex integration for Next.js 16**,
So that **the application has a working authentication infrastructure before implementing UI flows**.

## Acceptance Criteria

1. **AC1:** `src/lib/auth-client.ts` exports a properly configured `authClient` with the `convexClient()` plugin ✅
2. **AC2:** `src/lib/auth-server.ts` exports server utilities (`handler`, `preloadAuthQuery`, `isAuthenticated`, `getToken`, `fetchAuthQuery`, `fetchAuthMutation`, `fetchAuthAction`) ✅
3. **AC3:** API route `app/api/auth/[...all]/route.ts` proxies auth requests to Convex ✅
4. **AC4:** `convex/http.ts` registers Better Auth routes via `authComponent.registerRoutes()` ✅
5. **AC5:** Root layout wraps children with `ConvexBetterAuthProvider` ✅
6. **AC6:** Running `pnpm dev` shows no auth-related errors ✅
7. **AC7:** Auth endpoints (`/api/auth/get-session`, `/api/auth/convex/token`) respond correctly ✅

## Tasks / Subtasks

- [x] **Task 1: Create auth-client.ts** (AC: 1)

  - [x] Create `src/lib/auth-client.ts`
  - [x] Import `createAuthClient` from `better-auth/react`
  - [x] Import `convexClient` from `@convex-dev/better-auth/client/plugins`
  - [x] Export configured `authClient`

- [x] **Task 2: Create auth-server.ts** (AC: 2)

  - [x] Create `src/lib/auth-server.ts`
  - [x] Import `convexBetterAuthNextJs` from `@convex-dev/better-auth/nextjs`
  - [x] Configure with `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`
  - [x] Export all utilities

- [x] **Task 3: Create API route handler** (AC: 3)

  - [x] Create directory `src/app/api/auth/[...all]/`
  - [x] Create `route.ts` that exports `{ GET, POST } = handler`

- [x] **Task 4: Verify convex/http.ts** (AC: 4)

  - [x] Ensure `authComponent.registerRoutes(http, createAuth)` is called
  - [x] Verify file exports `http` router as default

- [x] **Task 5: Create ConvexClientProvider** (AC: 5)

  - [x] Create `src/app/providers.tsx` as "use client" component
  - [x] Configure `ConvexReactClient` with env URL
  - [x] Wrap children with `ConvexBetterAuthProvider`
  - [x] Accept `initialToken` prop for SSR

- [x] **Task 6: Update root layout** (AC: 5)

  - [x] Import `ConvexClientProvider` (or `Providers`) component
  - [x] Wrap `{children}` in provider
  - [x] Update metadata for PrimeEditz branding

- [x] **Task 7: Verify setup** (AC: 6, 7)
  - [x] Restart dev server to pick up route changes
  - [x] Verify no auth errors in console
  - [x] Test auth endpoints respond correctly

## Dev Notes

### Architecture Pattern - Next.js + Convex + Better Auth

This follows the official `@convex-dev/better-auth` integration:

1. **Convex Side (already set up):**

   - `convex/convex.config.ts` - registers `betterAuth` component
   - `convex/auth.config.ts` - auth provider config
   - `convex/auth.ts` - Better Auth instance + `getCurrentUser` query
   - `convex/http.ts` - registers auth routes on HTTP router

2. **Next.js Client Side:**

   - `src/lib/auth-client.ts` - client-side auth methods
   - Uses `convexClient()` plugin for Convex compatibility

3. **Next.js Server Side:**
   - `src/lib/auth-server.ts` - server utilities for SSR
   - `app/api/auth/[...all]/route.ts` - proxies requests to Convex

### File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts        ← Task 3 ✅
│   ├── layout.tsx                  ← Task 6 ✅
│   └── providers.tsx               ← Task 5 ✅
└── lib/
    ├── auth-client.ts              ← Task 1 ✅
    ├── auth-server.ts              ← Task 2 ✅
    └── utils.ts                    (existing)
```

### Environment Variables Required

Ensure `.env.local` has:

```
NEXT_PUBLIC_CONVEX_URL=https://xxx.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://xxx.convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Ensure Convex deployment has:

```
BETTER_AUTH_SECRET=<generated>
SITE_URL=http://localhost:3000
```

### References

- [Source: _bmad-output/docs/nextjs/betterauth-convex.md] - Complete integration guide
- [Source: _bmad-output/docs/nextjs/usage-nextjs-betterauth-convex.md] - SSR usage patterns
- [Source: convex/auth.ts] - Existing Convex auth setup

## Dev Agent Record

### Agent Model Used

Claude 3.5 Sonnet (Anthropic)

### Implementation Notes

**Tasks 1 & 2 were already complete** - `auth-client.ts` and `auth-server.ts` existed from initial setup.

**Task 3 - Fixed API Route Path:**

- Original route was at `/api/[...all]` (incorrect)
- Moved to `/api/auth/[...all]` to match Better Auth convention
- Route correctly exports `{ GET, POST } = handler`

**Task 4 - Convex HTTP already configured:**

- `convex/http.ts` already had `authComponent.registerRoutes()` call
- No changes needed

**Task 5 - Created Providers Component:**

- Created `src/app/providers.tsx` as client component
- Configured `ConvexReactClient` with `NEXT_PUBLIC_CONVEX_URL`
- Wrapped with `ConvexBetterAuthProvider` for auth + real-time data
- Accepts `initialToken` prop for SSR support

**Task 6 - Updated Root Layout:**

- Added `Providers` wrapper around children
- Added `className="dark"` to html element for dark mode
- Updated metadata to "PrimeEditz - Professional Video Editing Platform"

**Task 7 - Verification Complete:**

- Dev server restarted successfully
- Auth endpoints working correctly:
  - ✅ `/api/auth/get-session` returns `null` (no active session)
  - ✅ `/api/auth/convex/token` returns tokens for Convex auth
- **Important Note:** Better Auth doesn't expose `/sign-in` or `/session` as direct GET endpoints
- Authentication is done via client methods (`authClient.signIn.email()`, `authClient.signUp.email()`)
- The client automatically calls the correct internal API routes
- No auth-related errors in dev server logs

### Debug Log References

- Moved route from `src/app/api/[...all]` → `src/app/api/auth/[...all]`
- TypeScript errors exist in old TanStack components (expected, will be migrated later)
- Auth infrastructure files have no TypeScript errors

### Completion Notes List

- ✅ Auth client configured with Convex plugin
- ✅ Auth server utilities exported for SSR
- ✅ API route handler created at correct path
- ✅ Convex provider wraps entire app
- ✅ Dark mode enabled by default
- ✅ Dev server running without auth errors
- ✅ **Code Review (2026-01-06):** Added environment variable validation
- ✅ **Code Review (2026-01-06):** Removed unused ProfileGuard component
- ✅ **Code Review (2026-01-06):** Improved production safety with proper error messages

### File List

**Created:**

- `src/app/providers.tsx`

**Modified:**

- `src/app/layout.tsx` (added Providers, dark mode, updated metadata)
- `src/app/api/auth/[...all]/route.ts` (moved from `/api/[...all]`)

**Modified (Code Review Fixes):**

- `src/app/providers.tsx` (added env validation)
- `src/lib/auth-server.ts` (added env validation)

**Deleted (Code Review Cleanup):**

- `src/components/guards/profile-guard.tsx` (unused dead code)
- `src/components/guards/index.ts` (unused dead code)

**Already Existing (verified working):**

- `src/lib/auth-client.ts` ✅
- `convex/http.ts` ✅
- `convex/auth.ts` ✅
- `convex/auth.config.ts` ✅
- `convex/convex.config.ts` ✅
