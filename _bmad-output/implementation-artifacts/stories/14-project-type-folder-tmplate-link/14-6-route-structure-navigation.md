# Story 14.6: Route Structure & Navigation

**Status**: done  
**Points**: 2  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: Story 14.5

---

## User Story

**As a** Developer,  
**I want** to set up the new route structure,  
**So that** the wizard is accessible at the correct URLs.

---

## Acceptance Criteria

### AC1: Create Mode Route

**Given** I navigate to `/settings/project-types/new`  
**When** the page loads  
**Then** I see the Project Type Wizard in create mode

### AC2: Edit Mode Route

**Given** I navigate to `/settings/project-types/{id}`  
**When** the page loads  
**Then** I see the Project Type Wizard in edit mode
**And** data is pre-populated from existing project type

### AC3: Folder Templates List Route

**Given** I navigate to `/settings/project-types/{id}/folder-templates`  
**When** the page loads  
**Then** I see the folder templates list for that project type

### AC4: New Folder Template Route

**Given** I navigate to `/settings/project-types/{id}/folder-templates/new`  
**When** the page loads  
**Then** I see the folder template builder with project type pre-selected

### AC5: Edit Folder Template Route

**Given** I navigate to `/settings/project-types/{id}/folder-templates/{templateId}`  
**When** the page loads  
**Then** I see the folder template builder for that specific template

### AC6: Define Button Navigation

**Given** I am on the project types list  
**When** I click "DEFINE PROJECT TYPE"  
**Then** I am navigated to `/settings/project-types/new`

### AC7: Edit Action Navigation

**Given** I am on the project types list  
**When** I click "Edit" on a project type card  
**Then** I am navigated to `/settings/project-types/{id}`

### AC8: Not Found Handling

**Given** I navigate to a project type ID that doesn't exist  
**When** the page loads  
**Then** I see a 404 "Not Found" message
**And** I can navigate back to the list

---

## Technical Implementation

### Route Files to Create

#### 1. New Project Type Route

```tsx
// src/app/(protected)/@admin/settings/project-types/new/page.tsx
import ProjectTypeWizard from "@/components/modules/admin/project-types/wizard";

export default function NewProjectTypePage() {
  return <ProjectTypeWizard />;
}
```

#### 2. Edit Project Type Route

```tsx
// src/app/(protected)/@admin/settings/project-types/[id]/page.tsx
import { notFound } from "next/navigation";
import ProjectTypeWizard from "@/components/modules/admin/project-types/wizard";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProjectTypePage({ params }: PageProps) {
  const { id } = await params;

  // Validate ID format (basic check)
  if (!id || id.length < 10) {
    notFound();
  }

  return <ProjectTypeWizard projectTypeId={id as Id<"projectTypes">} />;
}
```

#### 3. Folder Templates List Route

```tsx
// src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/page.tsx
import { FolderTemplatesList } from "@/components/modules/admin/project-types/folder-templates";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FolderTemplatesPage({ params }: PageProps) {
  const { id } = await params;
  return <FolderTemplatesList projectTypeId={id as Id<"projectTypes">} />;
}
```

#### 4. New Folder Template Route

```tsx
// src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/new/page.tsx
import { FolderTemplateBuilder } from "@/components/modules/admin/folder-templates/builder";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NewFolderTemplatePage({ params }: PageProps) {
  const { id } = await params;
  return <FolderTemplateBuilder projectTypeId={id as Id<"projectTypes">} />;
}
```

#### 5. Edit Folder Template Route

```tsx
// src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/[templateId]/page.tsx
import { FolderTemplateBuilder } from "@/components/modules/admin/folder-templates/builder";
import type { Id } from "@convex/_generated/dataModel";

interface PageProps {
  params: Promise<{
    id: string;
    templateId: string;
  }>;
}

export default async function EditFolderTemplatePage({ params }: PageProps) {
  const { id, templateId } = await params;
  return (
    <FolderTemplateBuilder
      projectTypeId={id as Id<"projectTypes">}
      templateId={templateId as Id<"folderTemplates">}
    />
  );
}
```

### Update Project Type List

```tsx
// Modify: src/components/modules/admin/project-types/list/project-type-list.tsx

import { useRouter } from "next/navigation";

export function ProjectTypeList() {
  const router = useRouter();

  // Update handleCreate
  const handleCreate = () => {
    router.push("/settings/project-types/new");
  };

  // Update card onClick for edit
  // In ProjectTypeCard, update onEdit to navigate:
  const handleEdit = (type: AdminProjectType) => {
    router.push(`/settings/project-types/${type._id}`);
  };

  // ... rest of component
}
```

### Update Project Type Card

```tsx
// Modify: src/components/modules/admin/project-types/list/project-type-card.tsx

interface ProjectTypeCardProps {
  type: AdminProjectType;
  onEdit: (type: AdminProjectType) => void; // Now navigates instead of opening drawer
  onDelete: (id: string) => Promise<void>;
}

// Add "Manage Templates" action
<DropdownMenuItem
  onClick={() =>
    router.push(`/settings/project-types/${type._id}/folder-templates`)
  }
>
  <FolderTree className="mr-2 h-4 w-4" />
  Manage Templates
</DropdownMenuItem>;
```

---

## Route Structure Summary

```
/settings/project-types                          → List (existing)
/settings/project-types/new                      → Wizard (create) [NEW]
/settings/project-types/{id}                     → Wizard (edit) [NEW]
/settings/project-types/{id}/folder-templates    → Template list [NEW]
/settings/project-types/{id}/folder-templates/new       → New template [NEW]
/settings/project-types/{id}/folder-templates/{tid}     → Edit template [NEW]
```

---

## ❌ DO NOT

- ❌ Do NOT keep the old drawer-based editing
- ❌ Do NOT forget to handle invalid IDs
- ❌ Do NOT break existing list page functionality
- ❌ Do NOT hardcode routes (use constants or helper)

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: /settings/project-types/new loads wizard
- [ ] Manual test: /settings/project-types/{id} loads edit mode
- [ ] Manual test: Invalid ID shows 404
- [ ] Manual test: "DEFINE PROJECT TYPE" button navigates correctly
- [ ] Manual test: Card "Edit" action navigates correctly

---

## Files to Create

```
CREATE: src/app/(protected)/@admin/settings/project-types/new/page.tsx
CREATE: src/app/(protected)/@admin/settings/project-types/[id]/page.tsx
CREATE: src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/page.tsx
CREATE: src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/new/page.tsx
CREATE: src/app/(protected)/@admin/settings/project-types/[id]/folder-templates/[templateId]/page.tsx
```

## Files to Modify

```
MODIFY: src/components/modules/admin/project-types/list/project-type-list.tsx
  - Update handleCreate to router.push
  - Remove drawer-based editing logic

MODIFY: src/components/modules/admin/project-types/list/project-type-card.tsx
  - Add "Manage Templates" action
  - Update edit to navigate instead of callback
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
