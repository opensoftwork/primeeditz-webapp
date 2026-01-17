# Story 3-12: Link Project to Existing Quotation

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: ready-for-dev  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-17  
**Priority**: HIGH — Required for folder setup workflow improvement
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** to link a project to an existing approved quotation for the same client,  
**So that** I can setup folders and allocate storage from the quotation's approved budget.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On           | Status  | Notes                          |
| -------------------- | ------- | ------------------------------ |
| Quotations exist     | ✅ Done | Quotation system in Epic 4     |
| Client approval flow | ✅ Done | 4-8: Client Accept Quotation   |
| Project detail page  | ✅ Done | 3-3: Admin Project Detail View |

### Enables

| Story                                | Notes                                       |
| ------------------------------------ | ------------------------------------------- |
| **3-4: Project Stage/Folder Setup**  | Can now setup folders with linked quotation |
| **3-14: Enhanced Folder Setup Flow** | Multi-step flow with quotation selection    |

---

## 🎯 Problem Statement

**Current Friction:**

- Admin creates project for client
- Must create NEW quotation specifically for that project
- Client must approve that specific quotation
- Only THEN can admin setup folders

**New Flow:**

- Client already has approved quotation(s) with storage budget
- Admin creates project → Links to existing approved quotation
- Admin can immediately setup folders using quotation's storage pool

---

## ✅ Acceptance Criteria

### AC1: Link to Quotation Button

- [x] Project detail shows "Link to Quotation" button
- [ ] Button visible when:
  - Project has NO linked quotation OR
  - Project has quotation but it's not approved
- [ ] Button disabled when project already has approved, linked quotation

### AC2: Link to Quotation Drawer

- [ ] Clicking "Link to Quotation" opens drawer
- [ ] Shows client's approved quotations (same clientId)
- [ ] Each quotation displays:
  - Quotation code (e.g., QT-2026-00012)
  - Total value
  - Storage tier / total storage
  - Storage remaining (not allocated to other projects)
  - Approval date
- [ ] Can select and confirm linking

### AC3: Quotation Linking Mutation

- [ ] `linkProjectToQuotation` mutation:
  - Input: projectId, quotationId
  - Validates quotation belongs to same client
  - Validates quotation is approved
  - Updates project.quotationId (or similar linkage)
- [ ] Returns success/error

### AC4: Post-Link State

- [ ] Project detail shows linked quotation info
- [ ] "Link to Quotation" button changes to "View Quotation"
- [ ] "Setup Folders" button becomes enabled

---

## 📘 Implementation Tasks

### Phase A: Backend (~2 points)

**File**: `convex/functions/quotations/queries.ts`

- [ ] `getClientApprovedQuotations` - Get all approved quotations for a client
  - Input: clientId
  - Returns: quotations with storage usage info

**File**: `convex/functions/projects/mutations.ts`

- [ ] `linkProjectToQuotation` - Link project to quotation
  - Input: projectId, quotationId
  - Validates client match
  - Validates quotation status = approved
  - Updates project with quotationId

### Phase B: UI (~1 point)

**File**: `src/components/modules/admin/projects/project-detail/`

- [ ] `link-quotation-drawer.tsx` - Drawer for quotation selection
- [ ] `quotation-card.tsx` - Card display for each quotation option
- [ ] Update `system-controls.tsx` to show appropriate button

---

## 🧩 Schema Consideration

**Option A: Add quotationId to projects**

```typescript
projects: defineTable({
  // ...existing fields
  linkedQuotationId: v.optional(v.id("quotations")),
});
```

**Option B: Use existing projectId in quotations** (Current)

- Quotations already have `projectId` field
- Link by updating quotation's projectId to point to project
- Query quotations where projectId matches

**Recommendation**: Use Option B (existing structure) - less schema change

---

## 🧪 Testing Checklist

- [ ] Admin can see "Link to Quotation" button
- [ ] Drawer shows only client's approved quotations
- [ ] Cannot link to quotation of different client
- [ ] Cannot link to non-approved quotation
- [ ] After linking, button changes to "View Quotation"
- [ ] Setup Folders button becomes enabled after linking

---

## 🚀 Definition of Done

- [ ] `getClientApprovedQuotations` query working
- [ ] `linkProjectToQuotation` mutation working
- [ ] Link to Quotation drawer complete
- [ ] Project detail shows linked quotation
- [ ] Setup Folders enabled after linking
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-11 - Admin Initiated Project Creation  
**Enables**: 3-14 - Enhanced Folder Setup Flow
