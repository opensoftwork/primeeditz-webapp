# Story 3-15: Storage Pool Tracking

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: ready-for-dev  
**Complexity**: Low (2 points)  
**Created**: 2026-01-17  
**Priority**: MEDIUM — Required for accurate storage management
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** to see how much storage has been used vs allocated from a quotation,  
**So that** I can prevent over-allocation and track storage usage across projects.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                          | Status        | Notes                         |
| ----------------------------------- | ------------- | ----------------------------- |
| **3-12: Link Project to Quotation** | ready-for-dev | Projects linked to quotations |
| **3-14: Enhanced Folder Setup**     | ready-for-dev | Storage allocated from pool   |

### Enables

| Story                              | Notes                              |
| ---------------------------------- | ---------------------------------- |
| **5-5: Storage Limit Enforcement** | Know remaining storage for uploads |
| **7-2: Admin Dashboard**           | Storage usage metrics              |

---

## ✅ Acceptance Criteria

### AC1: Quotation Storage Summary

- [ ] Quotation detail view shows storage breakdown:
  - Total storage from quotation (from storage tier line item)
  - Storage allocated to linked projects
  - Storage remaining (available)

### AC2: Project Storage Info

- [ ] Project detail shows:
  - Storage allocated (from linked quotation)
  - Storage used (actual bytes uploaded)
  - Storage remaining (allocated - used)

### AC3: Storage Calculation Logic

- [ ] Total storage derived from:
  - Storage tier line item in quotation, OR
  - Sum of storage-related line items
- [ ] Allocated = Sum of `storageAllocated` from all linked projects
- [ ] Remaining = Total - Allocated

### AC4: Over-Allocation Prevention

- [ ] Cannot allocate more storage than quotation has remaining
- [ ] Show clear error message if attempted
- [ ] UI shows remaining storage in real-time during allocation

---

## 📘 Implementation Tasks

### Phase A: Storage Calculation (~1 point)

**File**: `convex/functions/quotations/queries.ts`

- [ ] Add `getQuotationStorageSummary` query:
  - Input: quotationId
  - Returns: { totalGB, allocatedGB, remainingGB, linkedProjects }

**Logic**:

```typescript
// 1. Get total storage from quotation
// Option A: If quotation has storageTierId reference
// Option B: Parse line items for storage tier

// 2. Get all projects linked to this quotation
const linkedProjects = await ctx.db
  .query("projects")
  .filter((q) => /* quotation linkage check */)
  .collect();

// 3. Sum allocated storage
const allocatedBytes = linkedProjects.reduce(
  (sum, p) => sum + (p.storageAllocated || 0),
  0
);
```

### Phase B: UI Integration (~1 point)

**File**: `src/components/modules/admin/quotations/quotation-detail/`

- [ ] Add storage summary card/section
- [ ] Show progress bar: Allocated / Total
- [ ] List linked projects with their allocations

**File**: `src/components/modules/admin/projects/project-detail/`

- [ ] Show storage card:
  - Allocated: 100 GB
  - Used: 45 GB (45%)
  - From quotation: QT-2026-00012

---

## 🎨 UX Design

### Storage Summary Card (Quotation Detail)

```
┌─────────────────────────────────────────────────────────────────┐
│  💾 STORAGE ALLOCATION                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Total: 200 GB                                                  │
│  ████████████████████░░░░░░░░░░ 75%                             │
│                                                                  │
│  Allocated: 150 GB                                              │
│  Remaining:  50 GB                                              │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│  LINKED PROJECTS                                                │
│                                                                  │
│  📁 PE-202601-004 (Ceremony)        100 GB                      │
│  📁 PE-202601-005 (Reception)        50 GB                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Storage Card (Project Detail)

```
┌─────────────────────────────────────────────────────────────────┐
│  💾 PROJECT STORAGE                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Allocated: 100 GB (from QT-2026-00012)                         │
│  Used:       45 GB                                              │
│  ████████░░░░░░░░░░░░ 45%                                       │
│                                                                  │
│  Available: 55 GB                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Total storage calculated correctly from quotation
- [ ] Allocated storage sums from all linked projects
- [ ] Remaining = Total - Allocated
- [ ] UI updates when new project allocated
- [ ] Cannot over-allocate (validation works)
- [ ] Progress bar shows accurate percentage

---

## 🚀 Definition of Done

- [ ] `getQuotationStorageSummary` query working
- [ ] Storage summary card on quotation detail
- [ ] Storage card on project detail
- [ ] Over-allocation prevention
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-14 - Enhanced Folder Setup with Quotation Selection  
**Enables**: Epic 5 - Asset Upload & Folder Management
