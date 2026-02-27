# Story 24.9: End-to-End Status Flow Testing

**Epic**: Epic 24 - Quotation Status Machine & Action Consolidation
**Status**: backlog
**Complexity**: Small (3 points)
**Created**: 2026-02-27
**Priority**: MEDIUM — Final validation

---

## 📋 User Story

**As a** QA/Admin,
**I want** to verify both quotation flows end-to-end,
**So that** all status transitions work correctly after the refactoring.

---

## ✅ Test Scenarios

### Flow A: Studio-Initiated

```
Studio: requestQuotation → status: "initiated"
  → Admin Detail: sees Review Protocol (Approve/Reject)
  → Admin: approveQuotation → status: "approved", projects spawned
  → OR Admin: rejectQuotationByAdmin → status: "rejected"
```

### Flow B: Admin-Initiated

```
Admin: createQuotation → status: "draft"
  → Admin Detail: NO Review Protocol shown
  → Admin: clicks "Finalize" → Finalize drawer opens
  → Admin: "Send to Studio" → sendQuotation → status: "sent"
  → Studio: views → status: "viewed"
  → Studio: acceptQuotation → status: "approved", projects spawned
  → OR Studio: requestQuotationChanges → status: "changes_requested"
  → Admin: edits → re-sends → sendQuotation → status: "sent"
```

### Flow C: Public Link

```
Admin: createQuotation → status: "draft"
  → Admin: "Copy Public Link" → sendQuotation + clipboard copy → status: "sent"
  → Public visitor: opens link → markQuotationViewed → status: "viewed"
  → Visitor: signs in → acceptQuotation → status: "approved"
```

---

## 🚀 Definition of Done

- [ ] Flow A tested end-to-end (studio → admin approve)
- [ ] Flow B tested end-to-end (admin → send → studio accept)
- [ ] Flow C tested (public link → sign in → accept)
- [ ] No regression in existing quotation functionality
- [ ] Story marked as `done`

---

**Previous Story**: 24-8 - Verify studio Accept/Decline
**Next Story**: None (last in epic)
