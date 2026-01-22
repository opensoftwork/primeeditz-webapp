# Story 0.2: Core v3.0 Project-Centric Schema (Migrated)

Status: done

## Story

As a **Developer**,
I want to migrate and verify the complete database schema for the v3.0 project-centric model,
so that all data structures are consistent in the new Next.js 16 project.

## Acceptance Criteria

1. **AC-1:** All 14 tables successfully migrated to the new Convex deployment.
2. **AC-2:** All 20 indexes active and validated.
3. **AC-3:** Better Auth compatibility verified in the new schema.
4. **AC-4:** TypeScript types generated for the entire schema in the new project.

## Tasks / Subtasks

- [x] **Task 1: Schema Migration**

  - [x] 1.1 Copy `convex/schema.ts` to the new project
  - [x] 1.2 Run `npx convex dev` to deploy and verify the schema

- [x] **Task 2: Type Verification**
  - [x] 2.1 Verify `convex/_generated/dataModel.d.ts` is correctly generated
  - [x] 2.2 Ensure No TypeScript errors in schema-dependent files

## Dev Notes

### Schema Portability

The Convex schema is 100% portable between TanStack Start and Next.js. No changes to the logic were required for migration.

## Dependencies

- **Story 0.1** (Infrastructure)

## Definition of Done

- [x] Tables visible in Convex dashboard.
- [x] TypeScript check passes.
