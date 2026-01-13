# Decision Record: Quotation vs Folder Setup Sequencing

**Date**: 2026-01-12  
**Status**: Approved  
**Decision Maker**: Life-design (Product Owner) + John (PM Agent)  
**Context**: Sprint planning for Epic 3 & 4 dependencies

---

## 📋 Summary

**Decision**: Build Quotation flow (Epic 4 stories) BEFORE Folder Setup (Story 3.4).

---

## 🔍 Context

During sprint planning, we identified a dependency conflict:

- **Story 3.4 (Folder Setup)** was in backlog, ready to be picked up
- **Epic 4 (Quotation System)** was also in backlog
- The PRD workflow shows folders should only be created AFTER quotation approval

---

## 📊 Analysis

### PRD-Defined Workflow

```
Client Creates Project Request (pending_review)
        ↓
Admin Reviews Project → Creates Quotation
        ↓
Quotation: draft → sent
        ↓
Client Views → Approves Quotation
        ↓
Quotation: approved
        ↓
Admin Sets Up Folders (from template)    ← GATE: Requires quotation approval
        ↓
Client Can Upload Assets
```

### Key Dependencies Identified

| Action           | Prerequisite                              | Reason                       |
| ---------------- | ----------------------------------------- | ---------------------------- |
| Create Quotation | Project exists, status = `pending_review` | Admin reviews first          |
| Setup Folders    | Quotation status = `approved`             | Client must agree to pricing |
| Client Upload    | Folders exist + Quotation approved        | Work commitment              |

---

## ✅ Decision

**Re-sequence backlog as follows:**

| Priority | Story                                | Epic   | Rationale                         |
| -------- | ------------------------------------ | ------ | --------------------------------- |
| 1        | 3.8 - Quotation Templates Management | Epic 3 | Admin configures templates first  |
| 2        | 4.1 - Create Quotation from Template | Epic 4 | Admin can create quotations       |
| 3        | 4.3 - Send Quotation to Client       | Epic 4 | Client can view quotation         |
| 4        | 4.4/4.5 - Client Approve/Reject      | Epic 4 | Gate for folder setup             |
| 5        | 3.10 - Folder Templates Config       | Epic 3 | Admin configures folder templates |
| 6        | 3.4 - Project Stage/Folder Setup     | Epic 3 | Now has proper prerequisites      |

---

## 📁 Affected Artifacts

- `sprint-status.yaml` - To be updated with new sequencing
- `03-admin-portal-management.md` - Epic 3 story order
- `04-quotation-system.md` - Epic 4 activation

---

## 🎯 Next Actions

1. [ ] Update sprint-status.yaml with new priorities
2. [ ] Create Story 3.8 (Quotation Templates Management) file
3. [ ] Begin implementation of 3.8
4. [ ] Proceed with Epic 4 stories in sequence

---

## 📝 Notes

- This decision aligns with the PRD's business logic
- Folder Setup without quotation approval would result in disabled UI states
- Quotation flow delivers immediate business value to clients
