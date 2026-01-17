# Story 3-9: Storage Pricing Tiers Configuration

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: in-progress  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-17  
**Started**: 2026-01-17  
**Priority**: HIGH — Required for Epic 5 storage limit enforcement
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** to configure storage tiers with capacity and pricing,  
**So that** I can offer different storage options to clients in quotations.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On    | Status  | Notes                          |
| ------------- | ------- | ------------------------------ |
| Schema exists | ✅ Done | `storageTiers` table in schema |

### Enables

| Story                              | Notes                                |
| ---------------------------------- | ------------------------------------ |
| **5-5: Storage Limit Enforcement** | Uses tiers to check limits           |
| **4-3: Create Quotation**          | Tiers appear in quotation (optional) |

---

## ✅ Acceptance Criteria

### AC1: Storage Tiers Listing

- [x] Route: `/admin/settings/storage-tiers`
- [x] Display all tiers: Name, Capacity (GB), Price (₹), Active status
- [x] Sort by capacity ascending
- [x] Show tier count

### AC2: Create Storage Tier

- [x] "Add Tier" button opens drawer/dialog
- [x] Fields: Name*, Capacity (GB)*, Price (₹)\*, Active toggle
- [x] Validation: Capacity > 0, Price >= 0
- [x] Success toast on creation

### AC3: Edit Storage Tier

- [x] Click tier card to edit
- [x] Pre-populated form
- [x] Save updates tier
- [x] Cannot change capacity if tier is in use (has linked projects)

### AC4: Deactivate Storage Tier

- [x] Toggle active status
- [x] Deactivated tiers hidden from quotation selection (via `listActiveStorageTiers`)
- [x] Existing projects with tier unaffected

---

## 📘 Implementation Tasks

### Phase A: Backend (~1 point) ✅ COMPLETE

**File**: `convex/functions/storageTiers/queries.ts`

- [x] `listStorageTiers` - Get all tiers (admin)
- [x] `listActiveStorageTiers` - Get active tiers only
- [x] `getStorageTier` - Get single tier by ID
- [x] `getStorageTierUsage` - Check if tier is in use

**File**: `convex/functions/storageTiers/mutations.ts`

- [x] `createStorageTier` - Create new tier
- [x] `updateStorageTier` - Update tier details (validates capacity change)
- [x] `toggleStorageTierActive` - Activate/deactivate
- [x] `deleteStorageTier` - Delete tier (if not in use)

### Phase B: UI (~2 points) ✅ COMPLETE

**File**: `src/app/(protected)/@admin/settings/storage-tiers/page.tsx`

- [x] Page with card grid layout
- [x] Add tier button
- [x] Active status toggle

**File**: `src/components/modules/admin/storage-tiers/list/`

- [x] `storage-tiers-list.tsx` - Main list component with CRUD orchestration
- [x] `storage-tier-drawer.tsx` - Create/edit form with live preview
- [x] `storage-tier-card.tsx` - Premium styled tier card
- [x] `list-header.tsx` - Header with tier count and add button
- [x] `list-empty.tsx` - Empty state with CTA
- [x] `list-alerts.tsx` - Confirmation dialogs for toggle/delete

### Navigation

- [x] Added "Storage Tiers" to admin sidebar navigation

---

## 🧩 Schema Reference

```typescript
// Already in convex/schema.ts
storageTiers: defineTable({
  name: v.string(),
  sizeGB: v.number(),
  priceINR: v.number(),
  isActive: v.boolean(),
});
```

---

## 🧪 Testing Checklist

- [x] Admin can view storage tiers list
- [x] Admin can create new tier
- [x] Admin can edit existing tier
- [x] Admin can toggle active status
- [x] Inactive tiers hidden from quotation (via separate query)
- [x] Validation prevents invalid data
- [ ] Manual testing in browser (PENDING USER VERIFICATION)

---

## 🚀 Definition of Done

- [x] CRUD operations working
- [x] UI complete with premium styling
- [x] Validation working
- [x] Active/inactive toggle functional
- [ ] Story marked as `done` in `sprint-status.yaml` (pending final testing)

---

**Next Story**: 3-10 - Folder Templates Configuration
