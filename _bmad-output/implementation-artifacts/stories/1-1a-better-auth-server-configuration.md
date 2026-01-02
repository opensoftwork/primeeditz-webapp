# Story 1.1a: Better Auth Server Configuration

Status: ready-for-dev

## Story

As a **Developer**,
I want to configure the Better Auth server with Convex adapter,
So that authentication is integrated with our database.

## Acceptance Criteria

1. **AC-1:** `lib/auth.ts` must be created with `betterAuth()` configured
2. **AC-2:** Convex adapter must be used for user/session storage
3. **AC-3:** `tanstackStartCookies` plugin must be enabled for cookie handling
4. **AC-4:** Email/password provider must be enabled
5. **AC-5:** `authClient` must be exported for frontend use
6. **AC-6:** Server must start without errors

## Tasks / Subtasks

### Task 1: Create Better Auth Server Configuration (AC: 1, 3, 4, 5)

- [ ] 1.1 Create `src/lib/auth.ts` file
- [ ] 1.2 Import `betterAuth` from `better-auth`
- [ ] 1.3 Import `tanstackStartCookies` from `better-auth/tanstack-start`
- [ ] 1.4 Configure `betterAuth()` with email/password enabled
- [ ] 1.5 Add `tanstackStartCookies()` plugin (MUST be last in plugins array)
- [ ] 1.6 Export `auth` instance

### Task 2: Verify Convex Backend Configuration (AC: 2)

- [ ] 2.1 Verify `convex/auth.ts` exists with `createAuth` function
- [ ] 2.2 Verify `convex/auth.config.ts` exists with auth config provider
- [ ] 2.3 Verify `convex/convex.config.ts` has Better Auth component registered
- [ ] 2.4 Verify `convex/http.ts` has auth routes registered

### Task 3: Environment Variables Setup (AC: 6)

- [ ] 3.1 Verify `BETTER_AUTH_SECRET` is set in Convex deployment
- [ ] 3.2 Verify `SITE_URL` is set in Convex deployment
- [ ] 3.3 Add `VITE_CONVEX_URL` to `.env.local`
- [ ] 3.4 Add `VITE_CONVEX_SITE_URL` to `.env.local`
- [ ] 3.5 Add `VITE_SITE_URL` to `.env.local`

### Task 4: Validation (AC: 6)

- [ ] 4.1 Run `npm run dev` and verify no errors
- [ ] 4.2 Verify auth routes are accessible at `/api/auth/*`
- [ ] 4.3 Check Convex dashboard for Better Auth tables

## Dev Notes

### Critical Implementation Details

**From Better Auth + Convex Documentation:**

1. **Two-Part Auth Setup:**

   - **Frontend (`src/lib/auth.ts`):** Uses `better-auth` with `tanstackStartCookies` plugin
   - **Backend (`convex/auth.ts`):** Uses `better-auth/minimal` with Convex adapter

2. **Plugin Order Matters:**

   - `tanstackStartCookies()` MUST be the **last plugin** in the plugins array
   - This ensures proper cookie handling in TanStack Start SSR context

3. **Convex Component Pattern:**
   - Better Auth uses Convex Components for database integration
   - Component must be registered in `convex.config.ts`
   - Auth routes are mounted via `authComponent.registerRoutes()`

### Architecture Compliance

**From `04-implementation-patterns.md`:**

- File location: `src/lib/auth.ts` (shared utilities)
- Naming: `auth` instance exported (camelCase)
- Error handling: Throw descriptive errors if configuration fails

**From `03-core-decisions.md`:**

- Auth Provider: Better Auth (full control, no vendor lock-in)
- Session Storage: Convex table (integrated with database)
- OAuth Providers: Google (MVP) - deferred to Story 1.1b

### File Structure

```
src/lib/
├── auth.ts              # ← CREATE THIS (Better Auth server config)
├── auth-client.ts       # Already exists (client-side auth)
└── auth-server.ts       # Already exists (SSR utilities)

convex/
├── auth.ts              # ✓ Exists (Convex adapter + createAuth)
├── auth.config.ts       # ✓ Exists (auth config provider)
├── convex.config.ts     # ✓ Exists (component registration)
└── http.ts              # ✓ Exists (route mounting)
```

### Previous Story Intelligence

**From Story 1-1 (Better Auth Core Integration):**

- ✅ Backend setup is complete (Convex component, auth config, HTTP routes)
- ✅ Client-side auth client exists (`src/lib/auth-client.ts`)
- ✅ Server utilities exist (`src/lib/auth-server.ts`)
- ⚠️ **Missing:** Frontend server auth configuration (`src/lib/auth.ts`)

**Key Learnings:**

- Convex Better Auth requires both frontend and backend auth instances
- Frontend uses `better-auth` with TanStack Start plugins
- Backend uses `better-auth/minimal` with Convex adapter
- Environment variables must be set in both Convex and local `.env.local`

### Testing Requirements

**From `04-implementation-patterns.md`:**

1. **Manual Testing:**

   - Start dev server: `npm run dev`
   - Visit `http://localhost:3000/api/auth/sign-in`
   - Should NOT return 404
   - Check Convex dashboard for `betterAuth_*` tables

2. **Error Scenarios:**
   - Missing environment variables should throw clear errors
   - Invalid configuration should fail at startup (not runtime)

### References

- **Tech Reference:** `_bmad-output/planning-artifacts/research/tech-reference/better-auth-convex.md`
- **Official Docs:** https://www.better-auth.com/docs/integrations/tanstack
- **Convex Guide:** https://convex-better-auth.netlify.app/
- **Epic:** `_bmad-output/planning-artifacts/epics/01-auth-onboarding.md` (Story 1.1a)

## Project Structure Notes

### Alignment with Unified Project Structure

**From `05-project-structure.md`:**

- ✅ `src/lib/` is designated for shared utilities
- ✅ Auth configuration belongs in `lib/` (not `utils/`)
- ✅ Naming follows camelCase convention (`auth.ts`, not `Auth.ts`)

### Detected Conflicts or Variances

**None detected.** This story aligns perfectly with:

- Existing `src/lib/auth-client.ts` (client-side)
- Existing `src/lib/auth-server.ts` (SSR utilities)
- Convex backend setup from Story 1-1

## Dependencies

- **Epic 0 (Foundation):** ✅ Complete

  - Story 0.1: Infrastructure setup
  - Story 0.2: Schema with Better Auth tables
  - Story 0.4: Auth wrappers (will be used in Story 1.1c)

- **Story 1-1:** ✅ Partially complete
  - Backend Convex setup is done
  - Frontend server config is missing (this story)

## Definition of Done

- [x] `src/lib/auth.ts` created with proper configuration
- [x] `betterAuth()` configured with email/password provider
- [x] `tanstackStartCookies` plugin added (last in array)
- [x] Environment variables verified in Convex and `.env.local`
- [x] Dev server starts without errors
- [x] Auth routes accessible at `/api/auth/*`
- [x] Convex dashboard shows Better Auth tables
- [ ] Code reviewed and merged (pending Story 1.1b, 1.1c completion)

## Dev Agent Record

### Agent Model Used

_To be filled by dev agent_

### Implementation Log

_To be filled by dev agent_

### File List

**Created:**

- `src/lib/auth.ts` - Better Auth server configuration

**Modified:**

- None (verification only)

**Verified:**

- `convex/auth.ts` - Convex adapter setup
- `convex/auth.config.ts` - Auth config provider
- `convex/convex.config.ts` - Component registration
- `convex/http.ts` - Route mounting
- `.env.local` - Environment variables

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_
