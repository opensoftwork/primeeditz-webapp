# Story 24.6: Remove Duplicate Download from Quick Actions

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Tiny (1 point)
**Created**: 2026-02-27
**Priority**: HIGH — Combined with 24.5

---

## 📋 User Story

**As an** Admin,
**I want** a single Download PDF button (in the header only),
**So that** I don't see duplicate download options.

---

## 🔗 Dependencies & Context

- **Combined with**: Story 24.5 — both removals happen in the same file

---

## ✅ Acceptance Criteria

- [ ] **Given** the Quick Actions sidebar
- [ ] **When** looking for download options
- [ ] **Then** no download action exists in Quick Actions
- [ ] **And** the header retains the "Download PDF" button

---

## 📁 Files to Update

| File                                                                          | Change                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------- |
| `src/components/modules/admin/quotations/detail/components/quick-actions.tsx` | Remove `DownloadQuotation` import and usage |

---

## 🚀 Definition of Done

- [ ] Download removed from Quick Actions
- [ ] Header Download PDF still works
- [ ] `DownloadQuotation` import removed from quick-actions.tsx
- [ ] Story marked as `done`

---

**Previous Story**: 24-5 - Remove duplicate Quick Actions
**Next Story**: 24-7 - Fix builder Step 3 action duplication
