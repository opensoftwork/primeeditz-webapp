# Epic 13D: Legacy Cleanup & Migration

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Complexity**: Medium  
**Estimated Points**: 13

---

## 📋 Epic Summary

This epic removes the deprecated configuration UIs and updates the system to use the new unified model. This is the final cleanup phase that should only run after 13A, 13B, and 13C are complete.

**Principle**: Remove code only after replacement is proven working.

---

## 🎯 User Outcomes

| Role       | Outcome                                                |
| :--------- | :----------------------------------------------------- |
| **Admin**  | Clean navigation with no duplicate configuration pages |
| **Dev**    | Reduced codebase, fewer components to maintain         |
| **System** | Simplified routing, faster builds                      |

---

## 📝 User Stories

### Story 13D.1: Remove Project Types Configuration UI

**Points**: 2

**As a** Developer,  
**I want** to remove the old project types management UI,  
**So that** we don't maintain deprecated code.

**Acceptance Criteria**:

- [ ] Delete directory: `src/components/modules/admin/project-types/` (20 files)
- [ ] Delete routes:
  - `src/app/(protected)/@admin/settings/project-types/page.tsx`
  - `src/app/(protected)/@admin/settings/project-types/[id]/page.tsx`
  - `src/app/(protected)/@admin/settings/project-types/[id]/preview/page.tsx`
- [ ] Update sidebar navigation to remove "Project Types" link
- [ ] Keep `projectTypes` table (used by service packages)
- [ ] Keep backend queries/mutations (used by service package builder)

**Files to Delete**:

```
src/components/modules/admin/project-types/
├── detail/                           (8 files)
├── fields/                           (2 files)
├── list/                             (8 files)
├── index.ts
└── project-type-preview.tsx
```

---

### Story 13D.2: Remove Quotation Templates Old UI

**Points**: 2

**As a** Developer,  
**I want** to remove the old quotation templates UI,  
**So that** admins use the new Service Package Builder.

**Acceptance Criteria**:

- [ ] Delete directory: `src/components/modules/admin/quotation-templates/` (9 files)
- [ ] Delete routes:
  - `src/app/(protected)/@admin/settings/quotation-templates/page.tsx`
  - `src/app/(protected)/@admin/settings/quotation-templates/new/page.tsx`
  - `src/app/(protected)/@admin/settings/quotation-templates/[id]/page.tsx`
  - `src/app/(protected)/@admin/settings/quotation-templates/[id]/edit/page.tsx`
- [ ] Update sidebar navigation to remove "Quotation Templates" link
- [ ] Add redirect from old URLs to new `/service-packages` route

**Files to Delete**:

```
src/components/modules/admin/quotation-templates/
├── components/                       (3 files)
├── index.ts
├── price-preview.tsx
├── template-card.tsx
├── template-detail.tsx
├── template-editor.tsx
└── template-list.tsx
```

---

### Story 13D.3: Remove Quotation Sections UI

**Points**: 2

**As a** Developer,  
**I want** to simplify or remove the quotation sections UI,  
**So that** admins have fewer configuration pages.

**Acceptance Criteria**:

- [ ] Delete directory: `src/components/modules/admin/quotation-sections/` (5 files)
- [ ] Delete route: `src/app/(protected)/@admin/settings/quotation-sections/page.tsx`
- [ ] Update sidebar navigation to remove "Quotation Sections" link
- [ ] Keep `quotationSections` table (still used in line items)
- [ ] Sections can be managed inline in Service Package Builder (COULD)

**Alternative**: Keep a simplified section management inline in the builder.

---

### Story 13D.4: Update Spawning Logic

**Points**: 3

**As a** Developer,  
**I want** to finalize the spawning logic update,  
**So that** it uses template-level configuration.

**Acceptance Criteria**:

- [ ] Update `spawnProjectFromQuotation` (was `spawnProjectsFromQuotation`)
- [ ] Remove line-item iteration logic
- [ ] Get `projectTypeId` and `folderTemplateId` from template
- [ ] Handle case where template has no `projectTypeId` (skip spawn)
- [ ] Update all callers:
  - `approveQuotation` mutation
  - Any admin approval flows
- [ ] Remove `spawnsProject` related code from line item handling

**Files to Modify**:

```
convex/functions/projects/spawning.ts
convex/functions/quotations/mutations.ts
```

---

### Story 13D.5: Update Studio Package Selection

**Points**: 2

**As a** Developer,  
**I want** the Studio's package selection to use the new model,  
**So that** the request flow works correctly.

**Acceptance Criteria**:

- [ ] `step-1-packages.tsx` uses enhanced `quotationTemplates`
- [ ] Display shows: Package name, description, folder structure preview
- [ ] Price calculation uses new line items structure
- [ ] Category filtering still works
- [ ] Request wizard passes template-level fields

**Files to Modify**:

```
src/components/modules/studio/quotations/request-flow/steps/step-1-packages.tsx
src/components/modules/studio/quotations/request-flow/request-wizard-context.tsx
```

---

### Story 13D.6: Production Data Migration

**Points**: 2

**As a** Developer,  
**I want** to migrate production data to the new schema,  
**So that** existing templates work with the new system.

**Acceptance Criteria**:

- [ ] Run migration script from 13A.3 on production
- [ ] Verify all templates have `projectTypeId` and `folderTemplateId`
- [ ] Verify spawning works for existing quotations
- [ ] Document any manual fixes needed
- [ ] Create rollback plan if issues arise

**Pre-Migration Checklist**:

- [ ] Backup production database
- [ ] Test migration on staging first
- [ ] Notify team of migration window
- [ ] Monitor for errors after migration

---

## 📊 Files Summary

### Files to DELETE (34 files)

```
src/components/modules/admin/project-types/        (20 files)
src/components/modules/admin/quotation-templates/  (9 files)
src/components/modules/admin/quotation-sections/   (5 files)

src/app/(protected)/@admin/settings/project-types/
src/app/(protected)/@admin/settings/quotation-templates/
src/app/(protected)/@admin/settings/quotation-sections/
```

### Files to MODIFY

```
convex/functions/projects/spawning.ts
convex/functions/quotations/mutations.ts
src/components/modules/studio/quotations/request-flow/
src/lib/sidebar-config.ts (or wherever nav is defined)
```

### Files to KEEP

```
convex/functions/projectTypes/             (used by service packages)
convex/functions/folderTemplates/          (enhanced, still used)
convex/functions/storageTiers/             (unchanged)
convex/functions/quotations/               (core logic stays)
```

---

## ✅ Definition of Done

- [ ] All deprecated UI directories deleted
- [ ] All deprecated routes removed
- [ ] Sidebar navigation updated
- [ ] Spawning uses template-level configuration
- [ ] Studio request flow works with new model
- [ ] Production data migrated successfully
- [ ] No broken links or 404s
- [ ] Build succeeds with no unused imports

---

## 🔗 Dependencies

| Depends On   | Notes                              |
| :----------- | :--------------------------------- |
| **Epic 13A** | Schema must be finalized           |
| **Epic 13B** | Folder templates must be working   |
| **Epic 13C** | New UI must be complete and tested |

| Blocks | Notes                     |
| :----- | :------------------------ |
| None   | This is the final cleanup |

---

## ⚠️ Risk Mitigation

1. **Don't delete until replacement is proven**
   - Run 13C.1-13C.6 stories completely first
   - Test new flow end-to-end before deleting old code

2. **Staged deletion**
   - Delete one module at a time
   - Verify build after each deletion
   - Keep git history for recovery

3. **Production migration**
   - Always backup before migration
   - Run on staging first
   - Have rollback script ready

---

_Document Version: 1.0_  
_Last Updated: 2026-01-27_
