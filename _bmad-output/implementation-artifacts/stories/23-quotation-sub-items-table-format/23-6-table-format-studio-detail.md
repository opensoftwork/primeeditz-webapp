# Story 23.6: Table Format for Studio Quotation Detail View

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: review
**Complexity**: Small (3 points)
**Created**: 2026-02-24
**Priority**: MEDIUM — Studio view should match client view quality

---

## 📋 User Story

**As a** Studio user,
**I want** to see quotation line items in a professional table format with sub-item hierarchy,
**So that** I can clearly review the pricing breakdown before accepting or rejecting.

---

## 🔗 Dependencies

- **Depends on**: Story 23.1 (Schema), Story 23.4 (Shared table component)

---

## ⚠️ Current State

1. **Client view** (`client/quotations/detail/components/quotation-line-items-view.tsx`) — Already has full table format with recursive sub-item rendering ✅
2. **Studio view** (`studio/quotations/detail/studio-quotation-detail.tsx`) — Uses `QuotationLineItemsView` imported from `".."` barrel export
3. Need to verify whether the studio version uses the same component as the client version or has its own implementation

---

## ✅ Acceptance Criteria

### Table Format in Studio View

- [x] **Given** I am viewing a quotation as a Studio user
- [x] **When** line items are displayed
- [x] **Then** they render in an HTML table format
- [x] **And** columns are: #, Description, Unit, Qty, Rate, Amount

### Sub-Item Rendering

- [x] **Given** a line item has sub-items
- [x] **When** displayed in the studio quotation detail
- [x] **Then** sub-items show with hierarchical numbering (1.1, 1.1.1)
- [x] **And** sub-items are visually indented with `└` connectors
- [x] **And** dark theme styling is consistent with admin portal

### Section and Project Grouping

- [x] **Given** items are grouped by sections/projects
- [x] **When** displayed in studio view
- [x] **Then** section headers and dividers render correctly
- [x] **And** project headers with totals render when applicable

### Public View Consistency

- [x] **Given** a quotation is shared via public link
- [x] **When** viewed on the public quotation page
- [x] **Then** sub-items render in table format with proper numbering

---

## 📁 Files to Update

| File                                                   | Change                                          |
| ------------------------------------------------------ | ----------------------------------------------- |
| `studio/quotations/detail/studio-quotation-detail.tsx` | Verify QuotationLineItemsView is used correctly |
| `studio/quotations/public/public-quotation-view.tsx`   | Verify sub-items render in public view          |
| `client/quotations/public/public-quotation-view.tsx`   | Verify sub-items render in public view          |

---

## 🛠 Tasks/Subtasks

- [x] **Task 1: Verify & Update Studio Detail View**
  - [x] Inspect `src/components/modules/studio/quotations/detail/studio-quotation-detail.tsx`
  - [x] Ensure it uses the table-based `QuotationLineItemsView`
  - [x] Verify dark theme styling and prop passing for sub-items
  - [x] Run type check to ensure no regressions

- [x] **Task 2: Verify & Update Public Quotation Views**
  - [x] Inspect `src/components/modules/studio/quotations/public/public-quotation-view.tsx`
  - [x] Inspect `src/components/modules/client/quotations/public/public-quotation-view.tsx`
  - [x] Confirm table format is applied and sub-items render correctly
  - [x] Fix any import or component mismatches

- [x] **Task 3: Quality Assurance & Visual Verification**
  - [x] Verify hierarchical numbering (1.1, 1.1.1) in all views
  - [x] Confirm section headers and totals are correctly displayed
  - [x] Mark story as complete

---

## 🚀 Definition of Done

- [x] Studio detail view shows line items in table format
- [x] Sub-items render with 3-level hierarchical numbering
- [x] Dark theme styling is correct and consistent
- [x] Public quotation view renders sub-items in table format
- [x] Both project-grouped and section-grouped layouts work
- [x] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status      | Notes                                                                                    |
| ---------- | ----------- | ---------------------------------------------------------------------------------------- |
| 2026-02-24 | backlog     | Created — mostly verification                                                            |
| 2026-02-24 | in-progress | Started — refactored studio QuotationLineItemsView to recursive LineItemRow              |
| 2026-02-24 | review      | Completed — all views updated, recursive rendering verified, TSC passes clean (0 errors) |

---

**Previous Story**: 23-5 - Sub-Items in Admin Preview/PDF
**Next Story**: 23-7 - Sub-Item CRUD in Service Package Builder
