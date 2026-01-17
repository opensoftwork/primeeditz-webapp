# Story 4-9b: Client Reject Quotation

**Epic**: Epic 4 - Quotation System  
**Status**: ready-for-dev  
**Complexity**: Low (2 points)  
**Created**: 2026-01-17  
**Priority**: MEDIUM — Completes client response options

---

## 📋 User Story

**As a** Client,  
**I want** to reject a quotation with a reason,  
**So that** the admin knows I am not proceeding and why.

---

## 🔗 Dependencies

| Depends On                      | Status        |
| ------------------------------- | ------------- |
| **4-7 - Client View Quotation** | ready-for-dev |

---

## ✅ Acceptance Criteria

### AC1: Reject Button

- [ ] Visible for `sent` or `viewed` quotations
- [ ] Styled as destructive/warning action

### AC2: Rejection Confirmation

- [ ] Clicking opens confirmation dialog
- [ ] Required: Select rejection reason
- [ ] Optional: Additional comments (300 chars)
- [ ] Rejection reasons:
  - Budget constraints
  - Chose different vendor
  - Project cancelled
  - Timeline mismatch
  - Other

### AC3: Submission

- [ ] Status changes to `rejected`
- [ ] `rejectedAt` timestamp recorded
- [ ] `rejectionReason` stored
- [ ] `clientNotes` updated with comments

### AC4: Post-Rejection UI

- [ ] Status shows "REJECTED"
- [ ] Action buttons hidden
- [ ] Rejection reason displayed

---

## 📘 Implementation Tasks

### Phase A: Mutation (~0.5 points)

**File**: `convex/schema.ts`

- [ ] Verify `rejectedAt` exists
- [ ] Add `rejectionReason: v.optional(v.string())`

**File**: `convex/functions/quotations/mutations.ts`

- [ ] Create `rejectQuotation` mutation
- [ ] Update status to `rejected`
- [ ] Store reason and comments

### Phase B: UI (~1.5 points)

**File**: `src/components/modules/client/quotations/reject-quotation-dialog.tsx`

- [ ] Confirmation dialog
- [ ] Reason selector (required)
- [ ] Optional comments textarea
- [ ] Confirm rejection button

**File**: `src/lib/constants/quotation-rejection-reasons.ts`

- [ ] Define REJECTION_REASONS constant

---

## 🚀 Definition of Done

- [ ] `rejectQuotation` mutation working
- [ ] Rejection dialog complete
- [ ] Status updates to `rejected`
- [ ] Admin sees rejection reason
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 4-9 - Client Request Changes  
**Next Story**: 4-10 - Quotation Versioning (DEFERRED)
