# Story 24.3: Refactor Review Actions for Role-Aware Visibility

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Medium (5 points)
**Created**: 2026-02-27
**Priority**: HIGH — Fixes the broken admin-sees-Approve-on-own-draft bug

---

## 📋 User Story

**As an** Admin,
**I want** the Approve/Reject panel to only appear for studio-initiated quotations,
**So that** I don't see a confusing self-approval flow on quotations I created myself.

---

## 🔗 Dependencies & Context

- **Depends on**: Story 24.2 (quotationSource available in data)
- **Blocks**: Story 24.4 (Finalize drawer replaces the old flow)

---

## ⚠️ Current State Analysis

### `review-actions.tsx` (line 81-91)

```typescript
// CURRENT: Shows for ALL drafts, including admin-created ones
const canReview = ["initiated", "draft", "changes_requested"].includes(
  quotation.status,
);

if (
  !canReview &&
  quotation.status !== "sent" &&
  quotation.status !== "viewed"
) {
  return null;
}
```

**Problem**: `"draft"` is included in `canReview`, so admin-created draft quotations show the Approve/Reject panel. This is wrong — the admin authored it, so there's nothing to approve.

### Screenshot Evidence

Admin Detail View (QT-000003, DRAFT) shows:

- "REVIEW PROTOCOL — ACTION REQUIRED BY ADMIN"
- "APPROVE QUOTATION" + "REJECT" buttons
- But this is the admin's OWN draft!

---

## ✅ Acceptance Criteria

### Studio-Request Visibility

- [ ] **Given** a quotation with `quotationSource: "studio_request"` and status `"initiated"`
- [ ] **When** viewing the admin detail page
- [ ] **Then** the "Review Protocol" panel appears with Approve/Reject buttons

### Admin-Init Visibility

- [ ] **Given** a quotation with `quotationSource: "admin_init"` and status `"draft"`
- [ ] **When** viewing the admin detail page
- [ ] **Then** the "Review Protocol" panel does NOT appear

### Changes Requested

- [ ] **Given** a studio-request quotation with status `"changes_requested"`
- [ ] **When** viewing the admin detail page
- [ ] **Then** the "Review Protocol" panel appears (admin re-reviews after studio changes)

### Sent/Viewed

- [ ] **Given** any quotation with status `"sent"` or `"viewed"`
- [ ] **When** viewing the admin detail page
- [ ] **Then** the "Review Protocol" panel does NOT appear (awaiting studio action)

### Legacy Data

- [ ] **Given** a quotation with no `quotationSource` field (legacy)
- [ ] **When** viewing the admin detail page
- [ ] **Then** fallback to showing Review Protocol for `"initiated"` status only

---

## 📁 Files to Update

| File                                                                           | Change                                              |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `src/components/modules/admin/quotations/detail/components/review-actions.tsx` | Add `quotationSource` prop, update visibility logic |
| `src/components/modules/admin/quotations/detail/quotation-detail.tsx`          | Pass `quotationSource` to `ReviewActions`           |

---

## 🛠 Technical Implementation

### Step 1: Update ReviewActions Props

```typescript
interface ReviewActionsProps {
  quotation: {
    _id: Id<"quotations">;
    status: string;
    assignedEmployeeId?: Id<"profiles">;
    quotationSource?: string; // ADD THIS
  };
}
```

### Step 2: Update Visibility Logic

```typescript
export function ReviewActions({ quotation }: ReviewActionsProps) {
  // Only show for studio-initiated quotations that need admin review
  const isStudioRequest = quotation.quotationSource === "studio_request";

  // Legacy fallback: if no source, treat "initiated" as studio request
  const canReview = isStudioRequest
    ? ["initiated", "changes_requested"].includes(quotation.status)
    : !quotation.quotationSource && quotation.status === "initiated";

  if (!canReview) {
    return null;
  }

  // ... rest of component
}
```

### Step 3: Update QuotationDetail to pass source

In `quotation-detail.tsx`, ensure the quotation data passed to ReviewActions includes `quotationSource`.

---

## 🚀 Definition of Done

- [ ] ReviewActions only shows for studio-initiated quotations
- [ ] Admin-created drafts do NOT show Approve/Reject
- [ ] Changes_requested status shows review for studio requests
- [ ] Legacy quotations (no source) handled gracefully
- [ ] Visual verification matches expected behavior
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                 |
| ---------- | ------- | ------------------------------------- |
| 2026-02-27 | backlog | Core bug fix for admin-initiated flow |

---

**Previous Story**: 24-2 - Update mutations to set quotationSource
**Next Story**: 24-4 - Create consolidated Finalize drawer
