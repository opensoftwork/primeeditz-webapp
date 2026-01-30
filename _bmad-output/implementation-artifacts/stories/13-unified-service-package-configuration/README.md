# Epic 13: Unified Service Package Configuration - Story Index

This directory contains all stories for Epic 13: Unified Service Package Configuration.

---

## 📊 Epic Overview

| Epic                                                                   | Stories        | Total Points  | Status  |
| ---------------------------------------------------------------------- | -------------- | ------------- | ------- |
| [13A: Schema Consolidation](./13a-schema-consolidation/)               | 6              | 13            | done    |
| [13B: Folder Template Enhancement](./13b-folder-template-enhancement/) | 5              | 13            | done    |
| [13C: Service Package Builder UI](./13c-service-package-builder-ui/)   | 6              | 21            | done    |
| [13D: Legacy Cleanup & Migration](./13d-legacy-cleanup-migration/)     | 6              | 13            | done    |
| [13E: Service Package Bundles](./13e-service-package-bundles/)         | 6              | 15            | planned |
| **Total**                                                              | **29 stories** | **75 points** |         |

---

## 📁 Epic 13A: Schema Consolidation

| Story ID                                                                     | Story Title                         | Points | Status  |
| ---------------------------------------------------------------------------- | ----------------------------------- | ------ | ------- |
| [13A.1](./13a-schema-consolidation/13a-1-create-service-packages-table.md)   | Create `servicePackages` Table      | 3      | backlog |
| [13A.2](./13a-schema-consolidation/13a-2-update-quotations-multi-package.md) | Update Quotations for Multi-Package | 2      | backlog |
| [13A.3](./13a-schema-consolidation/13a-3-update-spawning-logic.md)           | Update Project Spawning Logic       | 3      | backlog |
| [13A.4](./13a-schema-consolidation/13a-4-create-service-package-seeds.md)    | Create Service Package Seeds        | 2      | backlog |
| [13A.5](./13a-schema-consolidation/13a-5-update-quotation-mutations.md)      | Update Quotation Mutations          | 2      | backlog |
| [13A.6](./13a-schema-consolidation/13a-6-deprecate-project-type-fields.md)   | Deprecate `projectTypeFields`       | 1      | backlog |

---

## 📁 Epic 13B: Folder Template Enhancement

| Story ID                                                                                | Story Title                      | Points | Status  |
| --------------------------------------------------------------------------------------- | -------------------------------- | ------ | ------- |
| [13B.1](./13b-folder-template-enhancement/13b-1-enhance-folder-templates-schema.md)     | Enhance `folderTemplates` Schema | 3      | backlog |
| [13B.2](./13b-folder-template-enhancement/13b-2-create-wedding-folder-seeds.md)         | Create Wedding Folder Seeds      | 3      | backlog |
| [13B.3](./13b-folder-template-enhancement/13b-3-create-content-creator-folder-seeds.md) | Create Content Creator Seeds     | 2      | backlog |
| [13B.4](./13b-folder-template-enhancement/13b-4-update-folder-setup-mutation.md)        | Update Folder Setup Mutation     | 2      | backlog |
| [13B.5](./13b-folder-template-enhancement/13b-5-folder-template-builder-ui.md)          | Folder Template Builder UI       | 3      | backlog |

---

## 📁 Epic 13C: Service Package Builder UI

| Story ID                                                                         | Story Title                      | Points | Status  |
| -------------------------------------------------------------------------------- | -------------------------------- | ------ | ------- |
| [13C.1](./13c-service-package-builder-ui/13c-1-service-package-list-page.md)     | Service Package List Page        | 3      | backlog |
| [13C.2](./13c-service-package-builder-ui/13c-2-builder-step-1-identity.md)       | Builder Step 1: Identity         | 3      | backlog |
| [13C.3](./13c-service-package-builder-ui/13c-3-builder-step-2-project-config.md) | Builder Step 2: Project Config   | 5      | backlog |
| [13C.4](./13c-service-package-builder-ui/13c-4-builder-step-3-pricing.md)        | Builder Step 3: Pricing          | 5      | backlog |
| [13C.5](./13c-service-package-builder-ui/13c-5-builder-step-4-review-publish.md) | Builder Step 4: Review & Publish | 3      | backlog |
| [13C.6](./13c-service-package-builder-ui/13c-6-package-detail-view.md)           | Package Detail View              | 2      | backlog |

---

## 📁 Epic 13D: Legacy Cleanup & Migration

| Story ID                                                                           | Story Title                       | Points | Status |
| ---------------------------------------------------------------------------------- | --------------------------------- | ------ | ------ |
| [13D.1](./13d-legacy-cleanup-migration/13d-1-remove-old-quotation-templates-ui.md) | Remove Old Quotation Templates UI | 2      | done   |
| [13D.2](./13d-legacy-cleanup-migration/13d-2-simplify-project-types-ui.md)         | Simplify Project Types UI         | 2      | done   |
| [13D.3](./13d-legacy-cleanup-migration/13d-3-remove-quotation-sections-ui.md)      | Remove Quotation Sections UI      | 2      | done   |
| [13D.4](./13d-legacy-cleanup-migration/13d-4-update-studio-quotation-request.md)   | Update Studio Quotation Request   | 3      | done   |
| [13D.5](./13d-legacy-cleanup-migration/13d-5-update-quotation-request-mutation.md) | Update Quotation Request Mutation | 2      | done   |
| [13D.6](./13d-legacy-cleanup-migration/13d-6-clear-development-data.md)            | Clear Development Data            | 2      | done   |

---

## 📁 Epic 13E: Service Package Bundles (Enhancement)

| Story ID                                                                      | Story Title                           | Points | Status  |
| ----------------------------------------------------------------------------- | ------------------------------------- | ------ | ------- |
| [13E.1](./13e-service-package-bundles/13e-1-create-service-bundles-table.md)  | Create `serviceBundles` Table         | 2      | planned |
| [13E.2](./13e-service-package-bundles/13e-2-bundle-builder-ui.md)             | Bundle Builder UI                     | 3      | planned |
| [13E.3](./13e-service-package-bundles/13e-3-bundle-seed-data.md)              | Bundle Seed Data                      | 2      | planned |
| [13E.4](./13e-service-package-bundles/13e-4-quotation-bundle-quick-select.md) | Quotation Bundle Quick-Select UI      | 3      | planned |
| [13E.5](./13e-service-package-bundles/13e-5-apply-bundle-discount.md)         | Apply Bundle Discount in Calculations | 2      | planned |
| [13E.6](./13e-service-package-bundles/13e-6-bundle-analytics.md)              | Bundle Analytics                      | 3      | planned |

---

## 🔗 Dependency Graph

```
Epic 13A (Schema Foundation)
    ↓
    ├── Epic 13B (Folder Templates) - Can start in parallel after 13A.1
    │
    ├── Epic 13C (Package Builder UI) - Requires 13A.1, 13A.2
    │
    └── Epic 13E (Bundles) - Only requires 13A.1
         ↓
Epic 13D (Cleanup) - Requires 13A, 13B, 13C complete (13E optional)
```

---

## ⚡ Key Technical Decisions

1. **Multi-Package Selection**: Studios can select multiple service packages per quotation, each spawning its own project.

2. **No Backward Compatibility**: Old `quotationTemplates` are being replaced entirely. Development data will be cleared.

3. **Depth-Limited Folders**: Folder templates use 3 explicit level validators (no recursion due to Convex limitations).

4. **TanStack Form + Zod**: All forms must use TanStack Form with Zod validation.

5. **Thin Route Files**: Route files should be <50 lines, delegating to feature components.

---

## 📋 Implementation Order

1. **Start with 13A.1** - Create the `servicePackages` table
2. **Then 13A.2 → 13A.6** - Complete schema changes
3. **Parallel: 13B and 13C** can start after 13A.1-2 are done
4. **Finally: 13D** - Cleanup after all features are working
5. **Optional: 13E** - Bundles can be added after 13A.1 (enhancement)

---

## 🔍 Related Documents

- [Epic 13 Overview](../../../../planning-artifacts/epics/13-unified-service-package-configuration.md)
- [Epic 13A Plan](../../../../planning-artifacts/epics/13a-schema-consolidation.md)
- [Epic 13B Plan](../../../../planning-artifacts/epics/13b-folder-template-enhancement.md)
- [Epic 13C Plan](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)
- [Epic 13D Plan](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)
- [Epic 13E Plan](../../../../planning-artifacts/epics/13e-service-package-bundles.md)
- [Sprint Status](../../sprint-status.yaml)
