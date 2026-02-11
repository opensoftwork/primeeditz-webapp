# Epic 14: Project Type + Folder Template Integration

**Status**: Backlog  
**Epic Document**: [14-project-type-folder-template-integration.md](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)

---

## Overview

This epic restructures the relationship between Project Types and Folder Templates from a loose association to a tightly coupled, parent-child hierarchy. Project Types become the "parent container" for Folder Templates, with a stepper-based creation/edit flow.

---

## Stories

| Story                                                | Title                                          | Points | Status  | Depends On  |
| ---------------------------------------------------- | ---------------------------------------------- | ------ | ------- | ----------- |
| [14.1](./14-1-wizard-context-infrastructure.md)      | Wizard Context & Infrastructure                | 3      | backlog | -           |
| [14.2](./14-2-step-1-identity-form.md)               | Step 1 — Project Type Identity Form            | 2      | backlog | 14.1        |
| [14.3](./14-3-step-2-folder-hierarchy.md)            | Step 2 — Folder Hierarchy Builder              | 3      | backlog | 14.1        |
| [14.4](./14-4-step-3-review-submit.md)               | Step 3 — Review & Submit                       | 3      | backlog | 14.2, 14.3  |
| [14.5](./14-5-wizard-stepper-layout.md)              | Project Type Wizard — Stepper Layout           | 3      | backlog | 14.1        |
| [14.6](./14-6-route-structure-navigation.md)         | Route Structure & Navigation                   | 2      | backlog | 14.5        |
| [14.7](./14-7-draft-save-resume.md)                  | Draft Save & Resume Functionality              | 3      | backlog | 14.4, 14.11 |
| [14.8](./14-8-folder-templates-list.md)              | Folder Templates List (Project Type Scoped)    | 2      | backlog | 14.6        |
| [14.9](./14-9-folder-template-builder-context.md)    | Folder Template Builder (Project Type Context) | 2      | backlog | 14.8        |
| [14.10](./14-10-deprecate-folder-templates-route.md) | Deprecate Standalone Folder Templates Route    | 2      | backlog | 14.1-14.9   |
| [14.11](./14-11-schema-backend-updates.md)           | Schema & Backend Updates                       | 2      | backlog | -           |

---

## Implementation Order

### Phase 1: Foundation (Stories 14.11, 14.1)

Schema changes and wizard infrastructure. Can be parallelized.

### Phase 2: Wizard Steps (Stories 14.2, 14.3, 14.4, 14.5)

Build the stepper and all three steps. 14.5 can run parallel to 14.2/14.3.

### Phase 3: Routes & Navigation (Story 14.6)

Hook up the new routes.

### Phase 4: Draft & Extended Features (Stories 14.7, 14.8, 14.9)

Add draft support and project-type-scoped templates.

### Phase 5: Cleanup (Story 14.10)

**ONLY after all above tested** — deprecate old routes.

---

## Key Patterns

### Wizard Pattern

Follow the Request Engagement stepper:

- `src/components/modules/studio/quotations/request-flow/`

### Folder Tree Component

Reuse existing:

- `src/components/modules/admin/folder-templates/builder/folder-tree.tsx`
- `src/components/modules/admin/folder-templates/builder/folder-node.tsx`

### Review Step Pattern

Follow Service Package Builder:

- `src/components/modules/admin/service-packages/builder/step-4-review.tsx`

---

_Last Updated: 2026-01-31_
