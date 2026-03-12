# Story 24.2: Update Mutations to Set `quotationSource` Correctly

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Small (3 points)
**Created**: 2026-02-27
**Priority**: HIGH — Enables role-aware UI

---

## 📋 User Story

**As a** System,
**I want** all quotation creation mutations to set the `quotationSource` field,
**So that** downstream logic can distinguish how a quotation was created.

---

## 🔗 Dependencies & Context

- **Depends on**: Story 24.1 (schema field exists)
- **Blocks**: Story 24.3 (role-aware actions need source data)

---

## ⚠️ Current State Analysis

### Mutations in `convex/functions/quotations/mutations.ts`

| Mutation             | Line | Current `createdBy`       | Needs `quotationSource` |
| -------------------- | ---- | ------------------------- | ----------------------- |
| `requestQuotation`   | 241  | `"STUDIO"`                | `"studio_request"`      |
| `createQuotation`    | 300  | `args.createdBy` (string) | `"admin_init"`          |
| `duplicateQuotation` | 863  | `args.createdBy`          | Inherit from original   |

---

## ✅ Acceptance Criteria

### Studio-Initiated

- [ ] **Given** a studio calls `requestQuotation`
- [ ] **When** the quotation is created
- [ ] **Then** `quotationSource` is set to `"studio_request"`

### Admin-Initiated

- [ ] **Given** an admin calls `createQuotation`
- [ ] **When** the quotation is created
- [ ] **Then** `quotationSource` is set to `"admin_init"`

### Duplicated

- [ ] **Given** an admin duplicates a quotation
- [ ] **When** `duplicateQuotation` is called
- [ ] **Then** `quotationSource` is inherited from the original quotation
- [ ] **And** if the original has no `quotationSource`, it defaults to `"admin_init"`

### Query Returns Source

- [ ] **Given** a quotation is fetched via any query
- [ ] **When** the `quotationSource` field is checked
- [ ] **Then** it returns the correct value

---

## 📁 Files to Update

| File                                       | Change                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `convex/functions/quotations/mutations.ts` | Set `quotationSource` in `requestQuotation`, `createQuotation`, `duplicateQuotation` |

---

## 🛠 Technical Implementation

### Step 1: Update `requestQuotation` (line ~273)

```typescript
const quotationId = await ctx.db.insert("quotations", {
  // ... existing fields
  quotationSource: "studio_request", // ADD THIS
  createdBy: "STUDIO",
});
```

### Step 2: Update `createQuotation` (line ~345)

```typescript
const quotationId = await ctx.db.insert("quotations", {
  // ... existing fields
  quotationSource: "admin_init", // ADD THIS
  createdBy: args.createdBy,
});
```

### Step 3: Update `duplicateQuotation` (line ~875)

```typescript
const newQuotationId = await ctx.db.insert("quotations", {
  ...original,
  // ... existing overrides
  quotationSource: original.quotationSource || "admin_init", // ADD THIS
});
```

---

## 🚀 Definition of Done

- [ ] `requestQuotation` sets `quotationSource: "studio_request"`
- [ ] `createQuotation` sets `quotationSource: "admin_init"`
- [ ] `duplicateQuotation` inherits `quotationSource` from original
- [ ] All quotation queries return the `quotationSource` field
- [ ] `pnpm convex dev` deploys successfully
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes   |
| ---------- | ------- | ------- |
| 2026-02-27 | backlog | Created |

---

**Previous Story**: 24-1 - Add quotationSource field
**Next Story**: 24-3 - Refactor Review Actions for role-aware visibility
