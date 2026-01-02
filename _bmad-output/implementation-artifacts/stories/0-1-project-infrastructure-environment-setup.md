# Story 0.1: Project Infrastructure & Environment Setup

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Developer**,
I want to configure the development environment with Convex Cloud and existing MinIO,
so that I have a stable foundation for building feature logic.

## Acceptance Criteria

1. **AC-1:** Convex Cloud must be connected via `CONVEX_DEPLOYMENT` and `CONVEX_URL` in `.env.local`.
2. **AC-2:** MinIO connection (already on Dokploy) must be configured via `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`.
3. **AC-3:** `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` must be set.
4. **AC-4:** `pnpm dev` must start the application without errors.

## Tasks / Subtasks

- [x] **Task 1: Convex Cloud Setup** (AC: #1)

  - [x] 1.1 Create new Convex project at dashboard.convex.dev
  - [x] 1.2 Run `npx convex dev` to link project and get deployment URL
  - [x] 1.3 Add `CONVEX_DEPLOYMENT` and `CONVEX_URL` to `.env.local`
  - [x] 1.4 Verify Convex connection with existing schema

- [x] **Task 2: MinIO Environment Variables** (AC: #2)

  - [x] 2.1 Get MinIO credentials from existing Dokploy deployment
  - [x] 2.2 Add MinIO credentials to `.env.local`
  - [x] 2.3 Create `primeeditz` bucket if not exists

- [x] **Task 3: Better Auth Configuration** (AC: #3)

  - [x] 3.1 Generate `BETTER_AUTH_SECRET`
  - [x] 3.2 Set `BETTER_AUTH_URL` to `http://localhost:3000`
  - [x] 3.3 Add both to `.env.local`

- [x] **Task 4: Verify Development Environment** (AC: #4)

  - [x] 4.1 Run `pnpm install` to ensure all dependencies are installed
  - [x] 4.2 Run `pnpm dev` and verify no errors
  - [x] 4.3 Verify Convex dashboard shows connected deployment
  - [x] 4.4 Document any issues encountered and resolutions

- [ ] **Task 5: Create .env.example** (Best practice - optional)
  - [ ] 5.1 Create `.env.example` with all required variables (without values)
  - [ ] 5.2 Update README.md with environment setup instructions

## Dev Notes

### Environment Variables Required

```bash
# .env.local (NEVER commit this file)

# Convex Cloud
CONVEX_DEPLOYMENT=<your-convex-deployment-id>
CONVEX_URL=https://<your-deployment>.convex.cloud

# MinIO (existing on Dokploy)
MINIO_ENDPOINT=<your-minio-endpoint>
MINIO_ACCESS_KEY=<your-access-key>
MINIO_SECRET_KEY=<your-secret-key>

# Better Auth
BETTER_AUTH_SECRET=<32+-character-random-string>
BETTER_AUTH_URL=http://localhost:3000
```

### Convex Cloud vs Self-Hosted Decision

Per architecture review, **Convex Cloud** was chosen for MVP instead of self-hosted:

- Simpler setup, no Docker/PostgreSQL management
- Free tier sufficient for MVP
- Can migrate to self-hosted in Phase 2 if needed

## Dependencies

- **None** - This is the first story in Epic 0

## Definition of Done

- [x] All environment variables are set in `.env.local`
- [x] `pnpm dev` runs without errors
- [x] Convex dashboard shows active deployment
- [ ] `.env.example` created with documented variables (optional)
- [ ] README updated with setup instructions (optional)

## Dev Agent Record

### Agent Model Used

Manual setup by user + Claude (Gemini Antigravity) assistance

### Debug Log References

- Convex dev server running: `npx convex dev`
- Frontend dev server running: `pnpm dev`
- Both running for 1h45m+ during Epic 0 session

### Completion Notes List

- User manually configured environment variables
- Convex Cloud successfully connected
- Schema deployed (14 tables, 20 indexes)
- Dev servers running without errors

### Change Log

| Date       | Change                                     | Author    |
| ---------- | ------------------------------------------ | --------- |
| 2025-12-30 | Story created via create-story workflow    | SM Agent  |
| 2025-12-30 | Infrastructure setup completed by user     | User      |
| 2025-12-30 | Marked as done after verifying env working | Dev Agent |

### File List

**Created/Modified by user:**

- `.env.local` (not committed - contains secrets)
