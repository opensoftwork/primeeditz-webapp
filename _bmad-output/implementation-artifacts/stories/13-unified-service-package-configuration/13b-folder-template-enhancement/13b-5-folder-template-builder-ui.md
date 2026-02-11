# Story 13B.5: Folder Template Builder UI

**Status**: backlog  
**Points**: 3  
**Epic**: [13B: Folder Template Enhancement](../../../../planning-artifacts/epics/13b-folder-template-enhancement.md)  
**Depends On**: Story 13B.1, 13B.4

---

## User Story

**As an** Admin,  
**I want** a visual folder template builder,  
**So that** I can easily create and modify folder structures.

---

## Acceptance Criteria

### AC1: Tree View Display

**Given** an existing folder template  
**When** I open the builder  
**Then** I see a tree view showing the folder hierarchy (max 3 levels)

### AC2: Add Root Folder

**Given** the builder is open  
**When** I click "Add Root Folder"  
**Then** a new Level 1 folder is added to the tree  
**And** I can edit its name and description

### AC3: Add Child Folder

**Given** a Level 1 or Level 2 folder in the tree  
**When** I hover over it  
**Then** an "Add Child" button appears  
**And** clicking it adds a child folder at the next level

### AC4: Level 3 Cannot Have Children

**Given** a Level 3 folder (grandchild)  
**When** I view it in the tree  
**Then** no "Add Child" button is shown  
**And** attempting to add children programmatically is blocked

### AC5: Edit Folder Properties

**Given** any folder in the tree  
**When** I click the edit icon  
**Then** a side drawer opens with:

- Name field (required)
- Description field (optional)
- Required toggle (is upload required?)

### AC6: Delete Folder with Confirmation

**Given** a folder with children  
**When** I click delete  
**Then** a confirmation dialog appears warning about child deletion  
**And** confirming deletes the folder and all children

### AC7: Project Type Selection (Required)

**Given** I'm creating a new template  
**When** I view the builder form  
**Then** Project Type is a required dropdown  
**And** I cannot save without selecting a project type

### AC8: Save Template

**Given** I've built a folder structure  
**When** I click Save  
**Then** the template is saved to the database  
**And** I'm redirected to the template list or detail page

---

## Technical Implementation

### File Structure (MANDATORY)

```
src/components/modules/admin/folder-templates/
├── builder/
│   ├── folder-template-builder.tsx        # Main container
│   ├── folder-template-builder-loading.tsx
│   ├── folder-template-builder-error.tsx
│   ├── folder-tree.tsx                    # Tree component
│   ├── folder-node.tsx                    # Individual tree node
│   ├── folder-editor-drawer.tsx           # Edit folder sheet
│   └── index.ts
└── index.ts
```

### Exports (MANDATORY)

```typescript
// src/components/modules/admin/folder-templates/builder/index.ts
export { FolderTemplateBuilder } from "./folder-template-builder";
export { FolderTemplateBuilderLoading } from "./folder-template-builder-loading";
export { FolderTemplateBuilderError } from "./folder-template-builder-error";
```

### Main Builder Component Structure

```tsx
// folder-template-builder.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FolderTree } from "./folder-tree";
import { FolderEditorDrawer } from "./folder-editor-drawer";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required").max(100),
  projectTypeId: z.string().min(1, "Project type is required"),
  variant: z.string().max(50).optional(),
  description: z.string().max(500).optional(),
  folders: z.array(z.any()), // Complex nested validation
});

export function FolderTemplateBuilder({ templateId }: { templateId?: string }) {
  const projectTypes = useQuery(api.projectTypes.list);
  const createTemplate = useMutation(api.folderTemplates.create);
  const updateTemplate = useMutation(api.folderTemplates.update);

  // Local state for folder tree
  const [folders, setFolders] = useState<FolderLevel1[]>([]);
  const [editingFolder, setEditingFolder] = useState<FolderNode | null>(null);

  // Form setup
  const form = useForm({
    defaultValues: {
      name: "",
      projectTypeId: "",
      variant: "",
      description: "",
      folders: [],
    },
    validators: {
      onSubmit: templateSchema,
    },
    onSubmit: async ({ value }) => {
      if (templateId) {
        await updateTemplate({ id: templateId, ...value, folders });
      } else {
        await createTemplate({ ...value, folders, isActive: true });
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Template identity fields */}
      <form>{/* Name, Project Type, Variant, Description */}</form>

      {/* Folder tree builder */}
      <FolderTree
        folders={folders}
        onAddRoot={() => addRootFolder()}
        onAddChild={(path) => addChildFolder(path)}
        onEdit={(folder) => setEditingFolder(folder)}
        onDelete={(path) => deleteFolder(path)}
      />

      {/* Edit drawer */}
      <FolderEditorDrawer
        folder={editingFolder}
        isOpen={!!editingFolder}
        onClose={() => setEditingFolder(null)}
        onSave={(updated) => updateFolderInTree(updated)}
      />
    </div>
  );
}
```

### Folder Node Component

```tsx
// folder-node.tsx
interface FolderNodeProps {
  folder: FolderLevel1 | FolderLevel2 | FolderLevel3;
  level: 1 | 2 | 3;
  onAddChild?: () => void; // undefined for Level 3
  onEdit: () => void;
  onDelete: () => void;
}

export function FolderNode({
  folder,
  level,
  onAddChild,
  onEdit,
  onDelete,
}: FolderNodeProps) {
  const canHaveChildren = level < 3;

  return (
    <div className={cn("flex items-center gap-2", `pl-${level * 4}`)}>
      <FolderIcon />
      <span>{folder.name}</span>
      {folder.isRequired && <Badge>Required</Badge>}

      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
        {canHaveChildren && (
          <Button size="icon" variant="ghost" onClick={onAddChild}>
            <PlusIcon />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={onEdit}>
          <EditIcon />
        </Button>
        <Button size="icon" variant="ghost" onClick={onDelete}>
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}
```

### Backend Mutations

```typescript
// convex/functions/folderTemplates/mutations.ts

import { adminMutation } from "@/lib/customFunctions";
import { v } from "convex/values";

export const create = adminMutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectTypeId: v.id("projectTypes"),
    variant: v.optional(v.string()),
    folders: v.array(folderLevel1Validator),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("folderTemplates", {
      ...args,
      isDefault: false,
    });
  },
});

export const update = adminMutation({
  args: {
    id: v.id("folderTemplates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    variant: v.optional(v.string()),
    folders: v.optional(v.array(folderLevel1Validator)),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT inline the builder in a route file (keep routes thin)
- ❌ Do NOT skip loading/error components
- ❌ Do NOT allow more than 3 nesting levels in UI
- ❌ Do NOT forget to validate project type is selected

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Create new template with 3-level structure
- [ ] Manual test: Edit existing template
- [ ] Manual test: Verify Level 3 cannot have children

---

## Files to Create

```
CREATE: src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-template-builder-loading.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-template-builder-error.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-tree.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-node.tsx
CREATE: src/components/modules/admin/folder-templates/builder/folder-editor-drawer.tsx
CREATE: src/components/modules/admin/folder-templates/builder/index.ts

CREATE: convex/functions/folderTemplates/mutations.ts
CREATE: convex/functions/folderTemplates/queries.ts
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
