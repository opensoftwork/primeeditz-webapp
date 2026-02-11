# Epic 11A: Schema & Data Foundation

**Parent Epic**: [11: System Architecture Revamp](./11-system-restructuring-revamp.md)  
**Status**: Ready for Development  
**Created**: 2026-01-23  
**Complexity**: Medium  
**Estimated Points**: 13

---

## 📋 Epic Summary

This foundational epic prepares the Convex schema and seed data for the new quotation-driven architecture. All changes are designed to be **backward compatible** with existing data.

---

## 🎯 User Outcomes

| Role          | Outcome                                                             |
| :------------ | :------------------------------------------------------------------ |
| **Developer** | Schema supports quotation → project linking                         |
| **Admin**     | Folder templates have event-type variants                           |
| **System**    | Profiles can use either `client` or `studio` role during transition |

---

## 📝 User Stories

### Story 11A.1: Add `quotationId` to Projects Schema

**Points**: 2

**As a** Developer,  
**I want** the `projects` table to have an optional `quotationId` field,  
**So that** spawned projects can reference their parent quotation.

**Acceptance Criteria**:

- [ ] Add `quotationId: v.optional(v.id('quotations'))` to `projects` schema.
- [ ] Add index `by_quotationId`.
- [ ] Existing projects have `quotationId = undefined` (no backfill needed).
- [ ] Run `npx convex dev` and confirm no breaking changes.

**Technical Notes**:

- File: `convex/schema.ts`
- No migration script needed; field is optional.

---

### Story 11A.2: Enhance Quotation Template Line Items

**Points**: 3

**As an** Admin,  
**I want** quotation template line items to specify project creation rules,  
**So that** the system knows which items should spawn projects.

**Acceptance Criteria**:

- [ ] Update `quotationTemplates.lineItems` validator to include:
  - `spawnsProject: v.optional(v.boolean())`
  - `projectTypeId: v.optional(v.id('projectTypes'))`
  - `selectedFolderTemplateId: v.optional(v.id('folderTemplates'))`
- [ ] Existing templates continue to function (new fields are optional).
- [ ] Update seed files to include `spawnsProject: true` for core service items.

**Technical Notes**:

- File: `convex/schema.ts` (line ~353)
- File: `convex/seeds/quotationTemplates.ts`

---

### Story 11A.3: Add Variant Metadata to Folder Templates

**Points**: 2

**As an** Admin,  
**I want** folder templates to have `variant` and `description` fields,  
**So that** I can distinguish between "Hindu Wedding", "Christian Wedding", etc.

**Acceptance Criteria**:

- [ ] Add to `folderTemplates` schema:
  - `variant: v.optional(v.string())`
  - `description: v.optional(v.string())`
- [ ] Update admin UI (if exists) to display variant in list.
- [ ] Existing templates continue to function.

**Technical Notes**:

- File: `convex/schema.ts` (line ~268)

---

### Story 11A.4: Event-Based Folder Template Seeding

**Points**: 3

**As a** Developer,  
**I want** seed data to reflect event-based folder naming,  
**So that** the system starts with realistic templates.

**Acceptance Criteria**:

- [ ] Update `convex/seeds/folderTemplates.ts` with new templates:
  - "Hindu Wedding - Brahmin" → `["Naandi", "Muhurtham", "Grihapravesham", "Reception", "Pre-Wedding"]`
  - "Christian Wedding" → `["Church Ceremony", "Reception", "Couple Portraits", "Pre-Wedding"]`
  - "YouTube Content" → `["A-Roll", "B-Roll", "Audio", "Assets", "Thumbnails"]`
- [ ] Set `variant` field appropriately.
- [ ] Retain generic "General Project" template as fallback.
- [ ] Remove workflow-focused folders (WIP, Drafts, etc.) from event templates.

**Technical Notes**:

- File: `convex/seeds/folderTemplates.ts`
- Run seed command after changes.

---

### Story 11A.5: Introduce `studio` Role

**Points**: 1

**As a** Developer,  
**I want** to add `studio` to the role validator,  
**So that** we can migrate users gradually.

**Acceptance Criteria**:

- [ ] Update `roleValidator` in `schema.ts`:
  ```typescript
  export const roleValidator = v.union(
    v.literal("client"), // Keep for now
    v.literal("studio"), // NEW
    v.literal("employee"),
    v.literal("admin"),
  );
  ```
- [ ] Update `clientMutation`/`clientQuery` guards to accept both `client` and `studio`.
- [ ] Confirm existing login/onboarding still works.

**Technical Notes**:

- File: `convex/schema.ts`
- File: `convex/lib/customFunctions.ts`

---

### Story 11A.6: Create Client-to-Studio Migration

**Points**: 2

**As an** Admin,  
**I want** an internal mutation to migrate existing `client` profiles to `studio`,  
**So that** we can complete the terminology transition.

**Acceptance Criteria**:

- [ ] Create `migrateClientToStudio` in `convex/functions/migrations.ts`.
- [ ] Mutation must:
  - Query all profiles with `role = 'client'`
  - Patch each to `role = 'studio'`
  - Return count of migrated profiles.
- [ ] Log migration event.
- [ ] This is an internal mutation, not exposed in API.

**Technical Notes**:

- New file: `convex/functions/migrations.ts`
- Run manually via Convex dashboard or CLI.

---

## ✅ Definition of Done

- [ ] All schema changes applied without errors.
- [ ] Seed data reflects new folder template structure.
- [ ] Existing projects, quotations, and profiles are unaffected.
- [ ] Dev environment starts successfully.
- [ ] Unit tests (if any) pass.

---

## 🔗 Dependencies

| Depends On | Notes                                  |
| :--------- | :------------------------------------- |
| None       | This is the first epic in the sequence |

| Blocks                         |
| :----------------------------- |
| Epic 11B (Quotation Engine)    |
| Epic 11C (Studio Portal)       |
| Epic 11D (Terminology Cleanup) |

---

_Document Version: 1.0_  
_Last Updated: 2026-01-23_
