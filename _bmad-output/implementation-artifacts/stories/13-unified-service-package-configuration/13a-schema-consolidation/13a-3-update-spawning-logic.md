# Story 13A.3: Update Project Spawning Logic for Multi-Package

**Status**: done  
**Points**: 3  
**Epic**: [13A: Schema Consolidation](../../../../planning-artifacts/epics/13a-schema-consolidation.md)  
**Depends On**: Story 13A.1, 13A.2

---

## User Story

**As a** System,  
**I want** project spawning to iterate through selected packages instead of line items,  
**So that** each package creates exactly one project on quotation approval.

---

## Acceptance Criteria

### AC1: Spawning Function Rewrite

**Given** a quotation with `selectedPackageIds: [pkg1, pkg2, pkg3]`  
**When** the quotation is approved  
**Then** the function iterates through `selectedPackageIds` (NOT `lineItems`)  
**And** creates one project per package that has a `projectTypeId`

### AC2: Project Creation Per Package

**Given** a service package with `projectTypeId`, `folderTemplateId`, `defaultStorageTierId`  
**When** creating a project from this package  
**Then** the project is created with:

- `quotationId`: The approved quotation's ID
- `studioId`: From `quotation.studioId`
- `projectTypeId`: From `package.projectTypeId`
- `source`: `"quotation_spawned"`
- `phase`: `"onboarding"`
- `actionState`: `"awaiting_uploads"`
- `endClientName`: From `quotation.endClientName`
- `eventName`: From `quotation.eventName` (optional)
- `code`: Auto-generated unique code (e.g., `PRJ-2026-001`)

### AC3: Folder Setup Per Project

**Given** a project is created from a package  
**When** the project insertion succeeds  
**Then** `setupFoldersInternal` is called with the package's `folderTemplateId`  
**And** all folders from the template are created for this project

### AC4: Status History Logging

**Given** a project is spawned  
**When** the project is created  
**Then** an entry is added to `statusHistory`:

- `entityType`: `"project"`
- `entityId`: The new project ID
- `fromStatus`: `null`
- `toStatus`: `"onboarding"`
- `reason`: `"Auto-created from quotation approval (package: {packageName})"`

### AC5: Return Created Project IDs

**Given** multiple packages spawn multiple projects  
**When** all projects are created  
**Then** the function returns `Id<"projects">[]` containing all created project IDs

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/functions/projects/spawning.ts
  - Rewrite spawnProjectsFromQuotation logic
  - Use selectedPackageIds instead of lineItems

MODIFY: convex/functions/quotations/mutations.ts
  - Update approveQuotation to use new spawning logic
  - Update acceptQuotation (studio-side) if it exists
```

### Main Spawning Function

```typescript
// convex/functions/projects/spawning.ts

import { internalMutation, MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * Spawns projects from an approved quotation.
 * Creates ONE project per selected service package.
 *
 * @param ctx - Mutation context
 * @param quotationId - The approved quotation
 * @returns Array of created project IDs
 */
export async function spawnProjectsFromQuotation(
  ctx: MutationCtx,
  quotationId: Id<"quotations">,
): Promise<Id<"projects">[]> {
  const quotation = await ctx.db.get(quotationId);
  if (!quotation) {
    throw new Error(`Quotation not found: ${quotationId}`);
  }

  const projectIds: Id<"projects">[] = [];

  // Iterate through PACKAGES, not line items
  for (const packageId of quotation.selectedPackageIds) {
    const pkg = await ctx.db.get(packageId);

    // Skip if package doesn't exist or has no project type
    if (!pkg || !pkg.projectTypeId) {
      console.warn(
        `Package ${packageId} skipped: not found or no projectTypeId`,
      );
      continue;
    }

    // Generate unique project code
    const projectCode = await generateProjectCode(ctx);

    // Create the project
    const projectId = await ctx.db.insert("projects", {
      quotationId: quotation._id,
      studioId: quotation.studioId,
      projectTypeId: pkg.projectTypeId,
      source: "quotation_spawned",
      phase: "onboarding",
      actionState: "awaiting_uploads",
      endClientName: quotation.endClientName,
      eventName: quotation.eventName,
      code: projectCode,
      createdAt: Date.now(),
    });

    // Setup folders from package's folder template
    if (pkg.folderTemplateId) {
      await setupFoldersInternal(ctx, projectId, pkg.folderTemplateId);
    }

    // Log status history
    await ctx.db.insert("statusHistory", {
      entityType: "project",
      entityId: projectId,
      fromStatus: null,
      toStatus: "onboarding",
      changedBy: null,
      reason: `Auto-created from quotation approval (package: ${pkg.name})`,
      timestamp: Date.now(),
    });

    projectIds.push(projectId);
  }

  return projectIds;
}

/**
 * Generates a unique project code.
 * Format: PRJ-YYYY-NNN (e.g., PRJ-2026-001)
 */
async function generateProjectCode(ctx: MutationCtx): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PRJ-${year}-`;

  // Get latest project with this year's prefix
  const projects = await ctx.db.query("projects").order("desc").take(1);

  let nextNumber = 1;
  if (projects.length > 0 && projects[0].code?.startsWith(prefix)) {
    const lastNumber = parseInt(projects[0].code.split("-")[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(3, "0")}`;
}
```

### Update approveQuotation Mutation

```typescript
// convex/functions/quotations/mutations.ts

export const approveQuotation = adminMutation({
  args: {
    quotationId: v.id("quotations"),
  },
  handler: async (ctx, { quotationId }) => {
    const quotation = await ctx.db.get(quotationId);
    if (!quotation) throw new Error("Quotation not found");

    // Validate status transition
    if (quotation.status !== "sent" && quotation.status !== "pending_review") {
      throw new Error(`Cannot approve quotation in ${quotation.status} status`);
    }

    // Update quotation status
    await ctx.db.patch(quotationId, {
      status: "approved",
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Spawn projects from selected packages
    const projectIds = await spawnProjectsFromQuotation(ctx, quotationId);

    return {
      success: true,
      projectIds,
      message: `Quotation approved. ${projectIds.length} project(s) created.`,
    };
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT iterate through `quotation.lineItems` for spawning
- ❌ Do NOT check `lineItem.spawnsProject` (this field no longer exists)
- ❌ Do NOT create project if package has no `projectTypeId`
- ❌ Do NOT skip folder setup - it must happen for each project
- ❌ Do NOT forget status history logging

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Manual test: Create quotation with 2 packages, approve, verify 2 projects spawn
- [ ] Manual test: Verify each project has correct `projectTypeId` from its package
- [ ] Manual test: Verify folders are created for each project

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
