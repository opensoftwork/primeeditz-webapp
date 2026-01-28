# Epic 13: Unified Service Package Configuration

**Epic Owner**: Architect/PM  
**Status**: Planning  
**Created**: 2026-01-27  
**Updated**: 2026-01-28  
**Complexity**: Very High (System-wide restructuring)  
**Context**: Party Mode Brainstorming Session 2026-01-27

---

## 📋 Executive Summary

This **umbrella epic** replaces the fragmented configuration system with a unified **Service Package** model. The key changes:

1. **Rename**: `quotationTemplates` → `servicePackages` (breaking change, dev mode)
2. **Multi-Select**: Studios can select MULTIPLE packages per quotation
3. **Simple Spawning**: Each package spawns exactly ONE project (N packages = N projects)
4. **Line Items = Pricing Only**: No spawning configuration on line items

### **Multi-Project Solution**

> **Problem**: Studio wants Photo, Video, and Album as SEPARATE projects with SEPARATE timelines.

**Solution**: Studio selects multiple Service Packages in one quotation request:

```
┌─────────────────────────────────────────────────────────────────┐
│  QUOTATION REQUEST                                              │
│                                                                 │
│  ☑ Wedding Photography Package  → Spawns: Photo Project        │
│  ☑ Wedding Cinema Package       → Spawns: Video Project        │
│  ☑ Premium Album Package        → Spawns: Album Project        │
│                                                                 │
│  Combined Quote: ₹85,000                                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓ Approval ↓
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Photo Project   │  │ Video Project   │  │ Album Project   │
│ Deadline: May 1 │  │ Deadline: May 15│  │ Deadline: Jun 1 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

This is **simpler than line-item spawning** because:

- Package is the unit of configuration (not line items)
- Each package has clear 1:1 project mapping
- Mix-and-match flexibility for studios

---

## 🗂️ Sub-Epic Breakdown

| Epic ID | Title                       | Focus Area                                         | Points |
| :------ | :-------------------------- | :------------------------------------------------- | :----- |
| **13A** | Schema Consolidation        | Rename tables, multi-package model, spawning logic | 13     |
| **13B** | Folder Template Enhancement | Hierarchical folders (depth-limited), variants     | 13     |
| **13C** | Service Package Builder UI  | Unified admin configuration wizard                 | 21     |
| **13D** | Legacy Cleanup & Migration  | Remove old UI, clear data, update spawning         | 13     |

**Total Estimated Story Points: 60**

---

## 📐 Architecture Overview

### Data Model (Post-Epic 13)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVICE PACKAGES                                 │
│                        (formerly quotationTemplates)                          │
├──────────────────────────────────────────────────────────────────────────────┤
│  _id: Id<"servicePackages">                                                  │
│  name: string                          // "Wedding Photography Package"       │
│  description: string                                                          │
│  categoryId: Id<"projectCategories">   // Wedding, YouTube, etc.             │
│                                                                               │
│  // PROJECT CONFIGURATION (1 package = 1 project type)                       │
│  projectTypeId: Id<"projectTypes">     // What type of project spawns        │
│  folderTemplateId: Id<"folderTemplates">  // Which folder structure          │
│  defaultStorageTierId: Id<"storageTiers"> // Storage allocation              │
│                                                                               │
│  // PRICING (line items are JUST for pricing display)                        │
│  lineItems: LineItem[]                 // No spawning config here!           │
│  terms: string                                                                │
│                                                                               │
│  isActive: boolean                                                            │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                                QUOTATIONS                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  _id: Id<"quotations">                                                       │
│  studioId: Id<"profiles">                                                    │
│  endClientName: string                                                        │
│                                                                               │
│  // MULTIPLE PACKAGES per quotation                                          │
│  selectedPackageIds: Id<"servicePackages">[]  // Array!                      │
│                                                                               │
│  // Aggregated from all selected packages                                    │
│  lineItems: LineItem[]                                                        │
│  totalAmount: number                                                          │
│                                                                               │
│  status: "draft" | "pending_review" | "sent" | "approved" | "rejected"       │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                            SPAWNING LOGIC                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  On quotation.status = "approved":                                           │
│                                                                               │
│  for each packageId in quotation.selectedPackageIds:                         │
│    package = db.get(packageId)                                               │
│    if (package.projectTypeId):                                               │
│      createProject({                                                         │
│        quotationId: quotation._id,                                           │
│        projectTypeId: package.projectTypeId,                                 │
│        folderTemplateId: package.folderTemplateId,                           │
│        storageTierId: package.defaultStorageTierId,                          │
│        studioId: quotation.studioId,                                         │
│        endClientName: quotation.endClientName,                               │
│      })                                                                       │
│      setupFolders(newProject._id, package.folderTemplateId)                  │
│                                                                               │
│  // N packages = N projects created                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📐 Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Epic 13A                                          │
│               Schema Consolidation (MUST GO FIRST)                          │
│     - Rename quotationTemplates → servicePackages                           │
│     - Multi-package selection model                                         │
│     - Updated spawning logic                                                │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
               ┌──────────────────┴──────────────────┐
               │                                     │
               ▼                                     ▼
    ┌───────────────────┐                 ┌───────────────────┐
    │     Epic 13B      │                 │     Epic 13C      │
    │  Folder Template  │                 │  Service Package  │
    │   Enhancement     │                 │   Builder UI      │
    │  (can parallel)   │                 │  (can parallel)   │
    └─────────┬─────────┘                 └─────────┬─────────┘
              │                                     │
              └──────────────────┬──────────────────┘
                                 │
                                 ▼
                      ┌───────────────────┐
                      │     Epic 13D      │
                      │  Legacy Cleanup   │
                      │   (LAST)          │
                      └───────────────────┘
```

---

## ⚠️ Breaking Changes Notice

**This is a BREAKING CHANGE epic.** Since we're in development:

1. **Data will be cleared** before migration
2. **No backward compatibility** required
3. **Table rename**: `quotationTemplates` → `servicePackages`
4. **Old quotations**: Will be deleted (dev data only)

---

## 📊 Before vs After Comparison

### BEFORE (Current Architecture)

```
Admin configures:
1. Project Categories
2. Project Types + Dynamic Fields
3. Storage Tiers
4. Folder Templates
5. Quotation Sections
6. Quotation Templates (with line-item spawning config)

Quotation flow:
- Studio selects 1 template
- Each line item can spawn a project (complex!)
- Multiple configs per line item

Problems:
- 7 configuration pages
- Line items doing double-duty (pricing + spawning)
- Confusing mental model
```

### AFTER (Epic 13 Architecture)

```
Admin configures:
1. Project Categories (keep)
2. Project Types (simplified, no dynamic fields)
3. Storage Tiers (keep)
4. Folder Templates (enhanced with depth-limited hierarchy)
5. Service Packages (unified, replaces quotation templates)

Quotation flow:
- Studio selects MULTIPLE packages
- Each package spawns exactly 1 project
- Line items = pricing only

Benefits:
- 4 configuration areas (down from 7)
- Clear separation: package = project spawner, line item = price
- Natural multi-project support
```

---

## ✅ Acceptance Criteria (Epic Level)

- [ ] `quotationTemplates` table renamed to `servicePackages`
- [ ] Admin can create Service Packages with embedded project config
- [ ] Studio can select MULTIPLE packages per quotation
- [ ] N selected packages → N projects on approval
- [ ] Folder templates support 3-level hierarchy (no recursion)
- [ ] Line items contain ONLY pricing information
- [ ] Old configuration UIs removed from admin navigation
- [ ] Development data cleared before migration

---

## 📝 Technical Standards (Per Architecture Docs)

All stories in this epic MUST follow:

### Convex Patterns (`04-implementation-patterns.md`)

| Pattern        | Requirement                                                                   |
| -------------- | ----------------------------------------------------------------------------- |
| Auth Wrappers  | Use `adminMutation`, `studioQuery`, etc. from `convex/lib/customFunctions.ts` |
| File Structure | Domain-based: `convex/functions/{domain}/queries.ts`, `mutations.ts`          |
| Indexes        | Format: `by_{columnName}`                                                     |
| Error Handling | Throw errors, never return error objects                                      |

### React Patterns (`09-clean-code-standards.md`)

| Pattern        | Requirement                                                 |
| -------------- | ----------------------------------------------------------- |
| Route Files    | Max 100 lines, config only, thin wrapper                    |
| Modules        | Container components in `src/components/modules/{feature}/` |
| Loading States | `{feature}-loading.tsx` and `{feature}-error.tsx` required  |
| Exports        | Always from `index.ts` files                                |

### Form Patterns (`tanstack-form.md`)

| Pattern       | Requirement                                           |
| ------------- | ----------------------------------------------------- |
| Forms         | TanStack Form + Zod validation                        |
| Validation    | `onSubmit` with `validators: { onSubmit: zodSchema }` |
| Error Display | `<FieldError errors={field.state.meta.errors} />`     |
| Invalid State | `aria-invalid={isInvalid}` on inputs                  |

---

## 🔗 Related Documents

- [Epic 11: System Architecture Revamp](./11-system-restructuring-revamp.md)
- [Architecture: Implementation Patterns](../architecture/04-implementation-patterns.md)
- [Architecture: Clean Code Standards](../architecture/09-clean-code-standards.md)
- [Docs: TanStack Form](../../docs/ui/tanstack-form.md)
- [Docs: Convex Error Handling](../../docs/convex/error-handling.md)

---

_Document Version: 2.0_  
_Last Updated: 2026-01-28 12:30 IST_
