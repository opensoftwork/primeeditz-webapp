# Epic 11: System Architecture Revamp — Master Plan

**Epic Owner**: Architect/PM  
**Status**: Planning  
**Created**: 2026-01-23  
**Complexity**: Very High (System-wide restructuring)  
**Context**: Brainstorming/Architectural Review 2026-01-23

---

## 📋 Executive Summary

This **umbrella epic** orchestrates a comprehensive restructuring of the PrimeEditz platform. Due to its scope, it is **split into multiple sub-epics** for clean separation of concerns and parallel execution.

### **Key Drivers**

1.  **B2B Clarity**: Rename "Client" → "Studio" to reflect the partnership model.
2.  **Quotation-Driven Workflow**: Projects are created _from_ Quotation approval, not the other way around.
3.  **Event-Based Asset Segregation**: Folder templates organize content by ceremony/event, not workflow stage.
4.  **Flexible Pricing**: Line items in quotations can spawn projects, represent add-ons, or be purely physical items.

---

## 🗂️ Sub-Epic Breakdown

This master plan is decomposed into **four focused sub-epics**:

| Epic ID | Title                         | Focus Area                                               | Estimated Points |
| :------ | :---------------------------- | :------------------------------------------------------- | :--------------- |
| **11A** | Schema & Data Foundation      | Backend data model changes, migrations, seeding          | 13               |
| **11B** | Quotation Engine Enhancements | Quotation Template linking, Project spawning logic       | 21               |
| **11C** | Studio Portal Revamp          | Studio Dashboard, Quote Request flow, Project Onboarding | 34               |
| **11D** | Terminology & Routing Cleanup | Role rename, Route rename, UI text updates               | 13               |

**Total Estimated Story Points: 81**

---

## 📐 Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                       Epic 11A                               │
│           Schema & Data Foundation (MUST GO FIRST)          │
└─────────────────────────────┬───────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
           ▼                  ▼                  │
┌───────────────────┐ ┌───────────────────┐      │
│     Epic 11B      │ │     Epic 11C      │      │
│    Quotation      │ │  Studio Portal    │      │
│     Engine        │ │     Revamp        │      │
└─────────┬─────────┘ └─────────┬─────────┘      │
          │                     │                │
          └──────────┬──────────┘                │
                     │                           │
                     ▼                           │
          ┌───────────────────┐                  │
          │     Epic 11D      │◄─────────────────┘
          │   Terminology &   │  (Can start after 11A,
          │  Routing Cleanup  │   but safest last)
          └───────────────────┘
```

---

## 📁 Epic 11A: Schema & Data Foundation

**Goal**: Prepare the data layer for the new architecture without breaking existing functionality.

### Stories

| ID    | Story                                                | AC Summary                                                       | Points |
| :---- | :--------------------------------------------------- | :--------------------------------------------------------------- | :----- |
| 11A.1 | Add `quotationId` to `projects` schema               | Field exists, indexes created, backfill null                     | 2      |
| 11A.2 | Enhance `quotationTemplates.lineItems`               | Add `spawnsProject`, `projectTypeId`, `selectedFolderTemplateId` | 3      |
| 11A.3 | Add `variant` and `description` to `folderTemplates` | Schema update for event-type variants                            | 2      |
| 11A.4 | Event-Based Folder Template Seeding                  | Update seeds to use event names (Day 1 - Muhurtham)              | 3      |
| 11A.5 | Add `studio` role to `roleValidator`                 | Side-by-side introduction                                        | 1      |
| 11A.6 | Create `migrateClientToStudio` mutation              | Internal migration script                                        | 2      |

---

## 📁 Epic 11B: Quotation Engine Enhancements

**Goal**: Enable quotation templates to define project creation rules and automate spawning.

### Stories

| ID    | Story                                               | AC Summary                               | Points |
| :---- | :-------------------------------------------------- | :--------------------------------------- | :----- |
| 11B.1 | Admin UI: Link Line Items to Project Types          | Dropdown in quotation template builder   | 5      |
| 11B.2 | Admin UI: Select Folder Template per Spawnable Item | Picker in quotation builder/configurator | 5      |
| 11B.3 | Backend: `spawnProjectsFromQuotation` mutation      | Create projects on quote approval        | 8      |
| 11B.4 | Display Spawned Projects on Quotation Detail        | List projects generated from a quote     | 3      |

---

## 📁 Epic 11C: Studio Portal Revamp

**Goal**: Rebuild the Studio (formerly Client) experience around the Quote → Project flow.

### Stories

| ID    | Story                                     | AC Summary                                     | Points |
| :---- | :---------------------------------------- | :--------------------------------------------- | :----- |
| 11C.1 | Replace Wizard with Quote Request Flow    | Studio selects package, enters End Client name | 8      |
| 11C.2 | "My Quote Requests" List View             | Studio sees pending/approved quotes            | 5      |
| 11C.3 | "My Projects" Grouped by End Client       | List projects under End Client labels          | 5      |
| 11C.4 | Project Onboarding Card                   | Post-creation CTA for reference file upload    | 5      |
| 11C.5 | Adapt Existing Wizard for Onboarding Only | Steps 3, 4, 5 for reference files/notes        | 5      |
| 11C.6 | Studio Project Detail View                | Focused view linking back to quote             | 3      |
| 11C.7 | Deprecate Step 0, 1, 2 for Studio Mode    | Conditional wizard rendering                   | 3      |

---

## 📁 Epic 11D: Terminology & Routing Cleanup

**Goal**: Complete the rebranding from "Client" to "Studio".

### Stories

| ID    | Story                                      | AC Summary                            | Points |
| :---- | :----------------------------------------- | :------------------------------------ | :----- |
| 11D.1 | Remove `client` from `roleValidator`       | Requires 11A.6 migration completed    | 2      |
| 11D.2 | Rename `@client` route folder to `@studio` | File system rename                    | 3      |
| 11D.3 | Update `layout.tsx` slot references        | `client` prop → `studio`              | 2      |
| 11D.4 | Rename `clientMutation`/`clientQuery`      | Backend function wrappers             | 3      |
| 11D.5 | UI Label Pass (Global Text Update)         | "Client" → "Studio" in all UI strings | 3      |

---

## 🔗 Cross-Cutting Concerns

These items apply across multiple sub-epics:

| Concern                     | Affected Stories | Notes                                       |
| :-------------------------- | :--------------- | :------------------------------------------ |
| **Backward Compatibility**  | 11A.\*, 11B.3    | Existing projects must continue to work     |
| **Real-time Subscriptions** | 11C.2, 11C.3     | Update counts when quotes/projects change   |
| **Access Control**          | 11B._, 11C._     | Ensure only owning Studio sees their data   |
| **Status Machine**          | 11B.3            | New projects start in correct `actionState` |

---

## ✅ Acceptance Criteria (Epic Level)

- [ ] A Studio can request a quote by selecting a package template.
- [ ] When Admin approves a quote, projects are auto-created.
- [ ] Each project is linked to its parent `quotationId`.
- [ ] Studios see their projects grouped by End Client name.
- [ ] The existing wizard serves only as an "Onboarding" step for reference files.
- [ ] "Client" terminology is fully replaced by "Studio" in UI and code.

---

## 📝 Affected Existing Epics

The following existing epics require **updates or deprecation notes**:

| Epic                                        | Change Needed                                                                       |
| :------------------------------------------ | :---------------------------------------------------------------------------------- |
| **Epic 2: Client Portal — Project Request** | Stories 2.0-2.6 are **superseded** by Epic 11C. Story 2.7 (Detail View) is updated. |
| **Epic 3: Admin Portal Management**         | Story 3.11 (Admin-initiated wizard) is updated to use new linkage.                  |
| **Epic 4: Quotation System**                | Phase C is **superseded** by Epic 11B.                                              |

---

## 🚀 Recommended Execution Order

1.  **Epic 11A** (Schema) — Must be first.
2.  **Epic 11B** (Backend Logic) — Depends on 11A.
3.  **Epic 11C** (Frontend Revamp) — Depends on 11A, parallel with 11B.
4.  **Epic 11D** (Cleanup) — Final pass, after 11C is validated.

---

_Document Version: 1.0_  
_Last Updated: 2026-01-23 23:20 IST_
