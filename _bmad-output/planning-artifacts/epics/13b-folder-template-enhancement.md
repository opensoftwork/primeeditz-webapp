# Epic 13B: Folder Template Enhancement

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Updated**: 2026-01-28  
**Complexity**: Medium  
**Estimated Points**: 13

---

## 📋 Epic Summary

This epic enhances folder templates to support:

1. **Hierarchical structures**: Depth-limited (max 3 levels) - NOT recursive
2. **Project-type specific**: Wedding vs YouTube have different structures
3. **Cultural variants**: South Indian Wedding vs Christian Wedding
4. **Folder metadata**: Descriptions, required flags

**Key Constraint**: Convex does NOT support recursive/self-referential validators. We use explicit depth-limited schema.

---

## 🎯 User Outcomes

| Role       | Outcome                                                   |
| :--------- | :-------------------------------------------------------- |
| **Admin**  | Create meaningful folder structures for each service type |
| **Studio** | Clear understanding of what to upload where               |
| **System** | Automatic folder creation with proper nesting             |

---

## 📐 Schema Design (Depth-Limited)

**⚠️ CRITICAL: Convex does NOT support `v.lazy()` or recursive validators!**

Use explicit depth levels:

```typescript
// convex/schema.ts

// Level 3 folder (leaf node - no children)
const folderLevel3Validator = v.object({
  name: v.string(),           // "Close-ups"
  path: v.string(),           // "/Photos/Family/Close-ups"
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
});

// Level 2 folder (can have Level 3 children)
const folderLevel2Validator = v.object({
  name: v.string(),           // "Family"
  path: v.string(),           // "/Photos/Family"
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  children: v.optional(v.array(folderLevel3Validator)),
});

// Level 1 folder (root level, can have Level 2 children)
const folderLevel1Validator = v.object({
  name: v.string(),           // "Photos"
  path: v.string(),           // "/Photos"
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  children: v.optional(v.array(folderLevel2Validator)),
});

folderTemplates: defineTable({
  name: v.string(),
  projectTypeId: v.id("projectTypes"),
  variant: v.optional(v.string()),       // "South Indian", "Christian"
  description: v.optional(v.string()),

  // Max 3 levels of nesting
  folders: v.array(folderLevel1Validator),

  isDefault: v.optional(v.boolean()),
  isActive: v.boolean(),
})
  .index("by_projectTypeId", ["projectTypeId"])
  .index("by_isActive", ["isActive"]),
```

---

## 📝 User Stories

### Story 13B.1: Enhance `folderTemplates` Schema

**Points**: 3

**As a** Developer,  
**I want** folder templates to support 3-level hierarchical structures,  
**So that** we can create organized folder layouts like `/Photos/Family/Close-ups`.

**Acceptance Criteria**:

- [ ] Create 3 validators: `folderLevel3Validator`, `folderLevel2Validator`, `folderLevel1Validator`
- [ ] Each level has: `name`, `path`, `description`, `isRequired`
- [ ] Level 1 and 2 have `children` array (next level down)
- [ ] Level 3 has NO `children` (leaf node)
- [ ] Add `projectTypeId` as required field on `folderTemplates`
- [ ] Add `variant` optional field
- [ ] Run `pnpm convex dev` to validate

**Technical Pattern**:

- **File**: `convex/schema.ts`
- **Pattern**: Define validators bottom-up (Level 3 first, then Level 2, then Level 1)

**⚠️ CRITICAL**:

```typescript
// ❌ WILL NOT COMPILE - Convex doesn't support recursion
const folder = v.object({
  children: v.optional(v.array(v.lazy(() => folder))),
});

// ✅ CORRECT - Explicit depth levels
const level3 = v.object({ name: v.string() });
const level2 = v.object({
  name: v.string(),
  children: v.optional(v.array(level3)),
});
const level1 = v.object({
  name: v.string(),
  children: v.optional(v.array(level2)),
});
```

**❌ DO NOT**:

- Do NOT use `v.lazy()` or any recursive pattern
- Do NOT exceed 3 nesting levels
- Do NOT change `projectTypeId` to optional

**Files to Modify**:

```
MODIFY: convex/schema.ts
  - Add folderLevel3Validator, folderLevel2Validator, folderLevel1Validator
  - Update folderTemplates table to use new structure
  - Ensure projectTypeId is v.id() not v.optional()
```

---

### Story 13B.2: Create Wedding Folder Template Seeds

**Points**: 3

**As a** Developer,  
**I want** pre-built wedding folder templates for different traditions,  
**So that** admins have useful starting points.

**Acceptance Criteria**:

- [ ] Create "South Indian Traditional Wedding" template with structure:

  ```
  /Photos
    /Muhurtham (Required)
    /Vardhaani
    /Reception
    /Family
    /Couple
  /Video
    /Ceremony
    /Drone
  /Audio
    /Songs
  /Album
    /References
  ```

- [ ] Create "Christian Wedding" template with structure:

  ```
  /Photos
    /Church Ceremony (Required)
    /Reception
    /Couple
    /Bridal Party
    /Family
  /Video
    /Ceremony
    /Reception
  ```

- [ ] Create "North Indian Wedding" template with structure:
  ```
  /Photos
    /Haldi
    /Mehendi
    /Sangeet
    /Baraat
    /Pheras (Required)
    /Reception
  /Video
    /Events
  ```

**Technical Pattern**:

- **File**: `convex/seeds/folderTemplates.ts` (update existing)
- **Pattern**: Use the depth-limited structure

**Seed Data Example**:

```typescript
{
  name: "South Indian Traditional Wedding",
  projectTypeId: weddingPhotoTypeId,
  variant: "South Indian",
  description: "Traditional South Indian wedding folder structure",
  folders: [
    {
      name: "Photos",
      path: "/Photos",
      description: "All photography assets",
      children: [
        { name: "Muhurtham", path: "/Photos/Muhurtham", isRequired: true },
        { name: "Vardhaani", path: "/Photos/Vardhaani" },
        { name: "Reception", path: "/Photos/Reception" },
        { name: "Family", path: "/Photos/Family" },
        { name: "Couple", path: "/Photos/Couple" },
      ],
    },
    {
      name: "Video",
      path: "/Video",
      children: [
        { name: "Ceremony", path: "/Video/Ceremony" },
        { name: "Drone", path: "/Video/Drone" },
      ],
    },
    // ... more
  ],
  isActive: true,
}
```

**Files to Create/Modify**:

```
MODIFY: convex/seeds/folderTemplates.ts
  - Replace flat array seeds with hierarchical structure
  - Add 3 wedding variants
```

---

### Story 13B.3: Create Content Creator Folder Template Seeds

**Points**: 2

**As a** Developer,  
**I want** folder templates for content creation projects,  
**So that** YouTube/reels editors have organized structures.

**Acceptance Criteria**:

- [ ] Create "YouTube Long-Form Video" template:

  ```
  /Raw Footage
    /A-Roll (Required)
    /B-Roll
  /Graphics
    /Thumbnails
    /Lower Thirds
  /Audio
    /Voiceover
    /Background Music
  /Scripts
  /Brand Assets
  ```

- [ ] Create "YouTube Shorts / Reels" template:

  ```
  /Clips (Required)
  /Audio
  /Captions
  ```

- [ ] Create "Album Design Only" template:
  ```
  /Photos
    /Selected (Required)
  /References
    /Design Style
    /Layout Preferences
  ```

**Files to Modify**:

```
MODIFY: convex/seeds/folderTemplates.ts
  - Add YouTube and Album templates
```

---

### Story 13B.4: Update Folder Setup Mutation

**Points**: 2

**As a** Developer,  
**I want** the folder setup mutation to handle hierarchical templates,  
**So that** nested folders are created correctly.

**Acceptance Criteria**:

- [ ] Update `setupFoldersInternal` to recursively create folders
- [ ] Process Level 1 folders first, then Level 2, then Level 3
- [ ] Each folder record has: `name`, `path`, `projectId`, `description`, `isRequired`
- [ ] Parent folders created before children

**Technical Pattern**:

- **File**: `convex/functions/folders/mutations.ts`
- **Auth Wrapper**: Internal function (called from spawning)

**Implementation**:

```typescript
// convex/functions/folders/mutations.ts

async function createFoldersRecursively(
  ctx: MutationCtx,
  projectId: Id<"projects">,
  folders: FolderLevel1[],
  parentPath: string = "",
) {
  for (const folder of folders) {
    // Create this folder
    await ctx.db.insert("folders", {
      projectId,
      name: folder.name,
      path: folder.path,
      description: folder.description,
      isRequired: folder.isRequired ?? false,
      status: "empty",
    });

    // Create children (Level 2)
    if (folder.children) {
      for (const child of folder.children) {
        await ctx.db.insert("folders", {
          projectId,
          name: child.name,
          path: child.path,
          description: child.description,
          isRequired: child.isRequired ?? false,
          status: "empty",
        });

        // Create grandchildren (Level 3)
        if (child.children) {
          for (const grandchild of child.children) {
            await ctx.db.insert("folders", {
              projectId,
              name: grandchild.name,
              path: grandchild.path,
              description: grandchild.description,
              isRequired: grandchild.isRequired ?? false,
              status: "empty",
            });
          }
        }
      }
    }
  }
}

export const setupFoldersInternal = internalMutation({
  args: {
    projectId: v.id("projects"),
    folderTemplateId: v.id("folderTemplates"),
  },
  handler: async (ctx, { projectId, folderTemplateId }) => {
    const template = await ctx.db.get(folderTemplateId);
    if (!template) throw new Error("Folder template not found");

    await createFoldersRecursively(ctx, projectId, template.folders);
  },
});
```

**❌ DO NOT**:

- Do NOT use true recursion that exceeds 3 levels
- Do NOT skip parent folder creation

**Files to Modify**:

```
MODIFY: convex/functions/folders/mutations.ts
  - Rewrite setupFoldersInternal for hierarchical structure
```

---

### Story 13B.5: Folder Template Builder UI

**Points**: 3

**As an** Admin,  
**I want** a visual folder template builder,  
**So that** I can easily create and modify folder structures.

**Acceptance Criteria**:

- [ ] Tree view showing folder hierarchy (max 3 levels)
- [ ] Add root folder button
- [ ] Add child folder button (appears on hover, disabled at Level 3)
- [ ] Edit folder: name, description, isRequired toggle
- [ ] Delete folder (with confirmation for folders with children)
- [ ] Project type selector (required)
- [ ] Variant name input (optional)
- [ ] Save button

**Technical Pattern**:

- **Module Location**: `src/components/modules/admin/folder-templates/builder/`
- **Form**: TanStack Form + Zod
- **Auth Route**: Admin only

**File Structure (MANDATORY)**:

```
src/components/modules/admin/folder-templates/
├── builder/
│   ├── folder-template-builder.tsx        # Container
│   ├── folder-template-builder-loading.tsx
│   ├── folder-template-builder-error.tsx
│   ├── folder-tree.tsx                    # Tree component
│   ├── folder-node.tsx                    # Individual node
│   ├── folder-editor-drawer.tsx           # Edit folder sheet
│   └── index.ts
└── index.ts
```

**Exports (MANDATORY)**:

```typescript
// src/components/modules/admin/folder-templates/builder/index.ts
export { FolderTemplateBuilder } from "./folder-template-builder";
export { FolderTemplateBuilderLoading } from "./folder-template-builder-loading";
export { FolderTemplateBuilderError } from "./folder-template-builder-error";
```

**Form Schema**:

```typescript
import * as z from "zod";

const folderSchema = z.object({
  name: z.string().min(1, "Folder name is required").max(50),
  description: z.string().max(200).optional(),
  isRequired: z.boolean().default(false),
});

const templateSchema = z.object({
  name: z.string().min(1).max(100),
  projectTypeId: z.string().min(1, "Project type is required"),
  variant: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  folders: z.array(z.any()), // Complex nested structure
});
```

**❌ DO NOT**:

- Do NOT inline the builder in a route file (keep routes thin)
- Do NOT skip loading/error components
- Do NOT allow more than 3 nesting levels in UI

**Files to Create**:

```
CREATE: src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-template-builder-loading.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-template-builder-error.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-tree.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-node.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-editor-drawer.tsx
CREATE: src/components/modules/admin/folder-templates/builder/index.ts
```

---

## ✅ Definition of Done

- [ ] Schema supports 3-level hierarchical folders (no recursion!)
- [ ] Wedding templates created for 3 traditions
- [ ] Content creator templates created
- [ ] Folder creation handles nesting correctly
- [ ] Builder UI allows visual template creation
- [ ] `pnpm convex dev` runs without errors
- [ ] `pnpm tsc` has no type errors
- [ ] Level 3 folders cannot have children (UI enforced)

---

## 🧪 Testing Requirements

- [ ] Schema compiles: `pnpm convex dev --once`
- [ ] Types pass: `pnpm tsc --noEmit`
- [ ] Seed all templates: Run seed function
- [ ] Manual test: Create project, verify all nested folders created
- [ ] Manual test: UI prevents 4th level nesting

---

## 🔗 Dependencies

| Depends On   | Notes                                    |
| :----------- | :--------------------------------------- |
| **Epic 13A** | `servicePackages` table must exist first |

| Blocks       | Notes                                  |
| :----------- | :------------------------------------- |
| **Epic 13C** | Package builder needs folder templates |

---

_Document Version: 2.0_  
_Last Updated: 2026-01-28 12:40 IST_
