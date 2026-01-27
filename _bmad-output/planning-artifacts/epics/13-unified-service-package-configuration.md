# Epic 13: Unified Service Package Configuration

**Epic Owner**: Architect/PM  
**Status**: Planning  
**Created**: 2026-01-27  
**Complexity**: Very High (System-wide restructuring)  
**Context**: Party Mode Brainstorming Session 2026-01-27

---

## 📋 Executive Summary

This **umbrella epic** consolidates the fragmented configuration system (7 separate tables) into a unified **Service Package** model. The key simplification:

> **1 Service Package (Quotation Template) → 1 Project**

No more line-item-based project spawning. Either:

- Video + Album + Photos = ONE Wedding Project (with appropriate folder structure)
- OR they are separate service packages if truly independent work

### **Key Drivers**

1. **Configuration Complexity**: Currently 7 tables that must stay synchronized
2. **UX Friction**: Admin must visit 6 different pages to configure one sellable product
3. **Mental Model Mismatch**: Studios think in "packages", not "project types" + "folder templates" + "quotation templates"
4. **Simplified Spawning**: Remove line-item-based multi-project spawning

---

## 🗂️ Sub-Epic Breakdown

This master plan is decomposed into **four focused sub-epics**:

| Epic ID | Title                       | Focus Area                                            | Estimated Points |
| :------ | :-------------------------- | :---------------------------------------------------- | :--------------- |
| **13A** | Schema Consolidation        | Remove/simplify tables, create ServicePackage entity  | 13               |
| **13B** | Folder Template Enhancement | Hierarchical folders, project-type specific, variants | 13               |
| **13C** | Service Package Builder UI  | Unified admin configuration wizard                    | 21               |
| **13D** | Legacy Cleanup & Migration  | Remove old UI, migrate data, update spawning logic    | 13               |

**Total Estimated Story Points: 60**

---

## 📐 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Epic 13A                                          │
│               Schema Consolidation (MUST GO FIRST)                          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
               ┌──────────────────────┴──────────────────────┐
               │                                             │
               ▼                                             ▼
    ┌───────────────────┐                         ┌───────────────────┐
    │     Epic 13B      │                         │     Epic 13C      │
    │  Folder Template  │                         │  Service Package  │
    │   Enhancement     │                         │   Builder UI      │
    └─────────┬─────────┘                         └─────────┬─────────┘
              │                                             │
              └──────────────────────┬──────────────────────┘
                                     │
                                     ▼
                          ┌───────────────────┐
                          │     Epic 13D      │
                          │  Legacy Cleanup   │
                          │   & Migration     │
                          └───────────────────┘
```

---

## 📁 Epic 13A: Schema Consolidation

**Goal**: Simplify the data model by introducing `servicePackages` as the primary configuration entity.

### Stories

| ID    | Story                                        | AC Summary                                               | Points |
| :---- | :------------------------------------------- | :------------------------------------------------------- | :----- |
| 13A.1 | Create `servicePackages` table               | New unified table with projectType, folderTemplate links | 3      |
| 13A.2 | Add fields to `quotationTemplates`           | Add `projectTypeId`, `folderTemplateId`, `storageTierId` | 2      |
| 13A.3 | Remove `spawnsProject` from line items       | Line items become purely pricing, no spawning logic      | 2      |
| 13A.4 | Deprecate `projectTypeFields` table          | Mark as deprecated, plan migration path                  | 2      |
| 13A.5 | Update `projects` spawning to single project | Modify spawning to create ONE project per quotation      | 3      |
| 13A.6 | Create data migration script                 | Migrate existing quotation templates to new structure    | 1      |

**Definition of Done**:

- [ ] `servicePackages` table exists OR `quotationTemplates` enhanced
- [ ] Line items no longer contain spawning configuration
- [ ] Single project spawns per quotation approval
- [ ] Migration script tested in development

---

## 📁 Epic 13B: Folder Template Enhancement

**Goal**: Make folder templates hierarchical, project-type specific, and variant-aware for different cultural/event types.

### Stories

| ID    | Story                                        | AC Summary                                               | Points |
| :---- | :------------------------------------------- | :------------------------------------------------------- | :----- |
| 13B.1 | Enhance `folderTemplates` schema             | Change `folders` from flat array to hierarchical objects | 3      |
| 13B.2 | Add folder metadata fields                   | Add `description`, `isRequired` per folder               | 2      |
| 13B.3 | Create Wedding folder template seeds         | South Indian, Christian, North Indian variants           | 3      |
| 13B.4 | Create YouTube/Content folder template seeds | A-Roll, B-Roll, Graphics, Audio structure                | 2      |
| 13B.5 | Folder Template Builder UI                   | Visual drag-drop folder structure builder                | 3      |

**Folder Template Schema Update**:

```typescript
folderTemplates: defineTable({
  name: v.string(),
  projectTypeId: v.id("projectTypes"),
  variant: v.optional(v.string()),
  description: v.optional(v.string()),
  folders: v.array(
    v.object({
      name: v.string(),
      path: v.string(),
      description: v.optional(v.string()),
      isRequired: v.optional(v.boolean()),
      children: v.optional(v.array(v.object({...})))
    })
  ),
  isDefault: v.optional(v.boolean()),
  isActive: v.boolean(),
})
```

---

## 📁 Epic 13C: Service Package Builder UI

**Goal**: Create a unified admin wizard for configuring sellable service packages.

### Stories

| ID    | Story                                         | AC Summary                                            | Points |
| :---- | :-------------------------------------------- | :---------------------------------------------------- | :----- |
| 13C.1 | Service Package List Page                     | List all packages with filters, status, quick actions | 3      |
| 13C.2 | Package Builder Step 1: Basic Info            | Name, description, category selection                 | 3      |
| 13C.3 | Package Builder Step 2: Project Configuration | Project type, folder template, storage tier selection | 5      |
| 13C.4 | Package Builder Step 3: Pricing               | Line items (pricing only), sections, terms            | 5      |
| 13C.5 | Package Builder Step 4: Preview & Publish     | Preview package, activate/deactivate                  | 3      |
| 13C.6 | Package Detail View                           | View configured package with edit capability          | 2      |

**UI/UX Principles**:

- One wizard, one mental model
- Clear separation: "What you're selling" vs "How it's priced"
- Visual folder structure preview
- Live pricing preview

---

## 📁 Epic 13D: Legacy Cleanup & Migration

**Goal**: Remove deprecated code, update existing features, migrate data.

### Stories

| ID    | Story                                     | AC Summary                                 | Points |
| :---- | :---------------------------------------- | :----------------------------------------- | :----- |
| 13D.1 | Remove `admin/project-types` UI           | Delete 20 files, remove routes             | 2      |
| 13D.2 | Remove `admin/quotation-templates` old UI | Delete 9 files, redirect to new builder    | 2      |
| 13D.3 | Remove `admin/quotation-sections` UI      | Delete 5 files, sections become optional   | 2      |
| 13D.4 | Update spawning logic                     | `spawnProjectFromQuotation` (singular)     | 3      |
| 13D.5 | Update Studio package selection           | Use new servicePackages/quotationTemplates | 2      |
| 13D.6 | Data migration: Production                | Run migration on production data           | 2      |

**Files to Remove**:

```
src/components/modules/admin/project-types/        (20 files)
src/components/modules/admin/quotation-templates/  (9 files)
src/components/modules/admin/quotation-sections/   (5 files)
src/app/(protected)/@admin/settings/project-types/
src/app/(protected)/@admin/settings/quotation-templates/
src/app/(protected)/@admin/settings/quotation-sections/
convex/functions/projectTypeFields/
convex/functions/quotations/templates/
```

---

## 📊 Current vs New Configuration Model

### BEFORE (7 Configuration Areas)

```
Admin needs to configure:
1. Project Categories     → "Wedding", "YouTube"
2. Project Types          → "Wedding Photography", "Cinema Edit"
3. Project Type Fields    → "Album Count", "Video Duration"
4. Storage Tiers          → "50GB Standard", "100GB Premium"
5. Folder Templates       → "Wedding Folders", "YouTube Folders"
6. Quotation Sections     → "Photography", "Video Editing"
7. Quotation Templates    → "Silver Package" (links to all above)

Total Pages: 7
Mental Model: Database-centric
```

### AFTER (3 Configuration Areas)

```
Admin needs to configure:
1. Service Packages       → "Silver Wedding Package" (all-in-one)
2. Folder Templates       → Enhanced, auto-linked
3. Storage Tiers          → Shared resource (unchanged)

Total Pages: 3
Mental Model: Product-centric
```

---

## ✅ Acceptance Criteria (Epic Level)

- [ ] Admin can create a "Service Package" in ONE wizard flow
- [ ] Service Package links: Project Type + Folder Template + Storage + Pricing
- [ ] 1 Quotation approval → 1 Project created (simplified spawning)
- [ ] Studio can browse and select Service Packages
- [ ] Folder templates support hierarchical structure
- [ ] Old configuration UIs removed from admin navigation
- [ ] All existing data migrated without loss

---

## 📝 Impact on Existing Epics

| Epic                           | Impact                               |
| :----------------------------- | :----------------------------------- |
| **Epic 3: Admin Portal**       | Stories 3-7, 3-8 superseded by 13C   |
| **Epic 4: Quotation System**   | Template management replaced by 13C  |
| **Epic 11B: Quotation Engine** | Line-item spawning simplified by 13A |
| **Epic 11C: Studio Portal**    | Package selection updated by 13D.5   |

---

## 🔗 Related Documents

- [Epic 11: System Architecture Revamp](./11-system-restructuring-revamp.md)
- [Epic 4: Quotation System](./04-quotation-system.md)
- [Architecture: Quotation to Project Flow](../../../docs/architecture/quotation-to-project-flow.md)

---

_Document Version: 1.0_  
_Last Updated: 2026-01-27 18:30 IST_
