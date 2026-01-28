# Story 13B.4: Update Folder Setup Mutation

**Status**: backlog  
**Points**: 2  
**Epic**: [13B: Folder Template Enhancement](../../../../planning-artifacts/epics/13b-folder-template-enhancement.md)  
**Depends On**: Story 13B.1

---

## User Story

**As a** Developer,  
**I want** the folder setup mutation to handle hierarchical templates,  
**So that** nested folders are created correctly for each project.

---

## Acceptance Criteria

### AC1: Process All 3 Levels

**Given** a folder template with 3-level hierarchy  
**When** `setupFoldersInternal` is called  
**Then** it creates:

- All Level 1 folders first
- Then all Level 2 folders
- Then all Level 3 folders

### AC2: Folder Record Fields

**Given** each folder being created  
**When** inserting into `folders` table  
**Then** each record has:

- `projectId`: The target project ID
- `name`: Folder name from template
- `path`: Full path from template
- `description`: Optional description
- `isRequired`: Whether upload is required
- `status`: Default to `"empty"`

### AC3: Preserve Order

**Given** multiple folders at the same level  
**When** creating folders  
**Then** the order from the template is preserved

### AC4: Error Handling

**Given** a non-existent template ID is passed  
**When** the function is called  
**Then** it throws `"Folder template not found"`

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/functions/folders/mutations.ts
  - Rewrite setupFoldersInternal for hierarchical structure
```

### Implementation

```typescript
// convex/functions/folders/mutations.ts

import { internalMutation, MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

interface FolderLevel3 {
  name: string;
  path: string;
  description?: string;
  isRequired?: boolean;
}

interface FolderLevel2 {
  name: string;
  path: string;
  description?: string;
  isRequired?: boolean;
  children?: FolderLevel3[];
}

interface FolderLevel1 {
  name: string;
  path: string;
  description?: string;
  isRequired?: boolean;
  children?: FolderLevel2[];
}

/**
 * Creates folders for a project based on a folder template.
 * Handles up to 3 levels of nesting.
 *
 * Called internally from project spawning - NOT a public mutation.
 */
export async function setupFoldersFromTemplate(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  folderTemplateId: Id<"folderTemplates">,
): Promise<void> {
  const template = await ctx.db.get(folderTemplateId);

  if (!template) {
    throw new Error(`Folder template not found: ${folderTemplateId}`);
  }

  // Process Level 1 folders (roots)
  for (const level1 of template.folders) {
    await ctx.db.insert("folders", {
      projectId,
      name: level1.name,
      path: level1.path,
      description: level1.description,
      isRequired: level1.isRequired ?? false,
      status: "empty",
    });

    // Process Level 2 children (if any)
    if (level1.children) {
      for (const level2 of level1.children) {
        await ctx.db.insert("folders", {
          projectId,
          name: level2.name,
          path: level2.path,
          description: level2.description,
          isRequired: level2.isRequired ?? false,
          status: "empty",
        });

        // Process Level 3 grandchildren (if any)
        if (level2.children) {
          for (const level3 of level2.children) {
            await ctx.db.insert("folders", {
              projectId,
              name: level3.name,
              path: level3.path,
              description: level3.description,
              isRequired: level3.isRequired ?? false,
              status: "empty",
            });
          }
        }
      }
    }
  }
}

/**
 * Internal mutation wrapper for setupFoldersFromTemplate.
 * Use this from other mutations via ctx.runMutation or direct call.
 */
export const setupFoldersInternal = internalMutation({
  args: {
    projectId: v.id("projects"),
    folderTemplateId: v.id("folderTemplates"),
  },
  handler: async (ctx, { projectId, folderTemplateId }) => {
    await setupFoldersFromTemplate(ctx, projectId, folderTemplateId);
  },
});
```

### Update Project Spawning to Use New Function

```typescript
// In convex/functions/projects/spawning.ts

// When creating a project, call folder setup:
if (pkg.folderTemplateId) {
  await setupFoldersFromTemplate(ctx, projectId, pkg.folderTemplateId);
}
```

---

## ❌ DO NOT

- ❌ Do NOT use true recursion that exceeds 3 levels
- ❌ Do NOT skip parent folder creation
- ❌ Do NOT expose this as a public mutation (internal only)
- ❌ Do NOT forget to default `status` to `"empty"`

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Manual test: Create project with template → verify all folders created
- [ ] Manual test: Verify nested folders have correct paths

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
