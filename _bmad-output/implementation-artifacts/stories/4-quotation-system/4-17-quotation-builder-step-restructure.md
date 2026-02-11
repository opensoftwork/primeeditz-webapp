# Story 4-17: Quotation Builder Step Restructure

**Epic**: Epic 4 - Quotation System  
**Status**: in-progress
**Complexity**: Medium (5 points)  
**Created**: 2026-02-03  
**Priority**: HIGH — UX improvement for quotation creation workflow

---

## 📋 User Story

**As an** Admin,  
**I want** a streamlined quotation builder with logical step progression,  
**So that** I can create quotations more efficiently with a cleaner workflow.

---

## 🔗 Dependencies & Context

### Why This Story

The current quotation builder had 5 steps that were optimized:

- Step 2 (Project Selection) and Step 3 (Template Selection) were consolidated into Step 3.
- Terms & Conditions and Line Items were combined for better flow in Step 4.
- A dedicated Review & Send step was created for final confirmation.
- Added Package Selection as Step 2 to allow fast quotation building.

### Current vs New Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                 PREVIOUS STRUCTURE (5 Steps)                     │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Studio & Context      → Select studio, validity        │
│  Step 2: Package Selection     → Select service packages        │
│  Step 3: Project & Templates   → Project + folder template combo│
│  Step 4: Items & Terms         → Line items + subtotal + T&C    │
│  Step 5: Review & Send         → Review summary + send to client│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 NEW STRUCTURE (4 Steps)                          │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Studio & Context      → Select studio + validity ✅    │
│  Step 2: Package Selection     → Enhanced UI + Project Intel ✅  │
│  Step 3: Items & Terms         → Line items + subtotal + T&C ✅  │
│  Step 4: Review & Send         → Review summary + send to client ✅│
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### Step Labels Update

- [x] The steps show: 1. Studio & Context, 2. Package Selection, 3. Items & Terms, 4. Review & Send.

### Step 2: Package Selection

- [x] Multi-package selection support.
- [x] Enhanced UI matching Studio side "Request Engagement" design (Split view).
- [x] "Project Intelligence" displays automatically generated folder structures/projects based on package.
- [x] "Financial Breakdown" preview within selection card.
- [x] Proceed without selecting any package (Custom Quote).

### Step 3: Items & Terms Combined (Formerly Step 4)

- [x] Line items table with pricing.
- [x] Subtotal, tax, and grand total calculations.
- [x] Terms & Conditions editor in the same view.
- [x] **Default Expanded**: Terms & Conditions section is expanded by default for easier review.

### Step 4: Review & Send (Formerly Step 5)

- [x] Complete summary of the quotation (Client, Projects, Packages, Pricing).
- [x] Preview of Terms & Conditions.
- [x] Save as draft or Finalize & Send.

### File Cleanup

- [x] Unused step directories deleted.
- [x] Shared components moved to `shared/`.
- [x] Barrel exports updated.

---

## 🚀 Status Updates

| Date       | Status      | Notes                                                                     |
| ---------- | ----------- | ------------------------------------------------------------------------- |
| 2026-02-03 | in-progress | Story created, beginning work                                             |
| 2026-02-03 | refining    | Refined Step 3 with Package Summary and Step 4 with default T&C expansion |
| 2026-02-03 | iterating   | Removing Step 3 (Projects) and merging logic into upgraded Step 2         |
