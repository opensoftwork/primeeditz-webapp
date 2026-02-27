# Story 24.1: Add `quotationSource` Field to Quotations Schema

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: HIGH — Foundation for role-aware actions

---

## 📋 User Story

**As a** System,
**I want** to track whether a quotation was initiated by a studio or created by an admin,
**So that** the UI can display the correct actions based on the quotation's origin.

---

## 🔗 Dependencies & Context

```
┌──────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION FLOW                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  24.1 Add quotationSource ──┤ ← THIS STORY (Foundation) │
│                              ▼                           │
│  24.2 Update mutations       │ (depends on 24.1)         │
│  24.3 Role-aware actions     │ (depends on 24.2)         │
│  24.4 Finalize drawer        │ (depends on 24.3)         │
│  24.5-24.7 Cleanup           │ (depends on 24.4)         │
│  24.8-24.9 Verification      │ (depends on 24.2)         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ⚠️ Current State Analysis

### Quotation Schema (convex/schema.ts, lines 596-650)

The `quotations` table has a `status` field and a `createdBy` string field, but **no field to distinguish the origination flow**:

```typescript
// Currently: createdBy is just a string label ("STUDIO" or "ADMIN")
createdBy: v.optional(v.string()),
```

The `createdBy` field is a loose string, not a validated union. It's also **not reliably set** — the `requestQuotation` mutation sets `createdBy: "STUDIO"`, but this is a display label, not a machine-readable discriminator.

---

## ✅ Acceptance Criteria

### Schema Addition

- [ ] **Given** the `quotations` table in `convex/schema.ts`
- [ ] **When** checking the schema definition
- [ ] **Then** a new `quotationSource` field exists with type `v.optional(v.union(v.literal("studio_request"), v.literal("admin_init")))`

### Validator Export

- [ ] **Given** the new `quotationSource` field
- [ ] **When** using it in mutations
- [ ] **Then** a `quotationSourceValidator` is exported from `schema.ts`

### Backward Compatibility

- [ ] **Given** existing quotations without `quotationSource`
- [ ] **When** loading them
- [ ] **Then** they are still valid (field is `v.optional`)
- [ ] **And** no migration is required

---

## 📁 Files to Update

| File               | Change                                                             |
| ------------------ | ------------------------------------------------------------------ |
| `convex/schema.ts` | Add `quotationSourceValidator` and add field to `quotations` table |

---

## 🛠 Technical Implementation

### Step 1: Create Validator

```typescript
// convex/schema.ts — Add after quotationStatusValidator

export const quotationSourceValidator = v.union(
  v.literal("studio_request"), // Studio initiated via requestQuotation
  v.literal("admin_init"), // Admin created via createQuotation
);
```

### Step 2: Add to Quotations Table

```typescript
// In the quotations table definition
quotationSource: v.optional(quotationSourceValidator),
```

---

## 🚀 Definition of Done

- [ ] `quotationSourceValidator` created and exported from `schema.ts`
- [ ] `quotationSource` field added to the `quotations` table (optional)
- [ ] `pnpm convex dev` deploys successfully with no schema errors
- [ ] Existing quotation data remains accessible
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                             |
| ---------- | ------- | --------------------------------- |
| 2026-02-27 | backlog | Created as foundation for Epic 24 |

---

**Previous Story**: None (first in epic)
**Next Story**: 24-2 - Update mutations to set quotationSource
