# Story 24.7: Fix Builder Step 3 — Deduplicate "Send to Studio" from Header

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: HIGH — Builder has its own duplicate action problem

---

## 📋 User Story

**As an** Admin building a quotation,
**I want** the "Send to Studio" action to appear only once in the Review Protocol Card,
**So that** I'm not confused by the same button appearing in both the header and the sidebar.

---

## 🔗 Dependencies & Context

- **Depends on**: Story 24.4 (Finalize drawer concept)
- **Related**: Builder Step 3 has its own action bar pattern

---

## ⚠️ Current State Analysis

### Builder Step 3 has TWO places for "Send to Studio":

1. **`review-header.tsx`**: Header bar with DRAFT, Preview, Download PDF, **SEND TO STUDIO**
2. **`review-protocol-card.tsx`**: Right sidebar with **SEND TO STUDIO** + "FINALIZE & CLOSE"

---

## ✅ Acceptance Criteria

- [ ] **Given** the builder Step 3 review page
- [ ] **When** viewing the header bar
- [ ] **Then** only shows: DRAFT badge, Preview, Download PDF (no Send to Studio)
- [ ] **And** the Review Protocol Card retains both actions (Send to Studio + Finalize & Close)

---

## 📁 Files to Update

| File                                                                                        | Change                                     |
| ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `src/components/modules/admin/quotations/builder/steps/step3-review-send/review-header.tsx` | Remove "SEND TO STUDIO" button from header |

---

## 🚀 Definition of Done

- [ ] Header bar in builder Step 3 has no "SEND TO STUDIO" button
- [ ] Review Protocol Card retains the action buttons
- [ ] Preview and Download PDF buttons still work in header
- [ ] Story marked as `done`

---

**Previous Story**: 24-6 - Remove duplicate Download
**Next Story**: 24-8 - Verify studio-side Accept/Decline flow
