# Brainstorming Session: Quotation System Architecture

**Date**: 2026-01-12 to 2026-01-13  
**Facilitator**: AI Brainstorming Agent  
**Participant**: Life-design (Product Owner)  
**Session Type**: Architecture + Design + Prioritization

---

## 📋 Session Overview

**Topic**: Architecting a modular, portable Quotation/ERP system for PrimeEditz

**Goals**:

- Scalable architecture for quotation management
- Extreme modularity for copy-paste portability to other projects
- Backend portability via Convex Components architecture
- UI portability via modular React component structure

---

## 🎯 Techniques Used

### Phase 1: System Decomposition

**Duration**: ~25 min  
**Focus**: Component mapping and inventory

### Phase 2: Constraint Analysis (Integrated)

**Duration**: ~20 min  
**Focus**: Portability requirements and phasing decisions

---

## 💡 Key Insights Generated

### Architectural Decisions

| Decision                                   | Rationale                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------- |
| **Quotation as First-Class Entity**        | Not a child of Project; enables standalone quotes, internal estimates, multi-project linking |
| **Templates Independent of Project Types** | Allows reuse across contexts; optional "hint" for UI filtering only                          |
| **Configurable Sections**                  | Replaces hardcoded categories (Design/Interior/Construction) with user-managed sections      |
| **Optional Client Linking**                | Supports internal estimates without client assignment                                        |
| **Versioning with Parent Link**            | `parentQuotationId` enables revision tracking without duplicating data                       |
| **Phased Implementation**                  | MVP → Client Workflow → Integration → ERP Extensions                                         |

### Data Model Decisions

| Entity                          | Key Decision                                               |
| ------------------------------- | ---------------------------------------------------------- |
| `quotationSections`             | User-configurable, not hardcoded                           |
| `quotationTemplates`            | Independent, `projectTypeHint` is optional soft filter     |
| `quotations`                    | `clientId` optional, `projectIds` is array (0, 1, or many) |
| `lineItems`                     | Nested hierarchy with `subItems[]`                         |
| `version` + `parentQuotationId` | Revision tracking                                          |

### Portability Requirements

| Layer              | Approach                                                              |
| ------------------ | --------------------------------------------------------------------- |
| **Convex Backend** | Structure as local Convex Component in `convex/components/quotation/` |
| **React Frontend** | Modular components in `src/components/modules/quotation/`             |
| **Configuration**  | All domain-specific values (sections, tax rates) are database-driven  |

---

## 📊 Feature Phasing

### Phase A: Foundation (MVP)

- Quotation Sections Configuration
- Quotation Templates CRUD
- Create Quotation (Standalone)
- Quotation Line Items (with nested hierarchy)
- Quotation Preview & Print

### Phase B: Client Workflow

- Send Quotation to Client
- Client View Quotation
- Client Approve Quotation
- Client Request Changes (with notes)
- Quotation Versioning & Revision History

### Phase C: Integration & Library

- Link Quotation to Project(s)
- Item Library CRUD
- Add Items from Library to Quotation
- Project Type Hints for Templates

### Phase D: ERP Extensions (Future)

- Recurring Client Tracking
- Multi-Currency Support
- Payment Tracking & Invoicing
- Quotation Expiry & Reminders

---

## 📋 Plan of Action

### Immediate Next Steps

| #   | Action                               | Owner           | Notes                                    |
| --- | ------------------------------------ | --------------- | ---------------------------------------- |
| 1   | ✅ Update sprint-status.yaml         | Done            | New Epic 4 structure with phased stories |
| 2   | ✅ Fix component naming              | Done            | Kebab-case for all file names            |
| 3   | **Resolve Story 3.8 vs 4.2 overlap** | Decision needed | See analysis below                       |
| 4   | Create Story 4.1 file                | Next            | Quotation Sections Configuration         |
| 5   | Begin Phase A implementation         | Dev             | Start with sections, then templates      |

### Story 3.8 vs Epic 4 Analysis

**Current State:**

- Story 3.8 (Quotation Templates Management) exists in Epic 3
- Story 4.2 (Quotation Templates CRUD) now exists in Epic 4

**Recommendation: Keep Story 3.8 as the implementation story**

| Reason                   | Explanation                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| **Already detailed**     | 3.8 has complete tasks, acceptance criteria, and phases                    |
| **Ready-for-dev status** | Already marked as next priority                                            |
| **Enables Epic 4**       | Templates are prerequisite for quotation creation                          |
| **Logical separation**   | Templates are "configuration" (Epic 3), Quotations are "workflow" (Epic 4) |

**Action**: Mark 4.2 as "see 3.8" or merge the story reference.

### Development Sequence

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION ORDER                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  WEEK 1: Setup & Configuration                               │
│  ├── 4.1 Quotation Sections (new - 3 pts)                   │
│  └── 3.8 Quotation Templates (existing - 8 pts)             │
│                                                              │
│  WEEK 2: Core Quotation                                      │
│  ├── 4.3 Create Quotation Standalone (8 pts)                │
│  └── 4.4 Line Items with Nested Hierarchy (8 pts)           │
│                                                              │
│  WEEK 3: Preview & Client                                    │
│  ├── 4.5 Preview & Print (3 pts)                            │
│  ├── 4.6 Send to Client (3 pts)                             │
│  └── 4.7 Client View Quotation (5 pts)                      │
│                                                              │
│  WEEK 4: Approval & Versioning                               │
│  ├── 4.8 Client Approve (3 pts)                             │
│  ├── 4.9 Client Request Changes (5 pts)                     │
│  └── 4.10 Versioning & History (8 pts)                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Files to Create

| Story | File Path                                         | Priority |
| ----- | ------------------------------------------------- | -------- |
| 4-1   | `stories/4-1-quotation-sections-configuration.md` | HIGH     |
| 4-3   | `stories/4-3-create-quotation-standalone.md`      | MEDIUM   |
| 4-4   | `stories/4-4-quotation-line-items-nested.md`      | MEDIUM   |

---

## 🔗 Output Artifacts

| Artifact         | Location                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| Epic 4 Document  | `planning-artifacts/epics/04-quotation-system.md`                        |
| Reference Design | `implementation-artifacts/references/quotation-design.tsx`               |
| Decision Record  | `planning-artifacts/decisions/2026-01-12-quotation-folder-sequencing.md` |

---

## 💭 Open Questions (For Future Sessions)

1. **Multi-Currency**: Should we design for INR only or multi-currency from start?
2. **PDF Export**: Is print mode sufficient, or do we need server-generated PDFs?
3. **Email Notifications**: When client views/approves, should admin be notified?
4. **GST/Tax Complexity**: Line-item level tax, or quotation-level only?

---

## ✅ Session Outcome

**Primary Deliverable**: Comprehensive Epic 4 document with:

- 18 stories across 4 phases
- Complete data architecture
- Convex Component structure
- UI component hierarchy
- Status workflow diagram

**Next Step**: Begin implementation with Story 4.1 (Quotation Sections Configuration) or Story 3.8 (Quotation Templates - if templates are needed first)
