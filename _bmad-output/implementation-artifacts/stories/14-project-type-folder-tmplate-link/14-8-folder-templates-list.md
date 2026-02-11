# Story 14.8: Folder Templates List (Project Type Scoped)

**Status**: done  
**Points**: 2  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: Story 14.6

---

## User Story

**As an** Admin,  
**I want** to view all folder templates for a specific project type,  
**So that** I can manage multiple template variants.

---

## Acceptance Criteria

### AC1: Page Header Shows Project Type

**Given** I navigate to `/settings/project-types/{id}/folder-templates`  
**When** the page loads  
**Then** I see:

- Back button to project types list
- Project type name in header
- "Folder Templates" as page title
- Template count

### AC2: List All Templates

**Given** the page loads  
**When** templates exist for this project type  
**Then** I see all templates in card format:

- Template name
- Variant label (if set)
- Folder count
- Active status badge
- Created/Updated date

### AC3: Add Template Button

**Given** I am viewing the templates list  
**When** I want to add a new template  
**Then** I can click "Add Template" button
**And** I am navigated to `/.../{id}/folder-templates/new`

### AC4: Edit Template Action

**Given** I have templates in the list  
**When** I click "Edit" on a template card  
**Then** I am navigated to `/.../{id}/folder-templates/{templateId}`

### AC5: Delete Template Action

**Given** I have templates in the list  
**When** I click "Delete" on a template card  
**Then** I see a confirmation dialog
**And** I can confirm to delete
**And** the template is removed

### AC6: Default Template Indicator

**Given** a template is linked as the default for the project type  
**When** I view the list  
**Then** it has a "Default" badge
**And** it cannot be deleted (only edited)

### AC7: Empty State

**Given** no additional templates exist (only default)  
**When** I view the list  
**Then** I see empty state message:

- "No additional templates"
- "The default template was created with the project type."
- "Add Template" CTA

### AC8: Breadcrumb Navigation

**Given** I am on the templates list  
**When** I view the breadcrumb  
**Then** I see:

- Settings > Project Types > {Type Name} > Folder Templates

---

## Technical Implementation

### Component Structure

```tsx
// src/components/modules/admin/project-types/folder-templates/index.tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, ArrowLeft, FolderTree, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TemplateCard } from "./template-card";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";

interface FolderTemplatesListProps {
  projectTypeId: Id<"projectTypes">;
}

export function FolderTemplatesList({
  projectTypeId,
}: FolderTemplatesListProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<Id<"folderTemplates"> | null>(null);

  // Queries
  const projectType = useQuery(api.functions.projectTypes.queries.getById, {
    id: projectTypeId,
  });
  const templates = useQuery(
    api.functions.folderTemplates.queries.getByProjectTypeId,
    { projectTypeId },
  );

  // Mutations
  const deleteTemplate = useMutation(
    api.functions.folderTemplates.mutations.deleteFolderTemplate,
  );

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTemplate({ id: deleteId });
      toast.success("Template deleted");
      setDeleteId(null);
    } catch (error) {
      toast.error("Failed to delete template");
    }
  };

  // Loading State
  if (projectType === undefined || templates === undefined) {
    return <FolderTemplatesListLoading />;
  }

  // Not Found
  if (projectType === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white/40">Project type not found</p>
      </div>
    );
  }

  const defaultTemplateId = projectType.defaultFolderTemplateId;

  return (
    <div className="w-full px-6 pt-6 pb-20">
      {/* Header */}
      <div className="mb-10 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
          <Link href="/settings" className="hover:text-white transition-colors">
            Settings
          </Link>
          <span>/</span>
          <Link
            href="/settings/project-types"
            className="hover:text-white transition-colors"
          >
            Project Types
          </Link>
          <span>/</span>
          <span className="text-white">{projectType.name}</span>
          <span>/</span>
          <span className="text-primary">Folder Templates</span>
        </div>

        {/* Title Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="shrink-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 h-11 w-11"
            >
              <Link href="/settings/project-types">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                Folder Templates
              </h1>
              <p className="text-sm text-white/40 font-medium mt-1">
                Manage folder structure variants for{" "}
                <span className="text-white">{projectType.name}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() =>
              router.push(
                `/settings/project-types/${projectTypeId}/folder-templates/new`,
              )
            }
            className="h-12 gap-2 rounded-xl bg-primary px-8 text-[11px] font-black uppercase tracking-widest text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template._id}
              template={template}
              isDefault={template._id === defaultTemplateId}
              onEdit={() =>
                router.push(
                  `/settings/project-types/${projectTypeId}/folder-templates/${template._id}`,
                )
              }
              onDelete={
                template._id !== defaultTemplateId
                  ? () => setDeleteId(template._id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-6">
            <FolderTree className="h-8 w-8 text-white/20" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
            No Additional Templates
          </h3>
          <p className="text-sm text-white/40 mb-6 max-w-md">
            The default template was created with the project type. Add more
            templates for different folder structure variants.
          </p>
          <Button
            onClick={() =>
              router.push(
                `/settings/project-types/${projectTypeId}/folder-templates/new`,
              )
            }
            className="gap-2 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-white uppercase">
              Delete Template?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              This action cannot be undone. The folder template will be
              permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FolderTemplatesListLoading() {
  return (
    <div className="w-full px-6 pt-6">
      <div className="mb-10 space-y-6">
        <Skeleton className="h-4 w-64 bg-white/5" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
            <div>
              <Skeleton className="h-8 w-48 bg-white/5 mb-2" />
              <Skeleton className="h-4 w-64 bg-white/5" />
            </div>
          </div>
          <Skeleton className="h-12 w-40 rounded-xl bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 rounded-3xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}
```

### Template Card Component

```tsx
// src/components/modules/admin/project-types/folder-templates/template-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FolderTree, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  template: {
    _id: string;
    name: string;
    variant?: string;
    folders: any[];
    isActive: boolean;
  };
  isDefault: boolean;
  onEdit: () => void;
  onDelete?: () => void;
}

export function TemplateCard({
  template,
  isDefault,
  onEdit,
  onDelete,
}: TemplateCardProps) {
  const folderCount = countFolders(template.folders);

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-zinc-900/50 border-white/5 rounded-3xl transition-all hover:border-white/10 group",
        isDefault && "border-primary/30 bg-primary/5",
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between p-6">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-2 rounded-xl",
              isDefault ? "bg-primary/20" : "bg-white/5",
            )}
          >
            <FolderTree
              className={cn(
                "h-5 w-5",
                isDefault ? "text-primary" : "text-white/40",
              )}
            />
          </div>
          <div>
            <CardTitle className="text-base font-black uppercase tracking-widest text-white">
              {template.name}
            </CardTitle>
            {template.variant && (
              <p className="text-[10px] text-white/40 font-bold uppercase mt-0.5">
                {template.variant}
              </p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-zinc-900 border-white/10"
          >
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-400 focus:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-6 pt-0 space-y-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-white">{folderCount}</p>
            <p className="text-[9px] uppercase tracking-widest text-white/40">
              Folders
            </p>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex-1 flex items-center gap-2">
            {isDefault && (
              <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px]">
                Default
              </Badge>
            )}
            {template.isActive ? (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                Active
              </Badge>
            ) : (
              <Badge className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30 text-[9px]">
                Inactive
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function countFolders(folders: any[]): number {
  let count = folders.length;
  folders.forEach((f) => {
    if (f.children) {
      count += countFolders(f.children);
    }
  });
  return count;
}
```

---

## ❌ DO NOT

- ❌ Do NOT allow deleting the default template
- ❌ Do NOT show templates from other project types
- ❌ Do NOT forget loading states
- ❌ Do NOT skip delete confirmation
- ❌ Do NOT break breadcrumb navigation

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: List shows all templates for project type
- [ ] Manual test: Default template has badge and no delete option
- [ ] Manual test: Add Template navigates correctly
- [ ] Manual test: Edit action works
- [ ] Manual test: Delete with confirmation works
- [ ] Manual test: Empty state displays correctly

---

## Files to Create

```
CREATE: src/components/modules/admin/project-types/folder-templates/index.tsx
CREATE: src/components/modules/admin/project-types/folder-templates/template-card.tsx
CREATE: src/components/modules/admin/project-types/folder-templates/template-list.tsx (optional, can combine)
```

---

## Dev Agent Record

### Agent Model Used

Claude (Anthropic)

### Completion Notes

Implemented the Folder Templates List page for project type scoped template management. Key features:

1. **Breadcrumb Navigation** - Full path: Settings > Project Types > {Type Name} > Folder Templates
2. **Template Count** - Displayed in header subtitle alongside project type name
3. **TemplateCard Component** - New dedicated component with:
   - Default template badge (primary color styling)
   - Active/Inactive status badges
   - Folder count display
   - Variant label support
   - Created date display
   - Conditional delete action (disabled for default templates per AC6)
4. **Empty State** - Custom messaging for when only default template exists
5. **Delete Confirmation** - AlertDialog with proper styling

All acceptance criteria satisfied. Pre-existing TypeScript errors in quotation-related files were not addressed as they are outside story scope.

### Files Changed

- `CREATE: src/components/modules/admin/project-types/folder-templates/template-card.tsx`
- `MODIFY: src/components/modules/admin/project-types/folder-templates/index.tsx`
