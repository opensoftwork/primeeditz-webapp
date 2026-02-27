# Epic 28: Admin Internal Project Flow

**Epic Owner**: Admin/CEO
**Status**: Planning
**Created**: 2026-02-27
**Complexity**: High (New workflow path through existing project lifecycle)
**Priority**: P2 — New capability for internal project management

---

## 📋 Epic Summary

Enable admins to create **internal projects** for direct management — assigning employees without involving a studio or quotation. These projects follow the **same project lifecycle** (phases, action states, deliverables) as studio-originated projects, but skip the quotation/studio-request steps.

### Context

Currently, all projects are created either:

1. Through the **quotation flow** (studio requests → admin approves → projects spawned)
2. Through the **project spawning system** (`spawnProjectsFromQuotation`)

There is no way for an admin to create a project independently for internal work (e.g., in-house editing, internal client projects, practice work).

### Current State

The `projects` table schema already has the infrastructure:

```typescript
// From schema.ts
source: projectSourceValidator,  // "studio_request" | "admin_init" | "quotation_spawn"
studioId: v.optional(v.id("profiles")),  // Optional — can be null for internal projects
```

But there is **no UI flow** or dedicated mutation for creating internal projects.

### Target State

- Admin can create a project from the "All Projects" page without a studio or quotation
- Project follows the same lifecycle: `draft` → phases → deliverables → completion
- Admin assigns employees directly at creation time
- Project appears in the regular project listing with a distinct "Internal" badge
- Employee view shows assigned internal projects alongside studio projects

### Design Decision ✅

**Per user confirmation**: Internal projects follow the **same project lifecycle** as studio projects. No simplified workflow — same phases (onboarding, production, review, delivery), same action states, same deliverable flow. The only difference is that they skip the quotation/studio-request entry point.

---

## 🎯 User Outcomes

| Role         | Outcome                                                          |
| ------------ | ---------------------------------------------------------------- |
| **Admin**    | Create internal projects without needing a studio or quotation   |
| **Admin**    | Assign employees directly to internal projects                   |
| **Admin**    | Manage internal projects using the same tools as studio projects |
| **Employee** | See assigned internal projects in their project listing          |
| **Admin**    | Track internal project progress through the same lifecycle       |

---

## 🗂️ Stories

### Phase A: Backend & Data

| Story | Description                                                  | Points | Priority |
| ----- | ------------------------------------------------------------ | ------ | -------- |
| 28.1  | Create `createInternalProject` admin mutation                | 5      | HIGH     |
| 28.2  | Ensure project listing includes internal projects with badge | 3      | HIGH     |

### Phase B: Admin UI

| Story | Description                                                        | Points | Priority |
| ----- | ------------------------------------------------------------------ | ------ | -------- |
| 28.3  | "Create Internal Project" button + creation drawer in All Projects | 8      | HIGH     |
| 28.4  | Employee assignment during project creation                        | 3      | HIGH     |
| 28.5  | Internal project detail view adaptations                           | 3      | MEDIUM   |

### Phase C: Employee View

| Story | Description                              | Points | Priority |
| ----- | ---------------------------------------- | ------ | -------- |
| 28.6  | Employee listing shows internal projects | 2      | MEDIUM   |

**Total Points**: 24

---

## 📊 Detailed Story Specifications

### Story 28.1: Create `createInternalProject` admin mutation

**File**: `convex/functions/projects/mutations.ts` (or new file `convex/functions/projects/internal.ts`)

**Mutation**: `createInternalProject`

```typescript
// Pseudo-code
export const createInternalProject = adminMutation({
  args: {
    eventName: v.string(), // Project name
    projectTypeId: v.id("projectTypes"), // Project type
    folderTemplateId: v.optional(v.id("folderTemplates")),
    assignedEmployeeIds: v.optional(v.array(v.id("profiles"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = await generateProjectCode(ctx);

    const projectId = await ctx.db.insert("projects", {
      code,
      eventName: args.eventName,
      projectTypeId: args.projectTypeId,
      folderTemplateId: args.folderTemplateId,
      source: "admin_init",
      // No studioId — this is internal
      phase: "onboarding",
      actionState: "draft",
      awaitingActorRole: "admin",
      assignedEmployeeIds: args.assignedEmployeeIds || [],
      createdBy: ctx.profile._id,
      updatedAt: Date.now(),
    });

    // Create folder structure from template if provided
    if (args.folderTemplateId) {
      await createFoldersFromTemplate(ctx, projectId, args.folderTemplateId);
    }

    return projectId;
  },
});
```

**Acceptance Criteria**:

- [ ] Mutation creates a project with `source: "admin_init"` and no `studioId`
- [ ] Project starts in `onboarding` phase with `draft` action state
- [ ] Project code generated sequentially using existing code generation
- [ ] Optional folder template applied at creation
- [ ] Optional employee assignment at creation
- [ ] Status history entry created for initial state

---

### Story 28.2: Ensure project listing includes internal projects with badge

**Files**:

- `convex/functions/projects/queries.ts` (or equivalent admin project query)
- `src/components/modules/admin/projects/project-list/columns.tsx`

**Changes**:

- Admin project listing query should already return all projects (no `studioId` filter)
- Add an "Internal" badge in the project listing for projects where `source === "admin_init"` and `studioId` is undefined
- Ensure sorting/filtering includes internal projects

**Acceptance Criteria**:

- [ ] Internal projects appear in the "All Projects" listing
- [ ] "Internal" badge displayed for projects without a studio
- [ ] Filter by project source available (optional)
- [ ] Studio column shows "Internal" instead of studio name

---

### Story 28.3: "Create Internal Project" button + creation drawer

**File**: New component `src/components/modules/admin/projects/create-internal-project-drawer.tsx`

**Integration point**: "All Projects" page — add a secondary action button or dropdown option alongside the existing "New Quotation" flow.

**Creation Drawer fields**:

1. Project Name (text input)
2. Project Type (selector from `projectTypes` table)
3. Folder Template (optional selector from `folderTemplates`)
4. Assign Employees (multi-select from employees list)
5. Notes (optional textarea)

**Design**: Sheet/drawer opening from the right, consistent with `SendQuotationDrawer` styling. Width `sm:max-w-lg`.

**Acceptance Criteria**:

- [ ] "Create Internal Project" button visible on All Projects page
- [ ] Drawer opens with all required fields
- [ ] Project type selector populated from `projectTypes` table
- [ ] Folder template selector populated from `folderTemplates` table
- [ ] Employee multi-select populated from employees
- [ ] "Create" button calls `createInternalProject` mutation
- [ ] Success navigates to the new project's detail page
- [ ] Drawer styling consistent with existing PrimeEditz design system

---

### Story 28.4: Employee assignment during project creation

**Files**:

- Drawer component from 28.3
- `convex/functions/projects/mutations.ts`

**Reuse** the existing employee assignment components from the quotation module or project detail view.

**Acceptance Criteria**:

- [ ] Multiple employees can be assigned during project creation
- [ ] Employee avatars/names shown in the selector
- [ ] Assigned employees receive the project in their dashboard

---

### Story 28.5: Internal project detail view adaptations

**File**: `src/components/modules/admin/projects/project-detail/`

Small adaptations for internal projects:

- **Studio Info section**: Show "Internal Project" instead of studio name/contact
- **Quotation link**: Hide "View Quotation" since there's no quotation
- **All other sections** (deliverables, status, folders, etc.): Work identically

**Acceptance Criteria**:

- [ ] Project detail view renders correctly for internal projects
- [ ] Studio section shows "Internal Project" badge
- [ ] No broken links to non-existent quotations
- [ ] All lifecycle features (phases, deliverables, status tracking) work

---

### Story 28.6: Employee listing shows internal projects

**File**: `src/components/modules/employee/projects/` (employee project listing)

**Ensure**: Employee dashboard queries include projects where `source === "admin_init"` and the employee is assigned.

**Acceptance Criteria**:

- [ ] Employees see internal projects in their project listing
- [ ] Internal projects show "Internal" badge
- [ ] Employee can navigate to project detail and perform their role

---

## 🧩 Affected Components Map

### Backend

| File                                     | Change                                                        |
| ---------------------------------------- | ------------------------------------------------------------- |
| `convex/functions/projects/mutations.ts` | New `createInternalProject` mutation                          |
| `convex/functions/projects/queries.ts`   | Verify no `studioId` filter exclusion                         |
| `convex/schema.ts`                       | Verify `source` and `studioId` optionality (already optional) |

### Admin UI

| File                                      | Change                               |
| ----------------------------------------- | ------------------------------------ |
| `admin/projects/project-list/`            | Add "Create Internal Project" button |
| New: `create-internal-project-drawer.tsx` | New creation drawer                  |
| `admin/projects/project-detail/`          | Adaptations for internal projects    |
| `admin/projects/project-list/columns.tsx` | "Internal" badge                     |

### Employee UI

| File                 | Change                          |
| -------------------- | ------------------------------- |
| `employee/projects/` | Verify internal projects appear |

---

## 🔗 Dependencies

| This Epic | Depends On                             | Notes                               |
| --------- | -------------------------------------- | ----------------------------------- |
| 28.x      | Epic 24 (24.1 `quotationSource` field) | Consistency in source tracking      |
| 28.3      | Epic 12 (Employee Assignment)          | Reuse employee selection components |
| 28.5      | None                                   | Adapts existing detail view         |

---

## 🔄 Status Updates

| Date       | Status   | Notes                                                                      |
| ---------- | -------- | -------------------------------------------------------------------------- |
| 2026-02-27 | Planning | User confirmed: internal projects follow same lifecycle as studio projects |

---

**Previous Epic**: Epic 27 - PDF Preview Polish
**Next Epic**: TBD
