# Story 3-9: Storage Pricing Tiers Configuration

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: ready-for-dev  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-17  
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

- [ ] Route: `/admin/settings/storage-tiers`
- [ ] Display all tiers: Name, Capacity (GB), Price (₹), Active status
- [ ] Sort by capacity ascending
- [ ] Show tier count

### AC2: Create Storage Tier

- [ ] "Add Tier" button opens drawer/dialog
- [ ] Fields: Name*, Capacity (GB)*, Price (₹)\*, Active toggle
- [ ] Validation: Capacity > 0, Price >= 0
- [ ] Success toast on creation

### AC3: Edit Storage Tier

- [ ] Click tier row to edit
- [ ] Pre-populated form
- [ ] Save updates tier
- [ ] Cannot change capacity if tier is in use (has linked projects)

### AC4: Deactivate Storage Tier

- [ ] Toggle active status
- [ ] Deactivated tiers hidden from quotation selection
- [ ] Existing projects with tier unaffected

---

## 📘 Implementation Tasks

### Phase A: Backend (~1 point)

**File**: `convex/functions/storageTiers/queries.ts`

- [ ] `listStorageTiers` - Get all tiers (admin)
- [ ] `listActiveStorageTiers` - Get active tiers only
- [ ] `getStorageTier` - Get single tier by ID

**File**: `convex/functions/storageTiers/mutations.ts`

- [ ] `createStorageTier` - Create new tier
- [ ] `updateStorageTier` - Update tier details
- [ ] `toggleStorageTierActive` - Activate/deactivate

### Phase B: UI (~2 points)

**File**: `src/app/(protected)/@admin/settings/storage-tiers/page.tsx`

- [ ] Page with data table
- [ ] Add tier button
- [ ] Active status toggle

**File**: `src/components/modules/admin/settings/storage-tiers/`

- [ ] `storage-tiers-list.tsx` - List component
- [ ] `storage-tier-drawer.tsx` - Create/edit form
- [ ] `storage-tier-row.tsx` - Table row

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

- [ ] Admin can view storage tiers list
- [ ] Admin can create new tier
- [ ] Admin can edit existing tier
- [ ] Admin can toggle active status
- [ ] Inactive tiers hidden from quotation
- [ ] Validation prevents invalid data

---

## 🚀 Definition of Done

- [ ] CRUD operations working
- [ ] UI complete with premium styling
- [ ] Validation working
- [ ] Active/inactive toggle functional
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Next Story**: 3-10 - Folder Templates Configuration
