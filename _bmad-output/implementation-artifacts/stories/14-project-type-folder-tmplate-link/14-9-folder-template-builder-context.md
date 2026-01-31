# Story 14.9: Folder Template Builder (Project Type Context)

**Status**: done  
**Points**: 2  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: Story 14.8

---

## User Story

**As an** Admin,  
**I want** to create additional folder templates for a project type,  
**So that** I can offer template variants (e.g., "Minimal", "Full Coverage").

---

## Acceptance Criteria

### AC1: Project Type Auto-Selected

**Given** I navigate to `/settings/project-types/{id}/folder-templates/new`  
**When** the builder loads  
**Then** the project type is automatically set from the URL
**And** the project type selector is NOT shown

### AC2: Breadcrumb Navigation

**Given** I am in the builder  
**When** I view the header  
**Then** I see breadcrumb:

- Project Types > {Type Name} > Folder Templates > New

### AC3: Template Name & Variant

**Given** I am creating a new template  
**When** I view the form  
**Then** I can enter:

- Template name (required)
- Variant label (optional, e.g., "Premium", "Standard")
- Description (optional)

### AC4: Folder Hierarchy Builder

**Given** the builder loads  
**When** I view the main content  
**Then** I see the FolderTree component
**And** I can build the folder structure

### AC5: Save Navigation

**Given** I complete the template  
**When** I click "Save Changes"  
**Then** the template is created
**And** I am navigated to `/settings/project-types/{id}/folder-templates`
**And** I see success toast

### AC6: Cancel Navigation

**Given** I am in the builder  
**When** I click "Cancel" or back button  
**Then** I am navigated to `/settings/project-types/{id}/folder-templates`

### AC7: Edit Mode

**Given** I navigate to `/.../{id}/folder-templates/{templateId}`  
**When** the builder loads  
**Then** the existing template data is loaded
**And** I can modify and save changes

### AC8: Validation

**Given** I try to save without a name  
**When** I click save  
**Then** I see validation error: "Template name is required"

**Given** I try to save with 0 folders  
**When** I click save  
**Then** I see validation error: "At least one folder is required"

---

## Technical Implementation

### Update FolderTemplateBuilder Props

```tsx
// folder-template-builder.tsx - Update to accept projectTypeId prop

interface FolderTemplateBuilderProps {
  templateId?: Id<"folderTemplates">;
  projectTypeId?: Id<"projectTypes">; // NEW: Pre-set project type
}

export function FolderTemplateBuilder({
  templateId,
  projectTypeId: propProjectTypeId, // From URL param
}: FolderTemplateBuilderProps) {
  const router = useRouter();
  const isProjectTypeContext = !!propProjectTypeId;

  // Queries
  const projectTypes = useQuery(api.functions.projectTypes.queries.list) || [];
  const existingTemplate = useQuery(
    api.functions.folderTemplates.queries.get,
    templateId ? { id: templateId } : "skip",
  );
  const parentProjectType = useQuery(
    api.functions.projectTypes.queries.getById,
    propProjectTypeId ? { id: propProjectTypeId } : "skip",
  );

  // Form setup - use propProjectTypeId if available
  const form = useForm({
    defaultValues: {
      name: existingTemplate?.name || "",
      projectTypeId: propProjectTypeId || existingTemplate?.projectTypeId || "",
      variant: existingTemplate?.variant || "",
      description: existingTemplate?.description || "",
    },
    // ... validators
    onSubmit: async ({ value }) => {
      try {
        if (folders.length === 0) {
          toast.error("At least one folder is required");
          return;
        }

        const data = {
          ...value,
          projectTypeId: (propProjectTypeId ||
            value.projectTypeId) as Id<"projectTypes">,
          folders,
          isActive: existingTemplate?.isActive ?? true,
        };

        if (templateId) {
          await updateTemplate({ id: templateId, ...data });
          toast.success("Template updated");
        } else {
          await createTemplate(data);
          toast.success("Template created");
        }

        // Navigate back to project type context if applicable
        if (isProjectTypeContext) {
          router.push(
            `/settings/project-types/${propProjectTypeId}/folder-templates`,
          );
        } else {
          router.push("/settings/folder-templates");
        }
      } catch (error) {
        toast.error("Failed to save template");
      }
    },
  });

  return (
    <div className="w-full space-y-12 pb-32 font-geist px-10 pt-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/5">
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="shrink-0 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 h-11 w-11"
          >
            <Link
              href={
                isProjectTypeContext
                  ? `/settings/project-types/${propProjectTypeId}/folder-templates`
                  : "/settings/folder-templates"
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1 min-w-0">
            {/* Breadcrumb when in project type context */}
            {isProjectTypeContext && parentProjectType && (
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">
                <Link
                  href="/settings/project-types"
                  className="hover:text-white"
                >
                  Project Types
                </Link>
                <span>/</span>
                <Link
                  href={`/settings/project-types/${propProjectTypeId}`}
                  className="hover:text-white"
                >
                  {parentProjectType.name}
                </Link>
                <span>/</span>
                <Link
                  href={`/settings/project-types/${propProjectTypeId}/folder-templates`}
                  className="hover:text-white"
                >
                  Templates
                </Link>
                <span>/</span>
                <span className="text-primary">
                  {templateId ? "Edit" : "New"}
                </span>
              </div>
            )}
            {/* Template name editing... */}
          </div>
        </div>
        {/* Action buttons... */}
      </div>

      <div className="space-y-8">
        {/* Conditionally show project type selector */}
        {!isProjectTypeContext && (
          <section className="space-y-4">
            {/* Project Type Selector Sheet - existing code */}
          </section>
        )}

        {/* Show locked project type info when in context */}
        {isProjectTypeContext && parentProjectType && (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary/5 border border-primary/20">
            <div className="p-2 rounded-xl bg-primary/10">
              <Tag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Project Type
              </p>
              <p className="text-sm font-bold text-white">
                {parentProjectType.name}
              </p>
            </div>
          </div>
        )}

        {/* Variant Field - NEW */}
        <form.Field name="variant">
          {(field) => (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Variant Label (Optional)
              </Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-14 rounded-2xl"
                placeholder="e.g. Premium, Standard, Minimal"
              />
              <p className="text-[10px] text-white/30">
                Use to distinguish between multiple templates for the same
                project type
              </p>
            </div>
          )}
        </form.Field>

        {/* Folder Hierarchy Section - existing */}
        <section className="space-y-4">{/* FolderTree component... */}</section>
      </div>
    </div>
  );
}
```

### Schema Update for Variant

Ensure `folderTemplates` table has:

```typescript
folderTemplates: defineTable({
  name: v.string(),
  projectTypeId: v.id("projectTypes"),
  variant: v.optional(v.string()), // <-- Ensure this exists
  description: v.optional(v.string()),
  folders: v.array(folderLevel1),
  isActive: v.boolean(),
});
```

---

## ❌ DO NOT

- ❌ Do NOT show project type selector when in project type context
- ❌ Do NOT allow changing project type when in context
- ❌ Do NOT navigate to old /settings/folder-templates when in context
- ❌ Do NOT skip variant field
- ❌ Do NOT break existing standalone builder functionality

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: New template in project type context works
- [ ] Manual test: Project type is locked when in context
- [ ] Manual test: Save navigates back to correct list
- [ ] Manual test: Edit mode loads existing data
- [ ] Manual test: Variant field saves correctly
- [ ] Manual test: Breadcrumb shows correct path

---

## Files to Modify

```
MODIFY: src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx
  - Accept projectTypeId prop
  - Conditionally hide project type selector
  - Add variant field
  - Update navigation paths
  - Add breadcrumb when in context
```

---

## Dev Agent Record

### Agent Model Used

Claude (Anthropic)

### Completion Notes

Updated the FolderTemplateBuilder component to support project type context mode. Key changes:

1. **Project Type Auto-Selection (AC1)** - When `projectTypeId` prop is provided, the project type selector is hidden and the value is locked
2. **Breadcrumb Navigation (AC2)** - Added contextual breadcrumb: Project Types > {Type Name} > Templates > New/Edit
3. **Variant & Description Fields (AC3)** - Added visible UI for variant label field with helpful placeholder text
4. **Locked Project Type Display** - Shows locked project type info banner when in context mode
5. **Contextual Navigation (AC5, AC6)** - Back button and save navigation go to project type context (`/settings/project-types/{id}/folder-templates`)
6. **Validation Messages (AC8)** - Proper error messages for empty name and zero folders
7. **Backwards Compatibility** - Standalone mode (without projectTypeId) still works as before

Pre-existing TypeScript errors in quotation-related files were not addressed as they are outside story scope.

### Files Changed

- `MODIFY: src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx`
