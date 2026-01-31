# Epic 14: Project Type + Folder Template Integration

**Parent Epic**: None (Standalone)  
**Status**: Backlog  
**Created**: 2026-01-31  
**Updated**: 2026-01-31  
**Complexity**: High  
**Estimated Points**: 21

---

## 📋 Epic Summary

This epic **fundamentally restructures** the relationship between **Project Types** and **Folder Templates** from a loose association to a **tightly coupled, parent-child hierarchy**.

**Core Change**: Project Types become the "parent container" for Folder Templates, with a stepper-based creation/edit flow that defines a complete "project blueprint" (type definition + default folder structure).

### Key Outcomes:

1. **Unified Creation Flow**: Multi-step wizard for defining project type + folder hierarchy
2. **Parent-Child Relationship**: Folder templates always scoped under a project type
3. **Route Consolidation**: Remove standalone folder templates route
4. **Draft Support**: Save progress and resume later
5. **Consistent UX**: Stepper pattern matches existing Request Engagement flow

---

## 🎯 Business Value

| Benefit                 | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| **Reduced Confusion**   | Admins no longer manage folder templates separately from project types |
| **Enforced Structure**  | Every project type MUST have at least one folder template              |
| **Streamlined Setup**   | Single wizard creates both entities in one flow                        |
| **Better Organization** | Folder templates are logically grouped by project type                 |

---

## 🏗️ Architecture Changes

### Current State (Before)

```
/settings/project-types          → List project types (standalone)
/settings/folder-templates       → List folder templates (standalone)
/settings/folder-templates/new   → Create folder template (selects project type)
/settings/folder-templates/{id}  → Edit folder template
```

**Data Relationship**: Folder template has `projectTypeId` field, but no enforced coupling.

### Target State (After)

```
/settings/project-types                          → List project types
/settings/project-types/new                      → Stepper wizard (3 steps)
/settings/project-types/{id}                     → Stepper wizard (edit mode)
/settings/project-types/{id}/folder-templates    → List templates for this type
/settings/project-types/{id}/folder-templates/new  → Add another template
/settings/project-types/{id}/folder-templates/{templateId} → Edit specific template
```

**Data Relationship**: Project type creation REQUIRES at least one folder template. Folder templates are ONLY accessible through their parent project type.

---

## 📝 User Stories

### Story 14.1: Project Type Wizard Context & Infrastructure

**Points**: 3  
**Priority**: Critical (Foundation)

**As a** Developer,  
**I want** to create the wizard infrastructure for project type creation,  
**So that** I have a reusable context and stepper pattern.

**Acceptance Criteria**:

- [ ] Create `ProjectTypeWizardProvider` context with:
  - `step`: Current step (1, 2, 3)
  - `projectTypeData`: Form values for step 1
  - `folders`: Folder hierarchy from step 2
  - `isDraft`: Boolean for draft status
  - `draftId`: ID of saved draft (if resuming)
  - Navigation: `goToStep`, `handleNext`, `handleBack`
  - Actions: `saveDraft`, `handleSubmit`
- [ ] Context persists across step navigation
- [ ] Context can be initialized from existing project type (edit mode)
- [ ] Context can be initialized from draft (resume mode)

**Technical Pattern**: Follow `RequestWizardProvider` from `/request-flow`

**Files to Create**:

```
src/components/modules/admin/project-types/wizard/
  ├── index.tsx                 (Main wizard layout)
  ├── wizard-context.tsx        (Provider + hook)
  ├── wizard-step-navigation.tsx (Sidebar navigation)
  ├── types.ts                  (Step types, form types)
  └── steps/
      ├── step-1-identity.tsx
      ├── step-2-folders.tsx
      └── step-3-review.tsx
```

---

### Story 14.2: Step 1 — Project Type Identity Form

**Points**: 2  
**Priority**: High

**As an** Admin,  
**I want** to define the basic project type information in step 1,  
**So that** I can initialize the type before defining its folder structure.

**Acceptance Criteria**:

- [ ] Form fields (migrated from `ProjectTypeDrawer`):
  - Category (dropdown with "Add New" option)
  - Name (required, min 2 chars)
  - Description (optional, max 500 chars)
  - Icon identifier (optional)
  - Is Active (toggle, default true)
- [ ] Form validation using TanStack Form + Zod
- [ ] "Next" button disabled until form is valid
- [ ] Values persist in wizard context
- [ ] Edit mode: Pre-populate from existing project type

**UI Pattern**: Match Request Engagement step styling:

- Full-height content area
- Step title with indicator line
- Clean, spacious form layout

**Files to Modify/Create**:

```
CREATE: src/components/modules/admin/project-types/wizard/steps/step-1-identity.tsx
REFERENCE: src/components/modules/admin/project-types/list/project-type-drawer.tsx (migrate form logic)
```

---

### Story 14.3: Step 2 — Folder Hierarchy Builder

**Points**: 3  
**Priority**: High

**As an** Admin,  
**I want** to define the default folder structure in step 2,  
**So that** projects of this type have a consistent directory layout.

**Acceptance Criteria**:

- [ ] Integrate existing `FolderTree` component
- [ ] REMOVE project type selector (already known from context)
- [ ] Auto-focus on folder creation when step loads
- [ ] Validation: **At least one root folder required** before proceeding
- [ ] Display folder count summary
- [ ] All folder operations work:
  - Add root folder
  - Add child folder (up to 3 levels)
  - Edit folder properties
  - Delete folder (with confirmation)
  - Bulk delete
- [ ] Folders persist in wizard context
- [ ] Edit mode: Pre-populate from existing template

**UI Pattern**:

- Reuse existing `FolderTree` component styling
- Add validation message if no folders exist
- "Next" button disabled until ≥1 folder exists

**Files to Create/Modify**:

```
CREATE: src/components/modules/admin/project-types/wizard/steps/step-2-folders.tsx
REUSE: src/components/modules/admin/folder-templates/builder/folder-tree.tsx
REUSE: src/components/modules/admin/folder-templates/builder/folder-node.tsx
```

---

### Story 14.4: Step 3 — Review & Submit

**Points**: 3  
**Priority**: High

**As an** Admin,  
**I want** to review my project type and folder structure before submitting,  
**So that** I can verify everything is correct.

**Acceptance Criteria**:

- [ ] Display summary of project type details:
  - Name, Category, Description, Icon, Status
- [ ] Display folder hierarchy preview (read-only tree view)
- [ ] Show folder count (e.g., "12 folders across 3 levels")
- [ ] "Edit" buttons to jump back to step 1 or 2
- [ ] "Save as Draft" button (stores progress, returns to list)
- [ ] "Create Project Type" / "Update Project Type" button (final submit)
- [ ] Loading state during submission
- [ ] Success: Navigate to project types list with toast
- [ ] Error: Display error message, stay on step

**UI Pattern**: Follow Service Package Builder step-4-review styling

**Files to Create**:

```
CREATE: src/components/modules/admin/project-types/wizard/steps/step-3-review.tsx
REFERENCE: src/components/modules/admin/service-packages/builder/step-4-review.tsx
```

---

### Story 14.5: Project Type Wizard — Stepper Layout

**Points**: 3  
**Priority**: High

**As an** Admin,  
**I want** the project type wizard to have a full-screen stepper layout,  
**So that** the experience matches the Request Engagement flow.

**Acceptance Criteria**:

- [ ] Full-screen layout (no scroll on container, scroll within content)
- [ ] Header with:
  - Title: "Create Project Type" / "Edit Project Type"
  - Subtitle: "Project Blueprint Configuration"
  - Step indicator (Step X of 3)
  - Progress dots
  - Cancel / Dashboard buttons
- [ ] Sidebar navigation with:
  - Step list with icons
  - Current step highlighting
  - Completed step checkmarks
  - Step descriptions
  - Click to navigate (if allowed)
- [ ] Footer with:
  - Back button
  - Step counter (Step 0X / 03)
  - Next / Submit button
- [ ] Animated step transitions (motion/react)

**Files to Create**:

```
CREATE: src/components/modules/admin/project-types/wizard/index.tsx
CREATE: src/components/modules/admin/project-types/wizard/wizard-step-navigation.tsx
REFERENCE: src/components/modules/studio/quotations/request-flow/index.tsx
REFERENCE: src/components/modules/studio/quotations/request-flow/request-step-navigation.tsx
```

---

### Story 14.6: Route Structure & Navigation

**Points**: 2  
**Priority**: High

**As a** Developer,  
**I want** to set up the new route structure,  
**So that** the wizard is accessible at the correct URLs.

**Acceptance Criteria**:

- [ ] Create route: `/settings/project-types/new` → Wizard (create mode)
- [ ] Create route: `/settings/project-types/{id}` → Wizard (edit mode)
- [ ] Create route: `/settings/project-types/{id}/folder-templates` → Template list
- [ ] Create route: `/settings/project-types/{id}/folder-templates/new` → New template
- [ ] Create route: `/settings/project-types/{id}/folder-templates/{templateId}` → Edit template
- [ ] Update "DEFINE PROJECT TYPE" button to navigate to wizard
- [ ] Update project type card "Edit" action to navigate to wizard
- [ ] Remove click-through to old drawer (drawer deprecated)

**Files to Create**:

```
src/app/(protected)/@admin/settings/project-types/new/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/new/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/[templateId]/page.tsx
```

**Files to Modify**:

```
src/components/modules/admin/project-types/list/project-type-list.tsx
  - Update handleCreate to router.push('/settings/project-types/new')
  - Update handleEdit to router.push(`/settings/project-types/${id}`)
```

---

### Story 14.7: Draft Save & Resume Functionality

**Points**: 3  
**Priority**: Medium

**As an** Admin,  
**I want** to save my progress as a draft and resume later,  
**So that** I don't lose work if I need to step away.

**Acceptance Criteria**:

- [ ] Add `isDraft` field to `projectTypes` schema
- [ ] "Save Draft" button on all steps
- [ ] Draft saves current step, form data, and folder structure
- [ ] Drafts appear in project types list with "Draft" badge
- [ ] Clicking draft opens wizard at last saved step
- [ ] Publishing draft clears `isDraft` flag
- [ ] Delete draft option (with confirmation)

**Schema Change**:

```typescript
// convex/schema.ts
projectTypes: defineTable({
  // existing fields...
  isDraft: v.optional(v.boolean()),
  draftData: v.optional(v.object({
    step: v.number(),
    formData: v.object({...}),
    folders: v.array(folderLevel1),
  })),
})
```

**Files to Modify**:

```
MODIFY: convex/schema.ts (add draft fields)
CREATE: convex/functions/projectTypes/mutations/saveDraft.ts
CREATE: convex/functions/projectTypes/mutations/publishDraft.ts
```

---

### Story 14.8: Folder Templates List (Project Type Scoped)

**Points**: 2  
**Priority**: High

**As an** Admin,  
**I want** to view all folder templates for a specific project type,  
**So that** I can manage multiple template variants.

**Acceptance Criteria**:

- [ ] New page: `/settings/project-types/{id}/folder-templates`
- [ ] Header shows project type name + "Folder Templates"
- [ ] Back button to project types list
- [ ] List all folder templates where `projectTypeId === params.id`
- [ ] Card view with:
  - Template name
  - Variant (if set)
  - Folder count
  - Active status
  - Edit / Delete actions
- [ ] "Add Template" button → `/.../{id}/folder-templates/new`
- [ ] Empty state: "No additional templates. The default was created with the project type."

**Files to Create**:

```
src/components/modules/admin/project-types/folder-templates/
  ├── index.tsx
  ├── template-list.tsx
  └── template-card.tsx
```

---

### Story 14.9: Folder Template Builder (Project Type Context)

**Points**: 2  
**Priority**: Medium

**As an** Admin,  
**I want** to create additional folder templates for a project type,  
**So that** I can offer template variants (e.g., "Minimal", "Full Coverage").

**Acceptance Criteria**:

- [ ] Modify existing `FolderTemplateBuilder` to work in project-type context
- [ ] Auto-set `projectTypeId` from route params (no selector needed)
- [ ] If in project-type context:
  - Hide project type selector
  - Show breadcrumb: Project Types > {Name} > Folder Templates > New
- [ ] Save navigates to `/settings/project-types/{id}/folder-templates`
- [ ] Template can have:
  - Name (required)
  - Variant label (optional, e.g., "Premium", "Standard")
  - Description (optional)
  - Folder hierarchy (reuse FolderTree)

**Files to Modify**:

```
src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx
  - Accept optional projectTypeId prop
  - Conditionally hide project type selector
  - Update return navigation
```

---

### Story 14.10: Deprecate Standalone Folder Templates Route

**Points**: 2  
**Priority**: Low (Final Cleanup)

**As a** Developer,  
**I want** to remove the standalone folder templates routes,  
**So that** users only access templates through project types.

**Acceptance Criteria**:

- [ ] Delete route: `/settings/folder-templates/page.tsx`
- [ ] Delete route: `/settings/folder-templates/new/page.tsx`
- [ ] Delete route: `/settings/folder-templates/[id]/page.tsx`
- [ ] Add redirect: `/settings/folder-templates` → `/settings/project-types`
- [ ] Remove "Folder Templates" from sidebar navigation
- [ ] Verify no broken links in application
- [ ] Run `pnpm tsc --noEmit` to verify no import errors

**⚠️ Execute ONLY after stories 14.1-14.9 are complete and tested!**

**Files to Delete**:

```
DELETE: src/app/(protected)/@admin/settings/folder-templates/ (entire directory)
```

**Files to Modify**:

```
MODIFY: src/lib/sidebar.ts (or navigation config)
  - Remove "Folder Templates" nav item
```

---

### Story 14.11: Schema & Backend Updates

**Points**: 2  
**Priority**: Critical (Foundation)

**As a** Developer,  
**I want** to update the schema to support the new relationship,  
**So that** the backend correctly handles project type + folder template creation.

**Acceptance Criteria**:

- [ ] Add `defaultFolderTemplateId` field to `projectTypes` table
- [ ] Create combined mutation: `createProjectTypeWithTemplate`
  - Creates project type
  - Creates default folder template
  - Links them via `defaultFolderTemplateId`
  - Returns both IDs
- [ ] Create mutation: `updateProjectTypeWithTemplate`
  - Updates project type
  - Updates or creates default template
  - Maintains link
- [ ] Validation: Reject project type creation without folders

**Schema Change**:

```typescript
// convex/schema.ts
projectTypes: defineTable({
  // existing fields...
  defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
  isDraft: v.optional(v.boolean()),
});
```

**Files to Create/Modify**:

```
MODIFY: convex/schema.ts
CREATE: convex/functions/projectTypes/mutations/createWithTemplate.ts
CREATE: convex/functions/projectTypes/mutations/updateWithTemplate.ts
```

---

## 📊 Files Summary

### Files to CREATE (20+ files)

```
src/components/modules/admin/project-types/wizard/
  ├── index.tsx
  ├── wizard-context.tsx
  ├── wizard-step-navigation.tsx
  ├── types.ts
  └── steps/
      ├── step-1-identity.tsx
      ├── step-2-folders.tsx
      └── step-3-review.tsx

src/components/modules/admin/project-types/folder-templates/
  ├── index.tsx
  ├── template-list.tsx
  └── template-card.tsx

src/app/(protected)/@admin/settings/project-types/new/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/new/page.tsx
src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/[templateId]/page.tsx

convex/functions/projectTypes/mutations/createWithTemplate.ts
convex/functions/projectTypes/mutations/updateWithTemplate.ts
convex/functions/projectTypes/mutations/saveDraft.ts
```

### Files to MODIFY

```
convex/schema.ts
  - Add defaultFolderTemplateId to projectTypes
  - Add isDraft + draftData fields

src/components/modules/admin/project-types/list/project-type-list.tsx
  - Update navigation to wizard

src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx
  - Support project-type context mode

src/lib/sidebar.ts (or navigation config)
  - Remove standalone Folder Templates link
```

### Files to DELETE (Final Phase)

```
src/app/(protected)/@admin/settings/folder-templates/ (entire directory)
```

### Files to DEPRECATE (Keep but unused)

```
src/components/modules/admin/project-types/list/project-type-drawer.tsx
  - Form logic migrated to step-1-identity.tsx
  - Keep for reference during migration, delete later
```

---

## ✅ Definition of Done

- [ ] Project Type wizard creates both type AND default folder template
- [ ] At least one folder is required before submission
- [ ] Edit mode pre-populates from existing data
- [ ] Draft save/resume works correctly
- [ ] Additional folder templates can be added per project type
- [ ] Standalone folder templates route removed
- [ ] All navigation updated (sidebar, buttons, cards)
- [ ] `pnpm tsc --noEmit` passes
- [ ] `pnpm build` succeeds
- [ ] Manual test: Full create → edit → add template flow

---

## 🧪 Testing Requirements

- [ ] **Unit**: Wizard context state management
- [ ] **Unit**: Form validation on step 1
- [ ] **Unit**: Folder minimum validation on step 2
- [ ] **Integration**: Create project type → verify template created
- [ ] **Integration**: Edit project type → verify changes persist
- [ ] **E2E**: Full wizard flow (create, review, submit)
- [ ] **E2E**: Draft save → resume → complete
- [ ] **E2E**: Add additional template to existing project type

---

## 🔗 Dependencies

| Depends On     | Notes                                     |
| :------------- | :---------------------------------------- |
| **Epic 13B**   | Folder template components must be stable |
| **Epic 13D.2** | Project types simplified UI completed     |

| Blocks | Notes                                    |
| :----- | :--------------------------------------- |
| None   | Can run independently after dependencies |

---

## ⚠️ Risk Mitigation

1. **Incremental Implementation**
   - Build wizard infrastructure first (14.1)
   - Add steps one at a time (14.2, 14.3, 14.4)
   - Verify each step works before proceeding

2. **Parallel Route Strategy**
   - Keep old routes working during development
   - Only delete (14.10) after new routes proven

3. **Draft Data Migration**
   - If existing project types have no folder templates, flag them
   - Provide migration script to assign defaults

4. **Staged Rollout**
   - Test with new project types first
   - Enable edit mode for existing types after validation

---

## 📐 Step Reference (Request Engagement Pattern)

The wizard MUST follow the UX pattern from:

- `src/components/modules/studio/quotations/request-flow/index.tsx`

Key elements to replicate:

- Full-screen layout (`h-screen overflow-hidden`)
- Three-zone structure: Header / Sidebar+Main / Footer
- Sidebar step navigation with icons and descriptions
- Animated step transitions (`motion/react`)
- Sticky footer with navigation buttons
- Progress indicators in header

---

_Document Version: 1.0_  
_Created: 2026-01-31 12:48 IST_  
_Author: PM Agent (John)_
