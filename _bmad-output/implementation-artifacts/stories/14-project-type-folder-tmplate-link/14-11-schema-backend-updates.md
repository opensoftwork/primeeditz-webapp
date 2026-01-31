# Story 14.11: Schema & Backend Updates

**Status**: done  
**Points**: 2  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: None (Foundation Story - can run in parallel with 14.1)

---

## User Story

**As a** Developer,  
**I want** to update the Convex schema and create necessary mutations,  
**So that** the frontend can create project types with linked folder templates.

---

## Acceptance Criteria

### AC1: Schema Updated

**Given** I need to store draft and template link data  
**When** I update the schema  
**Then** `projectTypes` table includes:

- `isDraft: v.optional(v.boolean())`
- `draftData: v.optional(v.object({...}))`
- `defaultFolderTemplateId: v.optional(v.id("folderTemplates"))`

### AC2: Create With Template Mutation

**Given** a user submits the wizard  
**When** `createWithTemplate` is called  
**Then** it atomically:

1. Creates the project type
2. Creates the default folder template
3. Links them via `defaultFolderTemplateId`

### AC3: Update With Template Mutation

**Given** a user edits via the wizard  
**When** `updateWithTemplate` is called  
**Then** it:

1. Updates the project type fields
2. Updates or creates the folder template
3. Maintains the link

### AC4: Save Draft Mutation

**Given** a user saves as draft  
**When** `saveDraft` is called  
**Then** it:

1. Creates/updates project type with `isDraft: true`
2. Stores step position and folder data in `draftData`

### AC5: Delete Cascade

**Given** a project type is deleted  
**When** `deleteProjectType` is called  
**Then** all linked folder templates are also deleted

### AC6: Query for Templates by Project Type

**Given** I need to list templates for a project type  
**When** `getByProjectTypeId` is called  
**Then** it returns all folder templates for that project type

---

## Technical Implementation

### Schema Updates

```typescript
// convex/schema.ts

// Add to folderLevel validators (existing)
const folderLevel3 = v.object({
  name: v.string(),
  path: v.string(),
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
});

const folderLevel2 = v.object({
  name: v.string(),
  path: v.string(),
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  children: v.optional(v.array(folderLevel3)),
});

const folderLevel1 = v.object({
  name: v.string(),
  path: v.string(),
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  children: v.optional(v.array(folderLevel2)),
});

// Export for use in mutations
export { folderLevel1, folderLevel2, folderLevel3 };

// Update projectTypes table
projectTypes: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  categoryId: v.id("projectCategories"),
  icon: v.optional(v.string()),
  isActive: v.boolean(),
  // NEW: Draft support
  isDraft: v.optional(v.boolean()),
  draftData: v.optional(v.object({
    step: v.number(),
    folders: v.array(folderLevel1),
  })),
  // NEW: Link to default template
  defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
})
  .index("by_category", ["categoryId"])
  .index("by_isDraft", ["isDraft"]),
```

### Create With Template Mutation

```typescript
// convex/functions/projectTypes/mutations/createWithTemplate.ts
import { authMutation } from "@/lib/auth-wrappers";
import { v } from "convex/values";
import { folderLevel1 } from "../../../schema";

export const createWithTemplate = authMutation({
  args: {
    projectType: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.id("projectCategories"),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1),
  },
  handler: async (ctx, args) => {
    const { projectType, folders } = args;

    // 1. Create the project type first (without template link)
    const projectTypeId = await ctx.db.insert("projectTypes", {
      ...projectType,
      isDraft: false,
    });

    // 2. Create the default folder template
    const templateId = await ctx.db.insert("folderTemplates", {
      name: `${projectType.name} Default`,
      projectTypeId,
      folders,
      isActive: true,
    });

    // 3. Link the template to the project type
    await ctx.db.patch(projectTypeId, {
      defaultFolderTemplateId: templateId,
    });

    return { projectTypeId, templateId };
  },
});
```

### Update With Template Mutation

```typescript
// convex/functions/projectTypes/mutations/updateWithTemplate.ts
import { authMutation } from "@/lib/auth-wrappers";
import { v } from "convex/values";
import { folderLevel1 } from "../../../schema";

export const updateWithTemplate = authMutation({
  args: {
    projectTypeId: v.id("projectTypes"),
    templateId: v.optional(v.id("folderTemplates")),
    projectType: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.id("projectCategories"),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1),
  },
  handler: async (ctx, args) => {
    const { projectTypeId, templateId, projectType, folders } = args;

    // 1. Update project type
    await ctx.db.patch(projectTypeId, {
      ...projectType,
      isDraft: false, // Ensure draft flag is cleared
      draftData: undefined, // Clear draft data
    });

    if (templateId) {
      // 2a. Update existing template
      await ctx.db.patch(templateId, {
        name: `${projectType.name} Default`,
        folders,
      });
    } else {
      // 2b. Create new template if none exists
      const newTemplateId = await ctx.db.insert("folderTemplates", {
        name: `${projectType.name} Default`,
        projectTypeId,
        folders,
        isActive: true,
      });

      await ctx.db.patch(projectTypeId, {
        defaultFolderTemplateId: newTemplateId,
      });
    }

    return { projectTypeId };
  },
});
```

### Save Draft Mutation

```typescript
// convex/functions/projectTypes/mutations/saveDraft.ts
import { authMutation } from "@/lib/auth-wrappers";
import { v } from "convex/values";
import { folderLevel1 } from "../../../schema";

export const saveDraft = authMutation({
  args: {
    id: v.optional(v.id("projectTypes")),
    step: v.number(),
    formData: v.object({
      name: v.string(),
      description: v.optional(v.string()),
      categoryId: v.optional(v.string()),
      icon: v.optional(v.string()),
      isActive: v.boolean(),
    }),
    folders: v.array(folderLevel1),
  },
  handler: async (ctx, args) => {
    const { id, step, formData, folders } = args;

    const draftData = { step, folders };

    const projectTypeData = {
      name: formData.name || "Untitled Draft",
      description: formData.description,
      categoryId: formData.categoryId as any,
      icon: formData.icon,
      isActive: formData.isActive,
      isDraft: true,
      draftData,
    };

    if (id) {
      await ctx.db.patch(id, projectTypeData);
      return id;
    } else {
      return await ctx.db.insert("projectTypes", projectTypeData);
    }
  },
});
```

### Query: Get Templates By Project Type

```typescript
// convex/functions/folderTemplates/queries/getByProjectTypeId.ts
import { adminQuery } from "@/lib/auth-wrappers";
import { v } from "convex/values";

export const getByProjectTypeId = adminQuery({
  args: {
    projectTypeId: v.id("projectTypes"),
  },
  handler: async (ctx, args) => {
    const templates = await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectType", (q) =>
        q.eq("projectTypeId", args.projectTypeId),
      )
      .collect();

    return templates;
  },
});
```

### Delete Cascade

```typescript
// convex/functions/projectTypes/mutations/deleteProjectType.ts
import { authMutation } from "@/lib/auth-wrappers";
import { v } from "convex/values";

export const deleteProjectType = authMutation({
  args: {
    id: v.id("projectTypes"),
  },
  handler: async (ctx, args) => {
    // 1. Delete all associated folder templates
    const templates = await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectType", (q) => q.eq("projectTypeId", args.id))
      .collect();

    for (const template of templates) {
      await ctx.db.delete(template._id);
    }

    // 2. Delete the project type
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
```

### Index Addition

Ensure the `folderTemplates` table has the index:

```typescript
folderTemplates: defineTable({
  // ... existing fields
})
  .index("by_projectType", ["projectTypeId"]),
```

---

## ❌ DO NOT

- ❌ Do NOT create orphaned folder templates
- ❌ Do NOT forget to clear draftData on publish
- ❌ Do NOT allow deleting with active projects using this type
- ❌ Do NOT forget index on projectTypeId
- ❌ Do NOT make breaking changes to existing data

---

## Testing Requirements

- [ ] Run `pnpm convex dev` - schema syncs without errors
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Manual test: createWithTemplate creates both entities
- [ ] Manual test: updateWithTemplate updates correctly
- [ ] Manual test: saveDraft stores all fields
- [ ] Manual test: getByProjectTypeId returns correct templates
- [ ] Manual test: deleteProjectType cascades to templates

---

## Files to Create

```
CREATE: convex/functions/projectTypes/mutations/createWithTemplate.ts
CREATE: convex/functions/projectTypes/mutations/updateWithTemplate.ts
CREATE: convex/functions/projectTypes/mutations/saveDraft.ts
CREATE: convex/functions/folderTemplates/queries/getByProjectTypeId.ts
```

## Files to Modify

```
MODIFY: convex/schema.ts
  - Add isDraft, draftData, defaultFolderTemplateId to projectTypes
  - Add by_isDraft index
  - Add by_projectType index to folderTemplates

MODIFY: convex/functions/projectTypes/mutations/deleteProjectType.ts (if exists)
  - Add cascade delete logic
```

---

---

## Tasks/Subtasks

### Backend Infrastructure

- [x] Update `projectTypes` schema with draft and template fields
- [x] Add indexes for draft and category queries
- [x] Add `updatedAt` field to `projectTypes`

### Mutations

- [x] Implement `createWithTemplate` (atomic create)
- [x] Implement `updateWithTemplate` (atomic update)
- [x] Implement `saveDraft` (partial save)
- [x] Update `deleteProjectType` (cascade delete folder templates)

### Queries

- [x] Implement `getById` for project types
- [x] Implement `getByProjectTypeId` for folder templates

---

## Dev Agent Record

### Implementation Plan

- Updated Convex schema to support the new project type-to-template relationship.
- Implemented strongly typed mutations using `folderLevel1Validator`.
- Ensured orphan folder templates are cleaned up during project type deletion.
- Provided foundation for the Project Type Wizard to operate without "any" types.

### Completion Notes

- All backend requirements for Epic 14 foundations are complete.
- Types are regenerated and integrated with the frontend context.

### Files List

- `convex/schema.ts`
- `convex/functions/projectTypes/mutations.ts`
- `convex/functions/projectTypes/queries.ts`
- `convex/functions/folderTemplates/queries.ts`

---

## Status

- **Story Status**: done
- **Acceptance Criteria**: All satisfied (AC1-AC6)
- **Review Status**: ready-for-review
