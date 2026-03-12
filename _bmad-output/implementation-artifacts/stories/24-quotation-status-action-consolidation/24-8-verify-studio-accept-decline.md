# Story 24.8: Verify Studio-Side Accept/Decline for Admin-Sent Quotations

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Small (3 points)
**Created**: 2026-02-27
**Priority**: HIGH — Validates end-to-end admin-initiated flow

---

## 📋 User Story

**As a** Studio user,
**I want** to see Accept and Request Changes buttons for quotations sent by the admin,
**So that** I can respond to admin-initiated proposals.

---

## 🔗 Dependencies & Context

- **Depends on**: Story 24.2 (quotationSource set correctly)

---

## ⚠️ Current State Analysis

### `acceptQuotation` mutation (mutations.ts, line 706)

```typescript
export const acceptQuotation = studioMutation({
  // Allowed from: ["sent", "viewed", "changes_requested"]
  // This should work for admin-sent quotations
});
```

### Studio Detail (`studio-quotation-detail.tsx`)

The component shows action buttons based on status. Need to verify it handles the admin-init flow correctly.

### Potential Issues

1. Does the studio quotation listing include admin-created quotations sent to them?
2. Do the action buttons display correctly for `sent`/`viewed` status from admin-init source?
3. Does `acceptQuotation` trigger project spawning correctly?

---

## ✅ Acceptance Criteria

### Studio Listing

- [ ] **Given** an admin sends a quotation to a studio
- [ ] **When** the studio views their quotation listing
- [ ] **Then** the admin-sent quotation appears in the list

### Studio Detail Actions

- [ ] **Given** a studio views an admin-sent quotation with status `"sent"` or `"viewed"`
- [ ] **When** viewing the detail page
- [ ] **Then** "Accept" and "Request Changes" buttons are visible

### Accept Flow

- [ ] **Given** a studio clicks "Accept" on an admin-sent quotation
- [ ] **When** the mutation completes
- [ ] **Then** status transitions to `"approved"` and projects are spawned

### Request Changes Flow

- [ ] **Given** a studio clicks "Request Changes"
- [ ] **When** providing reasons
- [ ] **Then** status transitions to `"changes_requested"` and admin is notified

---

## 📁 Files to Verify

| File                                                                                      | Verification                                                            |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `convex/functions/quotations/queries/studio.ts`                                           | Studio listing query includes admin-sent quotations                     |
| `src/components/modules/studio/quotations/detail/studio-quotation-detail.tsx`             | Action buttons for sent/viewed status                                   |
| `src/components/modules/studio/quotations/detail/components/quotation-action-buttons.tsx` | Accept/Decline renders correctly                                        |
| `convex/functions/quotations/mutations.ts`                                                | `acceptQuotation` and `requestQuotationChanges` work for admin-init QTs |

---

## 🚀 Definition of Done

- [ ] Studio listing includes admin-sent quotations
- [ ] Studio detail shows Accept/Request Changes for sent/viewed quotations
- [ ] Accept flow spawns projects correctly
- [ ] Request Changes flow updates status and stores reasons
- [ ] End-to-end manual test passes
- [ ] Story marked as `done`

---

**Previous Story**: 24-7 - Fix builder Step 3 dedup
**Next Story**: 24-9 - End-to-end status flow testing
