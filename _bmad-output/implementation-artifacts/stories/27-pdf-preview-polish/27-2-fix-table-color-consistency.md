# Story 27.2: Fix Table Column Color Consistency in PDF

**Epic**: Epic 27 - PDF Preview Polish
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: MEDIUM — Cosmetic polish

---

## 📋 User Story

**As an** Admin,
**I want** the PDF table columns to have uniform background shading,
**So that** the downloaded quotation looks professional and consistent.

---

## ⚠️ Current State Analysis

The discussion notes mention that Unit/Rate columns have a different shade than Qty/Amount columns. This needs visual verification by downloading a PDF.

The `download-quotation.tsx` (lines 267-280) sets explicit CSS variable overrides for the hidden render container, which may affect column colors.

---

## ✅ Acceptance Criteria

- [ ] **Given** a PDF is downloaded
- [ ] **When** inspecting the line items table
- [ ] **Then** all data columns (Unit, Qty, Rate, Amount) have the same background color
- [ ] **And** the header row uses a consistent background
- [ ] **And** alternating row shading (if present) spans all columns uniformly

---

## 📁 Files to Update

| File                                                                     | Change                            |
| ------------------------------------------------------------------------ | --------------------------------- |
| `src/components/modules/admin/quotations/preview/quotation-document.tsx` | Fix column background consistency |
| `src/components/modules/admin/quotations/preview/download-quotation.tsx` | Verify CSS variable overrides     |

---

## 🚀 Definition of Done

- [ ] All table columns have uniform shading
- [ ] Verified by downloading a PDF
- [ ] Story marked as `done`

---

**Previous Story**: 27-1 - Add signatures
**Next Story**: 27-3 - Remove expand/collapse arrows from PDF
