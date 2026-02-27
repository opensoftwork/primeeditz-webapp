# Epic 24: Quotation Status Machine & Action Consolidation

**Epic Owner**: Admin/CEO
**Status**: Planning
**Created**: 2026-02-27
**Complexity**: High (Status machine + multi-surface UI refactor)
**Priority**: P0 — CRITICAL — Broken admin-initiated workflow, conflicting action buttons

---

## 📋 Epic Summary

Fix the **broken quotation status machine** and **consolidate redundant action buttons** across the admin quotation module. Currently, admin-created quotations incorrectly show "Approve/Reject" buttons (the admin approving their own work), and multiple UI surfaces expose duplicate "Send to Studio" and "Download" actions that confuse users and risk conflicting with the status flow.

### Root Cause Analysis

The system has **two distinct quotation flows** but the UI treats them identically:

| Flow                 | Creator                         | Current Status | Expected Next Action                                  | Problem                                   |
| -------------------- | ------------------------------- | -------------- | ----------------------------------------------------- | ----------------------------------------- |
| **Studio-Initiated** | Studio calls `requestQuotation` | `initiated`    | Admin reviews → Approve/Reject                        | ✅ Works correctly                        |
| **Admin-Initiated**  | Admin calls `createQuotation`   | `draft`        | Admin edits → Sends to Studio → Studio Accept/Decline | ❌ Admin sees Approve/Reject on own draft |

### Issue Evidence (Screenshots)

1. **Admin Detail View (QT-000003, DRAFT)**: "REVIEW PROTOCOL — ACTION REQUIRED BY ADMIN" panel shows "APPROVE QUOTATION" + "REJECT" on admin's own draft
2. **Builder Step 3**: "SEND TO STUDIO" appears in BOTH the header AND the Review Protocol Card
3. **Quick Actions sidebar**: "Send to Studio" + "Download Quotation" duplicate the header buttons

### Current State

| Capability                                           | Status     | Notes                                                        |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| Studio-initiated flow (request → admin approve)      | ✅ Works   | `requestQuotation` → `initiated` → `approveQuotation`        |
| Admin-initiated flow (create → send → studio accept) | ❌ Broken  | Admin sees Approve/Reject on own drafts                      |
| Quotation source tracking                            | ❌ Missing | No `quotationSource` field to distinguish who created the QT |
| Single consolidated "Finalize" action                | ❌ Missing | Send/Approve scattered across 3 UI surfaces                  |
| Role-aware action visibility                         | ❌ Missing | `review-actions.tsx` doesn't consider who created the QT     |

### Target State

- Quotations track their **source** (`studio_request` vs `admin_init`)
- Admin-created drafts show **"Finalize"** (with Send to Studio / Keep Draft / Copy Public Link options)
- Studio-initiated quotations show **"Approve / Reject"** for admin review
- Admin-sent quotations show **"Accept / Decline"** on the studio side (not Approve/Reject)
- **One clear action per workflow step** — no duplicate buttons across surfaces

---

## 🎯 User Outcomes

| Role       | Outcome                                                                    |
| ---------- | -------------------------------------------------------------------------- |
| **Admin**  | Create quotations and send to studio without confusing Approve/Reject loop |
| **Admin**  | Single "Finalize" entry point with 3 clear choices                         |
| **Admin**  | See role-appropriate actions based on who created the quotation            |
| **Studio** | See "Accept" or "Decline" for admin-sent quotations (not "Approve")        |
| **Studio** | Clear status progression when quotation flows from admin                   |

---

## 🗂️ Stories

### Phase A: Schema & Backend Foundation

| Story | Description                                         | Points | Priority |
| ----- | --------------------------------------------------- | ------ | -------- |
| 24.1  | Add `quotationSource` field to quotations schema    | 2      | HIGH     |
| 24.2  | Update mutations to set `quotationSource` correctly | 3      | HIGH     |
| 24.3  | Refactor `Review Actions` for role-aware visibility | 5      | HIGH     |

### Phase B: UI Consolidation — Finalize Drawer

| Story | Description                                                       | Points | Priority |
| ----- | ----------------------------------------------------------------- | ------ | -------- |
| 24.4  | Create consolidated "Finalize" drawer with 3 options              | 8      | HIGH     |
| 24.5  | Remove duplicate "Send to Studio" from Quick Actions              | 2      | HIGH     |
| 24.6  | Remove duplicate "Download" from Quick Actions (keep header only) | 1      | HIGH     |
| 24.7  | Fix builder Step 3 — deduplicate "Send to Studio" from header     | 2      | HIGH     |

### Phase C: Status Flow Verification

| Story | Description                                               | Points | Priority |
| ----- | --------------------------------------------------------- | ------ | -------- |
| 24.8  | Verify studio-side Accept/Decline flow for admin-sent QTs | 3      | HIGH     |
| 24.9  | End-to-end status flow testing (both paths)               | 3      | MEDIUM   |

**Total Points**: 29

---

## 📊 Detailed Story Specifications

### Story 24.1: Add `quotationSource` field to quotations schema

**File**: `convex/schema.ts`

Add to the `quotations` table definition:

```typescript
quotationSource: v.optional(v.union(
  v.literal("studio_request"),  // Studio initiated via requestQuotation
  v.literal("admin_init"),      // Admin created via createQuotation
)),
```

**Acceptance Criteria**:

- [ ] Schema updated with `quotationSource` field (optional for backward compat with existing data)
- [ ] Export `quotationSourceValidator` for use in mutations
- [ ] Existing quotations remain valid (field is optional)

---

### Story 24.2: Update mutations to set `quotationSource` correctly

**Files**: `convex/functions/quotations/mutations.ts`

| Mutation                        | Source Value                                       |
| ------------------------------- | -------------------------------------------------- |
| `requestQuotation` (line 241)   | `quotationSource: "studio_request"`                |
| `createQuotation` (line 300)    | `quotationSource: "admin_init"`                    |
| `duplicateQuotation` (line 863) | Inherit from original or default to `"admin_init"` |

**Acceptance Criteria**:

- [ ] `requestQuotation` sets `quotationSource: "studio_request"`
- [ ] `createQuotation` sets `quotationSource: "admin_init"`
- [ ] `duplicateQuotation` inherits source from original quotation
- [ ] Query `getQuotationWithSections` returns the `quotationSource` field

---

### Story 24.3: Refactor Review Actions for role-aware visibility

**File**: `src/components/modules/admin/quotations/detail/components/review-actions.tsx`

**Current (broken)**:

```typescript
const canReview = ["initiated", "draft", "changes_requested"].includes(
  quotation.status,
);
```

**Target logic**:

```
IF quotation.quotationSource === "studio_request" AND status IN ["initiated", "changes_requested"]:
  → Show Approve + Reject (admin reviewing studio's request)
ELSE IF quotation.quotationSource === "admin_init" AND status IN ["draft", "changes_requested"]:
  → Show nothing (admin authored it; no self-review needed)
```

The "Approve" for admin-init quotations should only happen on the STUDIO side via `acceptQuotation`.

**Acceptance Criteria**:

- [ ] `ReviewActions` receives `quotationSource` prop
- [ ] Approve/Reject only shown for `studio_request` quotations in `initiated`/`changes_requested` status
- [ ] Admin-created `draft` quotations do NOT show Approve/Reject
- [ ] Sent/viewed quotations from either source do NOT show admin Approve/Reject

---

### Story 24.4: Create consolidated "Finalize" drawer with 3 options

**New component**: Replace/augment existing `SendQuotationDrawer` with a new `FinalizeQuotationDrawer`

**Desktop width**: `sm:max-w-lg` (wider than current `sm:max-w-md` to accommodate design)

**Three choices presented**:

| Option                          | Icon     | Action                                            | Status Transition                |
| ------------------------------- | -------- | ------------------------------------------------- | -------------------------------- |
| **Keep as Draft**               | FileText | Save quotation, navigate to listing               | Stays `draft`                    |
| **Send to Studio**              | Send     | Mark as sent, generate share token, notify studio | `draft` → `sent`                 |
| **Copy Public Onboarding Link** | Link     | Generate share token, copy to clipboard           | `draft` → `sent` (+ link copied) |

**Design requirements**:

- Drawer/sheet opens from the single "Finalize" button (replaces current "Send to Studio" in header)
- Shows quotation summary (code, total, client name)
- Validity selector (7, 14, 30, 90 days)
- Three clear action buttons with descriptions
- Warning: "Sending will lock this quotation for editing"

**Acceptance Criteria**:

- [ ] New `FinalizeQuotationDrawer` component created
- [ ] Drawer width increased to `sm:max-w-lg` for better UX
- [ ] Three options visible: Keep as Draft, Send to Studio, Copy Public Link
- [ ] "Keep as Draft" saves and navigates to quotations list
- [ ] "Send to Studio" calls `sendQuotation` mutation and updates status
- [ ] "Copy Public Link" generates share token and copies URL to clipboard
- [ ] Replaces old `SendQuotationDrawer` in both `quotation-detail.tsx` and builder Step 3

---

### Story 24.5: Remove duplicate "Send to Studio" from Quick Actions

**File**: `src/components/modules/admin/quotations/detail/components/quick-actions.tsx`

Remove the "Send to Studio" button (lines 51-63). Keep: Duplicate as New, Delete Quotation.

**Acceptance Criteria**:

- [ ] "Send to Studio" removed from Quick Actions
- [ ] "Download Quotation" removed from Quick Actions (already in header)
- [ ] Quick Actions only contains: Duplicate as New, Delete Quotation

---

### Story 24.6: Remove duplicate "Download" from Quick Actions

**File**: Same as 24.5 — can be combined.

---

### Story 24.7: Fix builder Step 3 — deduplicate "Send to Studio" from header

**File**: `src/components/modules/admin/quotations/builder/steps/step3-review-send/review-header.tsx`

Remove the "SEND TO STUDIO" button from the header bar. The "Send to Studio" action lives only in the `ReviewProtocolCard` (right sidebar).

Replace the header "Send to Studio" with a single "Finalize" button that opens the new `FinalizeQuotationDrawer`.

**Acceptance Criteria**:

- [ ] Header bar in builder Step 3 shows: DRAFT badge, Preview, Download PDF (no Send to Studio)
- [ ] ReviewProtocolCard shows the consolidated finalize options
- [ ] No duplicate action paths in the builder

---

### Story 24.8: Verify studio-side Accept/Decline for admin-sent QTs

**Files**:

- `src/components/modules/studio/quotations/detail/studio-quotation-detail.tsx`
- `src/components/modules/studio/quotations/detail/components/quotation-action-buttons.tsx`
- `convex/functions/quotations/mutations.ts` (`acceptQuotation`, `requestQuotationChanges`)

Ensure that when an admin-created quotation is sent to a studio:

1. Studio sees the quotation in their listing
2. Studio detail page shows "Accept" and "Request Changes" buttons
3. `acceptQuotation` correctly processes admin-init quotations
4. Status flows correctly: `sent` → studio accepts → `approved` → projects spawned

**Acceptance Criteria**:

- [ ] Studio can see admin-sent quotations in their listing
- [ ] Studio detail shows Accept/Decline for `sent`/`viewed` status
- [ ] `acceptQuotation` spawns projects correctly for admin-init quotations
- [ ] Status history records correct transitions

---

## 🧩 Affected Components Map

### Backend

| File                                       | Change                                            |
| ------------------------------------------ | ------------------------------------------------- |
| `convex/schema.ts`                         | Add `quotationSource` field                       |
| `convex/functions/quotations/mutations.ts` | Set `quotationSource` in create/request mutations |

### Admin UI

| File                                                       | Change                                                          |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| `detail/components/review-actions.tsx`                     | Role-aware visibility based on `quotationSource`                |
| `detail/components/quick-actions.tsx`                      | Remove duplicate Send + Download                                |
| `detail/components/detail-header.tsx`                      | Replace "Send to Studio" with "Finalize" button                 |
| `detail/quotation-detail.tsx`                              | Wire `FinalizeQuotationDrawer` instead of `SendQuotationDrawer` |
| `send/` folder                                             | Refactor into `FinalizeQuotationDrawer`                         |
| `builder/steps/step3-review-send/review-header.tsx`        | Remove "Send to Studio" from header                             |
| `builder/steps/step3-review-send/review-protocol-card.tsx` | Update to use finalize options                                  |

### Studio UI

| File                                                               | Change                                     |
| ------------------------------------------------------------------ | ------------------------------------------ |
| `studio/quotations/detail/components/quotation-action-buttons.tsx` | Verify Accept/Decline works for admin-init |

---

## 🔗 Dependencies

| This Epic | Depends On | Notes                                   |
| --------- | ---------- | --------------------------------------- |
| 24.1      | None       | Schema-level foundation                 |
| 24.2      | 24.1       | Mutations need new schema field         |
| 24.3      | 24.2       | UI needs `quotationSource` from backend |
| 24.4      | 24.3       | New drawer replaces old flow            |
| 24.5-24.7 | 24.4       | Cleanup after new drawer is in place    |
| 24.8      | 24.2       | Verification of studio-side flow        |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                                                                                              |
| ---------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| 2026-02-27 | Planning | Epic created from codebase audit + screenshot analysis. Admin-initiated flow confirmed broken via visual evidence. |

---

**Previous Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Next Epic**: Epic 25 - Quotation ID & Display Fixes
