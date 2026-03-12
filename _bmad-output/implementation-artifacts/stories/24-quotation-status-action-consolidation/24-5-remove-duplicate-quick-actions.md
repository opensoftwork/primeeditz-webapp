# Story 24.5: Remove Duplicate Actions from Quick Actions

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Small (2 points)
**Created**: 2026-02-27
**Priority**: HIGH — Cleanup after Finalize drawer

---

## 📋 User Story

**As an** Admin,
**I want** the Quick Actions sidebar to only contain unique actions not available elsewhere,
**So that** I'm not confused by duplicate buttons for the same action.

---

## 🔗 Dependencies & Context

- **Depends on**: Story 24.4 (Finalize drawer absorbs Send functionality)

---

## ⚠️ Current State Analysis

### `quick-actions.tsx` (lines 50-98) currently shows:

| Action                 | Also In Header?                                 | Keep?     |
| ---------------------- | ----------------------------------------------- | --------- |
| **Send to Studio**     | ✅ Header has "Finalize" (was "Send to Studio") | ❌ Remove |
| **Download Quotation** | ✅ Header has "Download PDF"                    | ❌ Remove |
| **Duplicate as New**   | ❌ Unique to Quick Actions                      | ✅ Keep   |
| **Delete Quotation**   | ❌ Unique to Quick Actions                      | ✅ Keep   |

---

## ✅ Acceptance Criteria

- [ ] **Given** the Quick Actions sidebar
- [ ] **When** viewing it on the detail page
- [ ] **Then** it shows only: Duplicate as New, Delete Quotation
- [ ] **And** "Send to Studio" button is removed
- [ ] **And** "Download Quotation" button is removed
- [ ] **And** the `onSend` prop is no longer needed in QuickActionsProps

---

## 📁 Files to Update

| File                                                                          | Change                                       |
| ----------------------------------------------------------------------------- | -------------------------------------------- |
| `src/components/modules/admin/quotations/detail/components/quick-actions.tsx` | Remove Send + Download, remove `onSend` prop |
| `src/components/modules/admin/quotations/detail/quotation-detail.tsx`         | Remove `onSend` pass-through to QuickActions |

---

## 🚀 Definition of Done

- [ ] Quick Actions only shows Duplicate + Delete
- [ ] No duplicate actions between header and sidebar
- [ ] Props cleaned up (no unused `onSend`)
- [ ] Story marked as `done`

---

**Previous Story**: 24-4 - Create Finalize drawer
**Next Story**: 24-6 - Remove duplicate Download from Quick Actions
