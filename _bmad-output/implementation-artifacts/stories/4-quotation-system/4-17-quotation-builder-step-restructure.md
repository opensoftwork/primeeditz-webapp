# Story 4-17: Quotation Builder Step Restructure

**Epic**: Epic 4 - Quotation System  
**Status**: done  
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
│                 CURRENT STRUCTURE (5 Steps)                      │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Studio & Context      → Select studio, validity        │
│  Step 2: Projects              → Select projects                 │
│  Step 3: Template Selection    → Choose templates per project    │
│  Step 4: Calculate Worth       → Line items and pricing          │
│  Step 5: Terms & Conditions    → Terms editor + save             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 NEW STRUCTURE (5 Steps)                          │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Studio & Context      → Select studio + validity ✅    │
│  Step 2: Package Selection     → Select service packages ✅      │
│  Step 3: Project & Templates   → Project + folder template combo ✅│
│  Step 4: Items & Terms         → Line items + subtotal + T&C ✅  │
│  Step 5: Review & Send         → Review summary + send to client ✅│
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Acceptance Criteria

### Step Labels Update

- [x] The steps show: 1. Studio & Context, 2. Package Selection, 3. Project & Templates, 4. Items & Terms, 5. Review & Send.

### Step 2: Package Selection

- [x] Multi-package selection support.
- [x] Proceed without selecting any package (Custom Quote).
- [x] Package selection auto-populates folder templates and line items.

### Step 3: Project & Folder Template Selection

- [x] Select projects for the quotation.
- [x] Choose a folder template for each project.
- [x] Multi-project support with template mapping.
- [x] **Package Selection Summary**: Show included services and subtotal from selected packages.
- [x] **Visual Cues**: Badge projects matched with selected packages.

### Step 4: Items & Terms Combined

- [x] Line items table with pricing.
- [x] Subtotal, tax, and grand total calculations.
- [x] Terms & Conditions editor in the same view.
- [x] **Default Expanded**: Terms & Conditions section is expanded by default for easier review.

### Step 5: Review & Send

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
| 2026-02-03 | done        | Restructuring complete with multi-package support and pricing visibility  |
