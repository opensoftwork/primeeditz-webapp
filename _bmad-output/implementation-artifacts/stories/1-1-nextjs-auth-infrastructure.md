# Story 1.1: Next.js Auth Infrastructure

Status: ready-for-dev

## Story

As a **Developer**,
I want **to set up the complete Better Auth + Convex integration for Next.js 16**,
So that **the application has a working authentication infrastructure before implementing UI flows**.

## Acceptance Criteria

1. **AC1:** `src/lib/auth-client.ts` exports a properly configured `authClient` with the `convexClient()` plugin
2. **AC2:** `src/lib/auth-server.ts` exports server utilities (`handler`, `preloadAuthQuery`, `isAuthenticated`, `getToken`, `fetchAuthQuery`, `fetchAuthMutation`, `fetchAuthAction`)
3. **AC3:** API route `app/api/auth/[...all]/route.ts` proxies auth requests to Convex
4. **AC4:** `convex/http.ts` registers Better Auth routes via `authComponent.registerRoutes()`
5. **AC5:** Root layout wraps children with `ConvexBetterAuthProvider`
6. **AC6:** Running `pnpm dev` shows no auth-related errors
7. **AC7:** Visiting `/api/auth/sign-in` returns a valid response (not 404)

## Tasks / Subtasks

- [ ] **Task 1: Create auth-client.ts** (AC: 1)

  - [ ] Create `src/lib/auth-client.ts`
  - [ ] Import `createAuthClient` from `better-auth/react`
  - [ ] Import `convexClient` from `@convex-dev/better-auth/client/plugins`
  - [ ] Export configured `authClient`

- [ ] **Task 2: Create auth-server.ts** (AC: 2)

  - [ ] Create `src/lib/auth-server.ts`
  - [ ] Import `convexBetterAuthNextJs` from `@convex-dev/better-auth/nextjs`
  - [ ] Configure with `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`
  - [ ] Export all utilities

- [ ] **Task 3: Create API route handler** (AC: 3)

  - [ ] Create directory `src/app/api/auth/[...all]/`
  - [ ] Create `route.ts` that exports `{ GET, POST } = handler`

- [ ] **Task 4: Verify convex/http.ts** (AC: 4)

  - [ ] Ensure `authComponent.registerRoutes(http, createAuth)` is called
  - [ ] Verify file exports `http` router as default

- [ ] **Task 5: Create ConvexClientProvider** (AC: 5)

  - [ ] Create `src/app/providers.tsx` as "use client" component
  - [ ] Configure `ConvexReactClient` with env URL
  - [ ] Wrap children with `ConvexBetterAuthProvider`
  - [ ] Accept `initialToken` prop for SSR

- [ ] **Task 6: Update root layout** (AC: 5)

  - [ ] Import `ConvexClientProvider` (or `Providers`) component
  - [ ] Wrap `{children}` in provider
  - [ ] Update metadata for PrimeEditz branding

- [ ] **Task 7: Verify setup** (AC: 6, 7)
  - [ ] Run `pnpm dev` - no auth errors
  - [ ] Run `pnpm convex dev` - functions deploy
  - [ ] Test `/api/auth/sign-in` endpoint responds

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
│   │           └── route.ts        ← Task 3
│   ├── layout.tsx                  ← Task 6 (update)
│   └── providers.tsx               ← Task 5 (new)
└── lib/
    ├── auth-client.ts              ← Task 1 (new)
    ├── auth-server.ts              ← Task 2 (new)
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

(To be filled by dev agent)

### Debug Log References

(To be filled by dev agent)

### Completion Notes List

(To be filled by dev agent)

### File List

(To be filled by dev agent)
