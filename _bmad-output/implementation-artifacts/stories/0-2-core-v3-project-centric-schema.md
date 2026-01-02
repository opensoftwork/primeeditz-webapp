# Story 0.2: Core v3.0 Project-Centric Schema

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Developer**,
I want to define the complete database schema for the v3.0 project-centric model,
so that all data structures are in place from the beginning.

## Acceptance Criteria

1. **AC-1:** Auth tables must exist: `users`, `sessions`, `accounts`, `verifications` (Better Auth compatible)
2. **AC-2:** Core tables must exist: `profiles`, `projects`, `project_types`, `stages`, `quotations`
3. **AC-3:** Asset tables must exist: `folders`, `assets`, `deliverables`
4. **AC-4:** Audit table must exist: `status_history`
5. **AC-5:** `projects` table must include a `source` field (`client_request` vs `admin_init`)
6. **AC-6:** Relevant indexes must be created for `by_userId`, `by_projectId`, `by_status`, `by_clientId`

## Tasks / Subtasks

- [x] **Task 1: Clear Placeholder Schema** (Preparation)

  - [x] 1.1 Remove existing `products` and `todos` tables from `convex/schema.ts`
  - [x] 1.2 Ensure Convex dev server is running to validate changes

- [x] **Task 2: Auth Tables (Better Auth)** (AC: #1)

  - [x] 2.1 Define `users` table with fields: `email`, `name`, `image`, `emailVerified`, `createdAt`, `updatedAt`
  - [x] 2.2 Define `sessions` table with fields: `userId`, `token`, `expiresAt`, `ipAddress`, `userAgent`
  - [x] 2.3 Define `accounts` table with fields: `userId`, `provider`, `providerAccountId`, `accessToken`, `refreshToken`
  - [x] 2.4 Define `verifications` table with fields: `identifier`, `token`, `expiresAt`
  - [x] 2.5 Add indexes: `by_userId`, `by_token`, `by_email`

- [x] **Task 3: Profile Table** (AC: #2)

  - [x] 3.1 Define `profiles` table with fields (using \_creationTime for created)
  - [x] 3.2 Add indexes: `by_userId`, `by_role`

- [x] **Task 4: Project Tables** (AC: #2, #5)

  - [x] 4.1 Define `project_types` table
  - [x] 4.2 Define `projects` table with `source` field
  - [x] 4.3 Add indexes: `by_clientId`, `by_status`, `by_code`, `by_projectTypeId`

- [x] **Task 5: Quotation Table** (AC: #2)

  - [x] 5.1 Define `quotations` table with lineItems array
  - [x] 5.2 Add indexes: `by_projectId`, `by_status`

- [x] **Task 6: Storage Tier Table** (AC: #2)

  - [x] 6.1 Define `storage_tiers` table

- [x] **Task 7: Folder & Asset Tables** (AC: #3)

  - [x] 7.1 Define `folder_templates` table
  - [x] 7.2 Define `folders` table
  - [x] 7.3 Define `assets` table
  - [x] 7.4 Add indexes: `by_projectId`, `by_folderId`

- [x] **Task 8: Deliverable Table** (AC: #3)

  - [x] 8.1 Define `deliverables` table
  - [x] 8.2 Add indexes: `by_projectId`, `by_status`

- [x] **Task 9: Status History Table** (AC: #4)

  - [x] 9.1 Define `status_history` table
  - [x] 9.2 Add index: `by_projectId`

- [x] **Task 10: Validation** (All ACs)
  - [x] 10.1 Run `npx convex dev` to deploy schema
  - [x] 10.2 Verify all tables appear in Convex dashboard
  - [x] 10.3 Run TypeScript check: `pnpm exec tsc --noEmit`

## Dev Notes

### Schema Optimization

- **Removed `createdAt`** from custom tables — Convex provides `_creationTime` automatically
- **Kept `createdAt`/`updatedAt`** in Better Auth tables for compatibility
- **Kept `updatedAt`** in tables that need update tracking (profiles, projects, quotations)
- Used reusable validators for status enums and role types

### Tables Created (14 total)

| Category   | Tables                                                               |
| ---------- | -------------------------------------------------------------------- |
| **Auth**   | `users`, `sessions`, `accounts`, `verifications`                     |
| **Core**   | `profiles`, `projectTypes`, `projects`, `storageTiers`, `quotations` |
| **Assets** | `folderTemplates`, `folders`, `assets`, `deliverables`               |
| **Audit**  | `statusHistory`                                                      |

### Indexes Created (20 total)

- `users`: `by_email`
- `sessions`: `by_userId`, `by_token`
- `accounts`: `by_userId`, `by_provider`
- `verifications`: `by_identifier`, `by_token`
- `profiles`: `by_userId`, `by_role`
- `projectTypes`: `by_category`
- `projects`: `by_clientId`, `by_status`, `by_code`, `by_projectTypeId`, `by_assignedEmployeeId`
- `quotations`: `by_projectId`, `by_status`
- `folders`: `by_projectId`
- `assets`: `by_projectId`, `by_folderId`
- `deliverables`: `by_projectId`, `by_status`
- `statusHistory`: `by_projectId`

### References

- [Source: architecture/04-implementation-patterns.md#Convex File Structure]
- [Source: epics/00-foundation.md#Story 0.2]

## Dependencies

- **Story 0.1** (Environment Setup) — Must have Convex Cloud connected ✓

## Definition of Done

- [x] All 14 tables defined in `convex/schema.ts`
- [x] All required indexes created
- [x] Schema deploys without errors
- [x] TypeScript compiles without errors
- [x] Tables visible in Convex dashboard

## Dev Agent Record

### Agent Model Used

Claude (Gemini Antigravity)

### Debug Log References

- Deleted `convex/todos.ts` (leftover from scaffolding)
- Schema deploys automatically via `npx convex dev`
- TypeScript check: `pnpm exec tsc --noEmit` — ✓ No errors

### Completion Notes List

- Removed redundant `createdAt` fields per user feedback (Convex provides `_creationTime`)
- Used reusable validators for enums (roleValidator, projectStatusValidator, etc.)
- Line items for quotations use nested object validator
- `typeSpecificDetails` uses `v.any()` for dynamic project-type data

### Change Log

| Date       | Change                                  | Author    |
| ---------- | --------------------------------------- | --------- |
| 2025-12-30 | Story created via create-story workflow | SM Agent  |
| 2025-12-30 | Implemented complete schema             | Dev Agent |
| 2025-12-30 | Removed redundant createdAt fields      | Dev Agent |

### File List

**Modified:**

- `convex/schema.ts` (full rewrite - 250 lines)

**Deleted:**

- `convex/todos.ts` (cleanup)
