# Story 13F.4: Update Spawning Logic - Create N Projects

**Status**: done
**Points**: 3  
**Epic**: [13F: Multi-Project Package Support](../../../../planning-artifacts/epics/13f-multi-project-package-support.md)  
**Depends On**: 13F.1 (Schema)

---

## User Story

**As the** System,  
**I want** to create multiple projects when a multi-project package is approved,  
**So that** each project type has its own workflow, folder structure, and tracking.

---

## Business Context

When a studio's quotation with "Complete Wedding Package" is approved:

1. Photo Post-Production project is created → with Wedding Photos folder template
2. Video Production project is created → with Wedding Cinema folder template
3. Album Design project is created → with Album folder template

All 3 projects share the same:

- `quotationId` (for linking)
- `studioId` (client)
- `endClientName`, `eventName`, `eventDate` (event details)

But each has its own:

- `projectTypeId`
- Folder structure (from `folderTemplateId`)
- Storage quota (from `defaultStorageTierId`)
- `status` and `assignedTo`

---

## Acceptance Criteria

### AC1: Iterate Through Project Configs

**Given** a quotation approval triggers `spawnProjectsFromQuotation`  
**When** a selected package has `projectConfigs` array  
**Then** one project is created for EACH config in the array

**And** this replaces the old single-project-per-package behavior

### AC2: Backward Compatibility

**Given** an existing package without `projectConfigs`  
**When** it only has the deprecated `projectTypeId` and `folderTemplateId`  
**Then** the old behavior continues (one project per package)

**And** no errors are thrown

### AC3: Project Creation Per Config

**Given** a project is being created from a projectConfig  
**When** the project is inserted  
**Then** it includes:

```typescript
{
  quotationId: quotation._id,
  studioId: quotation.studioId,
  projectTypeId: config.projectTypeId,
  source: "quotation_spawned",
  phase: "onboarding",
  actionState: "awaiting_uploads",
  endClientName: quotation.endClientName,
  eventName: quotation.eventName,
  eventDate: quotation.eventDate,
  code: generateProjectCode(),  // Unique code
}
```

### AC4: Folder Setup Per Config

**Given** a project is created from a projectConfig  
**When** the spawning logic runs  
**Then** `setupFoldersInternal` is called with `config.folderTemplateId`

**And** the project gets its own folder structure

### AC5: Storage Quota Per Config

**Given** a projectConfig has `defaultStorageTierId` set  
**When** the project is created  
**Then** the storage quota is set from the tier

### AC6: Status History Logging

**Given** a project is spawned from a config  
**When** the status history is logged  
**Then** it includes the package name AND config label:

```
"Spawned from package 'Complete Wedding' - Photo Editing"
```

### AC7: Return All Created Project IDs

**Given** a quotation with packages that spawn multiple projects  
**When** `spawnProjectsFromQuotation` completes  
**Then** it returns an array of ALL created project IDs

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/functions/projects/spawning.ts
  - Update spawnProjectsFromQuotation to iterate projectConfigs
  - Add backward compatibility for deprecated single fields
  - Ensure each config spawns one project

MODIFY: convex/functions/quotations/mutations.ts
  - Update approveQuotation to use new spawning logic
  - Store all spawned project IDs
```

### Updated Spawning Function

```typescript
// convex/functions/projects/spawning.ts

import { MutationCtx, Id } from "../_generated/server";
import { nanoid } from "nanoid";

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
    if (!pkg) continue;

    // NEW: Multi-project support via projectConfigs
    if (pkg.projectConfigs && pkg.projectConfigs.length > 0) {
      // Create project for EACH config in the package
      for (const config of pkg.projectConfigs) {
        const projectId = await createProjectFromConfig(
          ctx,
          quotation,
          pkg,
          config,
        );
        projectIds.push(projectId);
      }
    }
    // BACKWARD COMPAT: Legacy single-project packages
    else if (pkg.projectTypeId && pkg.folderTemplateId) {
      const legacyConfig = {
        id: "legacy",
        label: "Default",
        projectTypeId: pkg.projectTypeId,
        folderTemplateId: pkg.folderTemplateId,
        defaultStorageTierId: pkg.defaultStorageTierId,
      };
      const projectId = await createProjectFromConfig(
        ctx,
        quotation,
        pkg,
        legacyConfig,
      );
      projectIds.push(projectId);
    }
  }

  return projectIds;
}

async function createProjectFromConfig(
  ctx: MutationCtx,
  quotation: Doc<"quotations">,
  pkg: Doc<"servicePackages">,
  config: {
    id: string;
    label?: string;
    projectTypeId: Id<"projectTypes">;
    folderTemplateId: Id<"folderTemplates">;
    defaultStorageTierId?: Id<"storageTiers">;
  },
): Promise<Id<"projects">> {
  // Generate unique project code
  const code = await generateProjectCode(ctx);

  // Create the project
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
    code,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  // Setup folders from config's template
  await setupFoldersInternal(ctx, projectId, config.folderTemplateId);

  // Set storage quota if specified
  if (config.defaultStorageTierId) {
    await setProjectStorageQuota(ctx, projectId, config.defaultStorageTierId);
  }

  // Log status with config info
  await ctx.db.insert("statusHistory", {
    entityType: "project",
    entityId: projectId,
    fromStatus: null,
    toStatus: "onboarding",
    changedBy: null,
    timestamp: Date.now(),
    reason: `Spawned from package "${pkg.name}" - ${config.label || "Default"}`,
  });

  return projectId;
}

async function generateProjectCode(ctx: MutationCtx): Promise<string> {
  // Get year prefix
  const year = new Date().getFullYear().toString().slice(-2);

  // Query last project code
  const lastProject = await ctx.db.query("projects").order("desc").first();

  // Extract and increment number
  let nextNum = 1;
  if (lastProject?.code) {
    const match = lastProject.code.match(/\d+$/);
    if (match) {
      nextNum = parseInt(match[0], 10) + 1;
    }
  }

  return `PE${year}-${nextNum.toString().padStart(5, "0")}`;
}
```

### Updated Quotation Approval

```typescript
// convex/functions/quotations/mutations.ts

export const approveQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, args) => {
    const quotation = await ctx.db.get(args.quotationId);
    if (!quotation) throw new Error("Quotation not found");
    if (quotation.status !== "sent") {
      throw new Error("Only sent quotations can be approved");
    }

    // Spawn projects from ALL packages
    const projectIds = await spawnProjectsFromQuotation(ctx, args.quotationId);

    // Update quotation status
    await ctx.db.patch(args.quotationId, {
      status: "approved",
      approvedAt: Date.now(),
      projectIds: projectIds, // Store all spawned project IDs
      updatedAt: Date.now(),
    });

    return { projectIds };
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT delete the old single-project logic (keep for backward compat)
- ❌ Do NOT fail silently if a config has missing data - log and skip
- ❌ Do NOT create duplicate projects for the same config
- ❌ Do NOT break existing quotation approvals
- ❌ Do NOT modify UI in this story - that's 13F.2 and 13F.3

---

## Tasks/Subtasks

- [x] **Spawning Logic Update**
  - [x] Update `spawnProjectsFromQuotation` to iterate `projectConfigs`
  - [x] Create helper `createProjectInternal` function
  - [x] Add backward compatibility check for legacy packages
  - [x] Ensure unique project codes for each spawned project
- [x] **Folder Setup**
  - [x] Call `setupFoldersInternal` with config's `folderTemplateId`
  - [x] Verify each project gets separate folder structure
- [x] **Storage Quota**
  - [x] Apply `defaultStorageTierId` if specified in config
- [x] **Status History**
  - [x] Log spawn event with package name AND config label
- [x] **Quotation Mutation Update**
  - [x] Update `approveQuotation` to store all spawned `projectIds`
  - [x] Verify return value includes all project IDs
- [x] **Validation**
  - [x] Run `pnpm tsc --noEmit` - no TypeScript errors
  - [x] Run `npx convex dev --once` - functions compile
  - [x] Manual test: Approve quotation with multi-project package

---

## Testing Requirements

- [x] Run `pnpm tsc --noEmit` - no TypeScript errors
- [x] Run `npx convex dev --once` - Convex functions compile

### Integration Testing

- [x] Create quotation with 1-config package → 1 project created
- [x] Create quotation with 3-config package → 3 projects created
- [x] Verify each project has correct:
  - [x] `projectTypeId`
  - [x] Folder structure (from template)
  - [x] Storage quota (if configured)
  - [x] Status history entry with config label
- [x] Approve quotation with 2 packages (3 configs + 2 configs) → 5 projects
- [x] Test legacy package (no `projectConfigs`) → still works (1 project)
      **Status**: done
      **Points**: 3

---

## Dev Agent Record

- Updated `spawnProjectsFromQuotation` to support the new `projectConfigs` array.
- Refactored project creation into a clean `createProjectInternal` helper.
- Implemented updated project code generation: `PE-YY-NNNNN`.
- Integrated `setupFoldersInternal` for automated per-project folder and storage allocation.
- Modified `approveQuotation` and `acceptQuotation` to capture and store all spawned project IDs.
- Ensured backward compatibility for packages still using legacy single-field configurations.

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

The system now correctly handles the "1 Package -> N Projects" relationship. Upon quotation approval (either by admin or client), the spawning engine iterates through each project configuration defined in the selected packages and creates distinct projects with their own settings. All spawned project IDs are tracked within the quotation record for end-to-end traceability.

### Files Changed

- `convex/functions/projects/spawning.ts`
- `convex/functions/quotations/mutations.ts`
