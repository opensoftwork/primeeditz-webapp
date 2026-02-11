# Epic 13F: Multi-Project Package Support

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Planned  
**Created**: 2026-01-30  
**Updated**: 2026-01-30  
**Complexity**: High  
**Estimated Points**: 16

---

## 📋 Epic Summary

This epic enables a **single service package** to spawn **multiple projects** when selected. This accommodates combo packages like "Complete Wedding Package" that includes Photo Post-Production, Video Production, and Album Design as separate projects with their own:

- Project Type
- Folder Template
- Storage Tier
- Team assignments
- Turnaround times
- Independent status tracking

---

## 🎯 Business Context

### Problem Statement

Studios frequently order combo packages that require different post-production workflows:

| Package          | Projects Needed                    |
| ---------------- | ---------------------------------- |
| Complete Wedding | Photo + Video + Album (3 projects) |
| Engagement Shoot | Photo + Video (2 projects)         |
| Corporate Event  | Photo + Video (2 projects)         |

**Current limitation**: Each package can only define ONE `projectTypeId`, forcing studios to:

- Select multiple separate packages (loses combo identity)
- Or create artificial "combo" project types (wrong abstraction)

### User Outcomes

| Role       | Outcome                                                          |
| ---------- | ---------------------------------------------------------------- |
| **Admin**  | Configure a single package that spawns multiple project types    |
| **Studio** | Select "Complete Wedding Package" and get 3 coordinated projects |
| **Team**   | Work on separate projects with appropriate folder structures     |
| **System** | Track combo projects together via shared quotation reference     |

---

## 📐 Schema Changes

### UPDATED: `servicePackages` Table

```typescript
// convex/schema.ts

servicePackages: defineTable({
  // Identity (unchanged)
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.optional(v.id("projectCategories")),

  // NEW: Multiple project configurations (replaces single projectTypeId)
  projectConfigs: v.array(v.object({
    id: v.string(),                                    // Unique ID for referencing
    label: v.optional(v.string()),                     // e.g., "Photo Editing", "Video Editing"
    projectTypeId: v.id("projectTypes"),
    folderTemplateId: v.id("folderTemplates"),
    defaultStorageTierId: v.optional(v.id("storageTiers")),
  })),

  // UPDATED: Line items can reference a specific project config
  lineItems: v.array(v.object({
    id: v.string(),
    sectionId: v.optional(v.id("quotationSections")),
    description: v.string(),
    unit: v.string(),
    rate: v.number(),
    quantity: v.number(),
    projectConfigId: v.optional(v.string()),           // NEW: Links to projectConfigs.id
    subItems: v.optional(v.array(v.object({
      description: v.string(),
      amount: v.optional(v.number()),
    }))),
  })),

  terms: v.optional(v.string()),
  applyGST: v.boolean(),
  isActive: v.boolean(),
  createdBy: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
})
  .index("by_categoryId", ["categoryId"])
  .index("by_isActive", ["isActive"]),
```

### Migration Strategy

Since Epic 13A/13C created the current schema, we need to:

1. **Add `projectConfigs` array** to schema
2. **Migrate existing data**: Convert single `projectTypeId` → `projectConfigs[0]`
3. **Add `projectConfigId`** to line items (optional, for allocation)
4. **Deprecate** single `projectTypeId`, `folderTemplateId`, `defaultStorageTierId`

---

## 📝 User Stories

### Story 13F.1: Schema Update - Add `projectConfigs` Array

**Points**: 3

**As a** Developer,  
**I want** the `servicePackages` schema to support multiple project configurations,  
**So that** a single package can spawn multiple projects.

**Acceptance Criteria**:

- [ ] Add `projectConfigs` array to `servicePackages` table
- [ ] Each config has: `id`, `label`, `projectTypeId`, `folderTemplateId`, `defaultStorageTierId`
- [ ] Add `projectConfigId` field to line items (optional)
- [ ] Write migration to convert existing packages:
  - If `projectTypeId` exists, create `projectConfigs[0]` from existing fields
  - Set `projectConfigId` on all line items to first config's ID
- [ ] Remove deprecated single fields after migration
- [ ] Run `pnpm convex dev` to validate schema
- [ ] Run `pnpm tsc --noEmit` with no errors

**Technical Notes**:

```typescript
// Migration helper
async function migrateToProjectConfigs(ctx: MutationCtx) {
  const packages = await ctx.db.query("servicePackages").collect();

  for (const pkg of packages) {
    if (pkg.projectTypeId && !pkg.projectConfigs) {
      const configId = nanoid();
      await ctx.db.patch(pkg._id, {
        projectConfigs: [
          {
            id: configId,
            label: "Default",
            projectTypeId: pkg.projectTypeId,
            folderTemplateId: pkg.folderTemplateId,
            defaultStorageTierId: pkg.defaultStorageTierId,
          },
        ],
        lineItems: pkg.lineItems.map((item) => ({
          ...item,
          projectConfigId: configId,
        })),
        // Clear deprecated fields
        projectTypeId: undefined,
        folderTemplateId: undefined,
        defaultStorageTierId: undefined,
      });
    }
  }
}
```

**Files to Modify**:

```
MODIFY: convex/schema.ts
  - Add projectConfigs array definition
  - Add projectConfigId to lineItems
  - Remove single projectTypeId, folderTemplateId, defaultStorageTierId

CREATE: convex/functions/servicePackages/migrations.ts
  - migrateToProjectConfigs function
  - Add to seed function for dev environments
```

**❌ DO NOT**:

- Do NOT delete existing packages - migrate them
- Do NOT lose any existing configuration data
- Do NOT break existing builder UI until updated

---

### Story 13F.2: Update Builder Step 2 - Multi-Project Config UI

**Points**: 5

**As an** Admin,  
**I want** to configure multiple project types in Step 2 of the package builder,  
**So that** I can create combo packages.

**Acceptance Criteria**:

- [ ] Rename Step 2 from "Project Configuration" to "Project Configurations"
- [ ] Add "Add Project Configuration" button
- [ ] Each project config shows:
  - Label input (e.g., "Photo Editing", "Video Editing")
  - Project Type selector
  - Folder Template selector (filtered by project type)
  - Storage Tier selector
  - Delete button (X)
- [ ] Minimum 1 project config required
- [ ] Preview panel shows all configured projects
- [ ] Drag-to-reorder support (optional, stretch goal)

**UI Mockup**:

```
┌────────────────────────────────────────────────────────────┐
│ STEP 2: PROJECT CONFIGURATIONS                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📷 CONFIG 1: Photo Editing                     [X]   │   │
│ │ ┌─────────────────┐ ┌─────────────────┐              │   │
│ │ │ Label           │ │ Photo Editing   │              │   │
│ │ └─────────────────┘ └─────────────────┘              │   │
│ │ ┌─────────────────┐ ┌─────────────────┐              │   │
│ │ │ Project Type    │ │ Photo Post-Prod │              │   │
│ │ └─────────────────┘ └─────────────────┘              │   │
│ │ ┌─────────────────┐ ┌─────────────────┐              │   │
│ │ │ Folder Template │ │ Wedding Photos  │              │   │
│ │ └─────────────────┘ └─────────────────┘              │   │
│ │ ┌─────────────────┐ ┌─────────────────┐              │   │
│ │ │ Storage Tier    │ │ Premium (500GB) │              │   │
│ │ └─────────────────┘ └─────────────────┘              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 🎬 CONFIG 2: Video Editing                     [X]   │   │
│ │ ...                                                  │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ [+ Add Another Project Configuration]                      │
│                                                            │
│                                         [ Back ] [ Next ]  │
└────────────────────────────────────────────────────────────┘
```

**Technical Pattern**:

- **File**: Update `step-2-project-config.tsx`
- **Form**: TanStack Form array mode for `projectConfigs`
- **Context**: Update `builder-context.tsx` for new Step2Data structure

**Updated Schema**:

```typescript
// builder-context.tsx
export interface Step2Data {
  projectConfigs: {
    id: string;
    label: string;
    projectTypeId: string;
    folderTemplateId: string;
    defaultStorageTierId?: string;
  }[];
}
```

**Files to Modify**:

```
MODIFY: src/components/modules/admin/service-packages/builder/builder-context.tsx
  - Update Step2Data interface

MODIFY: src/components/modules/admin/service-packages/builder/step-2-project-config.tsx
  - Replace single config form with array of configs
  - Add "Add Configuration" button
  - Add delete functionality

CREATE: src/components/modules/admin/service-packages/builder/components/project-config-card.tsx
  - Reusable card for each project config
```

**❌ DO NOT**:

- Do NOT allow 0 project configs (minimum 1)
- Do NOT duplicate project types in same package (validate)
- Do NOT hardcode project type options (query from DB)

---

### Story 13F.3: Link Line Items to Project Configs

**Points**: 3

**As an** Admin,  
**I want** to assign line items to specific project configurations,  
**So that** pricing is correctly attributed to each project.

**Acceptance Criteria**:

- [ ] In Step 3 (Pricing), each line item has a "Project" dropdown
- [ ] Dropdown shows all project configs from Step 2 (by label)
- [ ] Optional: Line items without assignment apply to "General/Package"
- [ ] Summary shows line items grouped by project config
- [ ] Validation: Line items referencing deleted configs show warning

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────────┐
│ LINE ITEMS                                                      │
├─────────────────────────────────────────────────────────────────┤
│ ┌────────────┬────────────┬────────────┬──────┬──────┬───────┐  │
│ │ Project    │ Description│ Unit       │ Rate │ Qty  │ Total │  │
│ ├────────────┼────────────┼────────────┼──────┼──────┼───────┤  │
│ │ [Photo ▼]  │ Culling    │ per project│ 5000 │  1   │ 5000  │  │
│ │ [Photo ▼]  │ Retouching │ per image  │   50 │ 100  │ 5000  │  │
│ │ [Video ▼]  │ Editing    │ per project│15000 │  1   │15000  │  │
│ │ [Video ▼]  │ Color Grade│ per minute │  200 │  30  │ 6000  │  │
│ │ [Album ▼]  │ Design     │ per spread │  500 │  20  │10000  │  │
│ └────────────┴────────────┴────────────┴──────┴──────┴───────┘  │
│                                                                 │
│ SUMMARY BY PROJECT:                                             │
│ ├── 📷 Photo Editing: ₹10,000                                   │
│ ├── 🎬 Video Editing: ₹21,000                                   │
│ └── 📚 Album Design:  ₹10,000                                   │
│     ═══════════════════════════                                 │
│     SUBTOTAL: ₹41,000                                           │
└─────────────────────────────────────────────────────────────────┘
```

**Technical Pattern**:

- **File**: Update `step-3-pricing.tsx` and `line-item-row.tsx`
- **Data Flow**: Receive `projectConfigs` from Step 2 via context

**Files to Modify**:

```
MODIFY: src/components/modules/admin/service-packages/builder/step-3-pricing.tsx
  - Add project config selector to line items
  - Group line items by project config in summary

MODIFY: src/components/modules/admin/service-packages/builder/components/line-item-row.tsx
  - Add projectConfigId field with dropdown
  - Populate dropdown from builder context
```

**❌ DO NOT**:

- Do NOT require all line items to have a project (allow "General")
- Do NOT show config IDs - show labels to user
- Do NOT break if user goes back and changes configs (handle gracefully)

---

### Story 13F.4: Update Spawning Logic - Create N Projects

**Points**: 3

**As the** System,  
**I want** to create multiple projects when a multi-project package is approved,  
**So that** each project type has its own workflow.

**Acceptance Criteria**:

- [ ] `spawnProjectsFromQuotation` iterates through `package.projectConfigs`
- [ ] Each config spawns one project with correct:
  - `projectTypeId`
  - `folderTemplateId`
  - `defaultStorageTierId`
- [ ] All spawned projects share:
  - `quotationId`
  - `studioId`
  - `endClientName`
  - `eventName`, `eventDate`
- [ ] Projects are linked for UI grouping (common `quotationId`)
- [ ] Status history logs which package/config spawned the project

**Technical Implementation**:

```typescript
// convex/functions/projects/spawning.ts

export async function spawnProjectsFromQuotation(
  ctx: MutationCtx,
  quotationId: Id<"quotations">,
): Promise<Id<"projects">[]> {
  const quotation = await ctx.db.get(quotationId);
  if (!quotation) throw new Error("Quotation not found");

  const projectIds: Id<"projects">[] = [];

  // Iterate through all selected packages
  for (const packageId of quotation.selectedPackageIds) {
    const pkg = await ctx.db.get(packageId);
    if (!pkg || !pkg.projectConfigs) continue;

    // Create project for EACH config in the package
    for (const config of pkg.projectConfigs) {
      const projectId = await ctx.db.insert("projects", {
        quotationId: quotation._id,
        studioId: quotation.studioId,
        projectTypeId: config.projectTypeId,
        source: "quotation_spawned",
        phase: "onboarding",
        actionState: "awaiting_uploads",
        endClientName: quotation.endClientName,
        eventName: quotation.eventName,
        eventDate: quotation.eventDate,
        code: await generateProjectCode(ctx),
      });

      // Setup folders from config's template
      await setupFoldersInternal(ctx, projectId, config.folderTemplateId);

      // Set storage quota if specified
      if (config.defaultStorageTierId) {
        await setProjectStorageQuota(
          ctx,
          projectId,
          config.defaultStorageTierId,
        );
      }

      // Log status with config info
      await ctx.db.insert("statusHistory", {
        entityType: "project",
        entityId: projectId,
        fromStatus: null,
        toStatus: "onboarding",
        changedBy: null,
        reason: `Spawned from package "${pkg.name}" - ${config.label || "Default"}`,
      });

      projectIds.push(projectId);
    }
  }

  return projectIds;
}
```

**Files to Modify**:

```
MODIFY: convex/functions/projects/spawning.ts
  - Update spawnProjectsFromQuotation to iterate projectConfigs
  - Create project per config, not per package
```

**❌ DO NOT**:

- Do NOT skip configs without labels (use "Default" or index)
- Do NOT create duplicate projects for same config
- Do NOT break if one config fails (continue, log error)

---

### Story 13F.5: Update View/Detail - Show Multiple Configs

**Points**: 2

**As an** Admin,  
**I want** to see all project configurations when viewing a package,  
**So that** I can review the complete combo setup.

**Acceptance Criteria**:

- [ ] Package detail page shows "Projects This Package Creates" section
- [ ] Each config displayed with:
  - Label (e.g., "Photo Editing")
  - Project Type name
  - Folder Template name
  - Storage Tier badge
- [ ] Edit button opens builder with all configs pre-filled
- [ ] Line items show which project they're assigned to

**UI Mockup**:

```
┌─────────────────────────────────────────────────────────────┐
│ Complete Wedding Package                           [Active] │
│ Category: Premium Wedding                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📦 PROJECTS THIS PACKAGE CREATES (3)                        │
│ ┌─────────────────────────────────┐                         │
│ │ 📷 Photo Editing                │                         │
│ │ Type: Photo Post-Production     │                         │
│ │ Template: Wedding Photos        │                         │
│ │ Storage: Premium (500GB)        │                         │
│ └─────────────────────────────────┘                         │
│ ┌─────────────────────────────────┐                         │
│ │ 🎬 Video Editing                │                         │
│ │ Type: Video Production          │                         │
│ │ Template: Wedding Cinema        │                         │
│ │ Storage: Enterprise (1TB)       │                         │
│ └─────────────────────────────────┘                         │
│ ┌─────────────────────────────────┐                         │
│ │ 📚 Album Design                 │                         │
│ │ Type: Album Production          │                         │
│ │ Template: Premium Album         │                         │
│ │ Storage: Standard (100GB)       │                         │
│ └─────────────────────────────────┘                         │
│                                                             │
│ 💰 PRICING (₹1,50,000)                                      │
│ ├── Photo Editing: ₹50,000                                  │
│ ├── Video Editing: ₹70,000                                  │
│ └── Album Design: ₹30,000                                   │
│                                                             │
│                         [Edit] [Duplicate] [Deactivate]     │
└─────────────────────────────────────────────────────────────┘
```

**Files to Modify**:

```
MODIFY: src/components/modules/admin/service-packages/detail/package-detail.tsx
  - Add "Projects This Package Creates" section
  - Show each projectConfig as a card
  - Group line items by projectConfigId

CREATE: src/components/modules/admin/service-packages/detail/components/project-config-preview.tsx
  - Reusable component for displaying a single project config
```

---

## ✅ Definition of Done

- [ ] `servicePackages` schema supports `projectConfigs` array
- [ ] Existing packages migrated successfully
- [ ] Builder Step 2 allows multiple project configurations
- [ ] Line items can be assigned to specific projects
- [ ] Spawning creates N projects per package (one per config)
- [ ] Detail view shows all project configurations
- [ ] `pnpm convex dev` runs without errors
- [ ] `pnpm tsc --noEmit` has no type errors
- [ ] `pnpm build` succeeds

---

## 🧪 Testing Requirements

- [ ] Create package with 1 project config (backward compat)
- [ ] Create package with 3 project configs
- [ ] Assign line items to different configs
- [ ] Approve quotation with multi-project package
- [ ] Verify 3 projects created with correct types
- [ ] Verify each project has correct folder structure
- [ ] Edit existing multi-project package

---

## 🔗 Dependencies

| Depends On   | Notes                               |
| ------------ | ----------------------------------- |
| **Epic 13A** | Base `servicePackages` table exists |
| **Epic 13C** | Builder UI exists to modify         |

| Blocks       | Notes                                                  |
| ------------ | ------------------------------------------------------ |
| **Epic 13E** | Bundle discounts work on top of multi-project packages |

---

## ❌ Out of Scope for 13F

- Bundle discounts (Epic 13E)
- Line item sub-items editing (existing functionality)
- Project team assignment per config (future epic)
- Custom turnaround times per config (future epic)

---

_Document Version: 1.0_  
_Created: 2026-01-30 13:04 IST_  
_Author: BMAD Party Mode (Architect + PM + SM)_
