# Story 26.2: Visual Parity Verification Across All Views

**Epic**: Epic 26 - Public Link & Grouping Consistency
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: MEDIUM — Verification after grouping fix

---

## 📋 User Story

**As a** QA/Admin,
**I want** to verify that all 5 quotation views display the same grouping structure,
**So that** the presentation is consistent regardless of where the quotation is viewed.

---

## ✅ Acceptance Criteria

### Side-by-Side Verification

- [ ] **Given** a quotation with 2+ packages
- [ ] **When** viewing it on all 5 surfaces
- [ ] **Then** grouping structure matches:

| View            | Expected Grouping                                     |
| --------------- | ----------------------------------------------------- |
| Admin Detail    | By project → by section ✅                            |
| Builder Step 3  | By package → by section ✅                            |
| Studio Detail   | By project → by section ✅                            |
| PDF Preview     | By package → table with sub-items ✅                  |
| **Public View** | By package → table with sub-items (**FIXED in 26.1**) |

### Sub-Item Consistency

- [ ] **Given** a quotation with sub-items (Level 2 and Level 3)
- [ ] **When** comparing across views
- [ ] **Then** hierarchical numbering is consistent (1, 2, 2.1, etc.)

### Per-Group Totals

- [ ] **Given** a multi-package quotation
- [ ] **When** comparing per-package subtotals
- [ ] **Then** all views calculate identically

---

## 🚀 Definition of Done

- [ ] All 5 views verified with identical test data (2+ packages)
- [ ] Sub-item numbering consistent
- [ ] Per-package subtotals match
- [ ] Story marked as `done`

---

**Previous Story**: 26-1 - Port package grouping
**Next Story**: None (last in epic)
