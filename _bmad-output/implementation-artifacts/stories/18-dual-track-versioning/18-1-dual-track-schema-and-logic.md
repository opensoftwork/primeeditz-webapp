# Story 18-1: Dual-Track Schema and Logic

**Epic**: Epic 18 - Dual-Track Versioning System
**Status**: in_progress
**Complexity**: Medium (5 points)
**Created**: 2026-02-13
**Priority**: MUST — Core logic for version separation

---

## 📋 User Story

**As an** admin,
**I want** separate internal and external version counters for deliverables,
**So that** studio users only see the "Client Versions" (v1, v2...) while internal QC cycles remain hidden.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                      | Status  | Notes                                   |
| ------------------------------- | ------- | --------------------------------------- |
| **Epic 16 - Revision Workflow** | ✅ Done | Base versioning-in-place infrastructure |

---

## ✅ Acceptance Criteria

### AC1: Schema Migration

- [ ] Add `studioVersion` (optional number) to `deliverables` table.
- [ ] Add `studioVersionNumber` (optional number) to `deliverableVersions` table.
- [ ] Add `scope` (literal: "internal" | "external") to `deliverableVersions` table.
- [ ] Create index `by_scope` on `deliverableVersions`.

### AC2: "Send to Studio" Logic Update

- [ ] Update `sendToStudio` mutation to:
  - Increment `studioVersion` on the deliverable (initially set to 1).
  - Update the current `deliverableVersions` entry (pointed by `latestVersionId`) with `scope: "external"` and the new `studioVersionNumber`.
  - If no `studioVersion` exists, set it to 1. If it exists, increment by 1.

### AC3: Internal Upload Logic

- [ ] Ensure `uploadDeliverable` and `uploadCorrectedVersion` mutations:
  - Only increment the internal `version` counter.
  - Create `deliverableVersions` entries with `scope: "internal"` by default.
  - Do NOT modify `studioVersion`.

### AC4: Studio Query Filtering

- [ ] Update `getClientDeliverables` to return `studioVersion` as the primary version number.
- [ ] Filter associated version history for studio view (handled in story 18-3, but query should support it).

---

## 📘 Implementation Plan

### Phase A: Schema Updates (`convex/schema.ts`)

1. Add `studioVersion: v.optional(v.number())` to `deliverables`.
2. Add `studioVersionNumber: v.optional(v.number())` to `deliverableVersions`.
3. Add `scope: v.optional(v.union(v.literal("internal"), v.literal("external")))` to `deliverableVersions`.
4. Add index `by_scope` to `deliverableVersions`.

### Phase B: Mutation Logic (`convex/functions/deliverables/mutations.ts`)

1. **`uploadDeliverable`**:
   - Set `scope: "internal"` for the first version record.
2. **`uploadCorrectedVersion`**:
   - Set `scope: "internal"` for new version records.
3. **`sendToStudio`**:
   - Check current `studioVersion`.
   - New `studioVersion` = (current || 0) + 1.
   - Patch deliverable with new `studioVersion`.
   - Find the `deliverableVersions` record associated with `latestVersionId`.
   - Patch it with `scope: "external"` and `studioVersionNumber: newStudioVersion`.

### Phase C: Data Retrieval (`convex/functions/deliverables/queries.ts`)

1. **`getClientDeliverables`**:
   - Map `studioVersion` to the `version` field in the return object (or add `studioVersion` explicitly).
2. **`getDeliverableVersions`**:
   - Add a `scope` argument to allow filtering by `internal` vs `external`.

---

## 🚀 Definition of Done

- [ ] Schema successfully pushed to Convex.
- [ ] `sendToStudio` correctly initializes and increments `studioVersion`.
- [ ] Employee uploads do not increment `studioVersion`.
- [ ] Admin can see both version numbers in query results.
