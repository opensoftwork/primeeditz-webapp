# Story 4-9: Client Request Changes (MVP)

**Epic**: Epic 4 - Quotation System  
**Status**: ready-for-dev  
**Complexity**: Low (3 points)  
**Created**: 2026-01-17  
**Priority**: MEDIUM — Enables negotiation without full versioning

---

## 📋 User Story

**As a** Client,  
**I want** to request changes to a quotation with specific feedback,  
**So that** the admin can revise it based on my concerns.

---

## 🔗 Dependencies

| Depends On                      | Status        |
| ------------------------------- | ------------- |
| **4-7 - Client View Quotation** | ready-for-dev |

**MVP Note**: Versioning (4-10) is DEFERRED. Admin edits same quotation.

---

## ✅ Acceptance Criteria

### AC1: Request Changes Button

- [ ] Visible for quotations with status `sent` or `viewed`
- [ ] Secondary styled (not primary like Accept)

### AC2: Structured Feedback Form

- [ ] Checkboxes for common reasons:
  - ☐ Pricing needs adjustment
  - ☐ Missing items or services
  - ☐ Timeline doesn't work for me
  - ☐ Terms and conditions concerns
  - ☐ Need more details on specific items
  - ☐ Other (requires comment)
- [ ] Optional textarea for additional comments (500 chars max)

### AC3: Submission

- [ ] At least one checkbox required
- [ ] "Other" requires comment
- [ ] Status changes to `changes_requested`
- [ ] `clientNotes` populated with feedback
- [ ] `changeRequestedAt` timestamp recorded

### AC4: Post-Request UI

- [ ] Status shows "CHANGES REQUESTED"
- [ ] Feedback displayed
- [ ] Action buttons disabled
- [ ] "Waiting for admin" message shown

---

## 📘 Implementation Tasks

### Phase A: Schema & Mutation (~1 point)

**File**: `convex/schema.ts`

- [ ] Add `changeReasons: v.optional(v.array(v.string()))`
- [ ] Add `changeRequestedAt: v.optional(v.number())`

**File**: `convex/functions/quotations/mutations.ts`

- [ ] Create `requestQuotationChanges` mutation
- [ ] Validate ownership and status
- [ ] Update status to `changes_requested`
- [ ] Store reasons and comments

### Phase B: UI Components (~2 points)

**File**: `src/components/modules/client/quotations/request-changes-drawer.tsx`

- [ ] Checkbox group for reasons
- [ ] Textarea with char counter
- [ ] Validation logic
- [ ] Submit with loading state

**File**: `src/lib/constants/quotation-change-reasons.ts`

- [ ] Define CHANGE_REASONS constant

**File**: `src/components/modules/client/quotations/changes-requested-banner.tsx`

- [ ] Display submitted feedback
- [ ] Show waiting message

### Phase C: Admin View (~0.5 points)

**File**: `src/components/modules/admin/quotations/detail/components/client-feedback-section.tsx`

- [ ] Display change reasons and comments
- [ ] CTA to edit quotation

---

## 🚀 Definition of Done

- [ ] `requestQuotationChanges` mutation working
- [ ] Request Changes drawer complete
- [ ] Validation working (checkbox + comments)
- [ ] Status updates correctly
- [ ] Admin can see feedback
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 4-8 - Client Accept Quotation  
**Next Story**: 4-10 - Quotation Versioning (DEFERRED)
