# Story 27.3: Remove Expand/Collapse Arrows from Sub-Items in PDF

**Epic**: Epic 27 - PDF Preview Polish
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: MEDIUM — Cosmetic polish

---

## 📋 User Story

**As an** Admin,
**I want** the PDF/preview to show sub-items as static rows without interactive arrows,
**So that** the printed document looks clean and professional.

---

## ⚠️ Current State Analysis

The interactive admin detail view uses `>` expand/collapse arrows on items with sub-items. If the PDF render component reuses or inherits these interactive elements, arrows may appear in the PDF output.

---

## ✅ Acceptance Criteria

- [ ] **Given** a quotation with sub-items
- [ ] **When** downloading the PDF
- [ ] **Then** no `>` arrows, chevrons, or expand/collapse icons appear
- [ ] **And** sub-items are rendered as indented rows with hierarchical numbering
- [ ] **And** all sub-items are expanded (visible) in the PDF

---

## 📁 Files to Update

| File                                                                     | Change                                     |
| ------------------------------------------------------------------------ | ------------------------------------------ |
| `src/components/modules/admin/quotations/preview/quotation-document.tsx` | Ensure static rendering path for sub-items |
| Related line-item rendering components used in preview                   | Remove interactive elements                |

---

## 🚀 Definition of Done

- [ ] No arrows/chevrons in PDF output
- [ ] Sub-items displayed as static indented rows
- [ ] Verified by downloading a PDF with sub-items
- [ ] Story marked as `done`

---

**Previous Story**: 27-2 - Fix table colors
**Next Story**: 27-4 - PDF performance optimization
