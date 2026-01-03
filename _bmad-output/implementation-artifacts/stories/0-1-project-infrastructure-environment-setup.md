# Story 0.1: Project Infrastructure & Environment Setup (Next.js 16)

Status: done

## Story

As a **Developer**,
I want to configure the Next.js 16 development environment with Convex Cloud and MinIO,
so that I have a stable foundation for building feature logic.

## Acceptance Criteria

1. **AC-1:** Convex Cloud connected via `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL`.
2. **AC-2:** `NEXT_PUBLIC_CONVEX_SITE_URL` set for Better Auth proxy functionality.
3. **AC-3:** MinIO credentials configured in `.env.local`.
4. **AC-4:** `NEXT_PUBLIC_SITE_URL` and `BETTER_AUTH_SECRET` configured for authentication.
5. **AC-5:** `pnpm dev` starts the Next.js 16 server without errors.

## Tasks / Subtasks

- [x] **Task 1: Next.js 16 Project Initialization**

  - [x] 1.1 Initialize Next.js 16 with App Router, TypeScript, and Tailwind v4
  - [x] 1.2 Configure Biome for linting and formatting

- [x] **Task 2: Convex Configuration** (AC: #1, #2)

  - [x] 2.1 Set up `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`
  - [x] 2.2 Verify `npx convex dev` connects to the correct deployment
  - [x] 2.3 Ensure schema is deployed and active

- [x] **Task 3: Auth Environment Variables** (AC: #4)

  - [x] 3.1 Configure `BETTER_AUTH_SECRET` in Convex and `.env.local`
  - [x] 3.2 Set `NEXT_PUBLIC_SITE_URL` to `http://localhost:3000`

- [x] **Task 4: MinIO Integration** (AC: #3)

  - [x] 4.1 Migrate MinIO environment variables from the previous project
  - [x] 4.2 Verify credentials in `.env.local`

- [x] **Task 5: Verification** (AC: #5)
  - [x] 5.1 Run `pnpm dev` and verify no startup errors
  - [x] 5.2 Verify Tailwind v4 is correctly processing styles

## Dev Notes

### Key Environment Variables (Next.js 16)

```bash
# .env.local
CONVEX_DEPLOYMENT=...
NEXT_PUBLIC_CONVEX_URL=https://...
NEXT_PUBLIC_CONVEX_SITE_URL=https://...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
BETTER_AUTH_SECRET=...
MINIO_ENDPOINT=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
```

### Framework Shift (TanStack Start → Next.js 16)

The migration requires renaming public variables from `VITE_` to `NEXT_PUBLIC_` and aligning with the Next.js 16 App Router structure.

## Dependencies

- **None** - Foundation story.

## Definition of Done

- [x] All environment variables are correctly named and set.
- [x] Next.js server starts and renders the landing page.
- [x] Convex deployment is active.

## Dev Agent Record

### Agent Model Used

Claude (Antigravity)

### Completion Notes List

- Successfully initialized Next.js 16 project.
- Environment variables migrated and renamed for Next.js.
- Verified Convex connection.
