# Story 25.2: Audit and Verify QT Code Display Across All Surfaces

**Epic**: Epic 25 - Quotation ID & Display Fixes
**Status**: backlog
**Complexity**: Tiny (1 point)
**Created**: 2026-02-27
**Priority**: MEDIUM — Verification after fix

---

## 📋 User Story

**As a** QA/Admin,
**I want** to verify that the sequential QT code is displayed consistently everywhere,
**So that** there are no other surfaces with fabricated or incorrect codes.

---

## ✅ Acceptance Criteria

### Surface Audit

- [ ] **Given** a quotation with code `QT-000003`
- [ ] **When** checking each surface
- [ ] **Then** all show `QT-000003`:

| Surface               | File                          | Status                   |
| --------------------- | ----------------------------- | ------------------------ |
| Admin quotation list  | `columns.tsx`                 | ✅ Uses `quotation.code` |
| Admin detail header   | `detail-header.tsx`           | ✅ Uses `quotation.code` |
| Admin preview/PDF     | `quotation-document.tsx`      | ✅ Uses `quotation.code` |
| Public view           | `public-quotation-view.tsx`   | ✅ Uses `quotation.code` |
| Studio detail         | `studio-quotation-detail.tsx` | ✅ Uses `quotation.code` |
| Builder Step 3        | `step3/index.tsx`             | **FIXED in 25.1**        |
| Builder Step 3 header | `review-header.tsx`           | **Verify**               |
| Breadcrumbs           | `quotation-builder.tsx`       | **Verify**               |

---

## 🚀 Definition of Done

- [ ] All surfaces verified to show real `quotation.code`
- [ ] No `slice(-6)` or hash-based fabrication anywhere
- [ ] Story marked as `done`

---

**Previous Story**: 25-1 - Fix fabricated QT code
**Next Story**: None (last in epic)
