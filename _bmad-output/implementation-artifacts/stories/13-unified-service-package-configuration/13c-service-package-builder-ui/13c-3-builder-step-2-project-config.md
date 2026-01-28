# Story 13C.3: Package Builder - Step 2: Project Configuration

**Status**: backlog  
**Points**: 5  
**Epic**: [13C: Service Package Builder UI](../../../../planning-artifacts/epics/13c-service-package-builder-ui.md)  
**Depends On**: Story 13C.2, Epic 13B (folder templates)

---

## User Story

**As an** Admin,  
**I want** to configure what project gets created from this package,  
**So that** I define the delivery structure upfront.

---

## Acceptance Criteria

### AC1: Project Type Selection (Required)

**Given** Step 2 is displayed  
**When** I view the form  
**Then** I see a Project Type dropdown (required)  
**And** the "Next" button is disabled until I select one

### AC2: Folder Template Selection (Required, Filtered)

**Given** I have selected a project type  
**When** I view the Folder Template dropdown  
**Then** it shows ONLY templates for the selected project type  
**And** displays variant labels (e.g., "South Indian Wedding")

### AC3: Folder Preview on Selection

**Given** I select a folder template  
**When** the selection changes  
**Then** a preview panel shows the folder structure as a tree

### AC4: Storage Tier Selection (Optional)

**Given** Step 2 is displayed  
**When** I view the form  
**Then** I see a Storage Tier dropdown (optional)  
**And** each option shows: tier name, GB allocation, and price

### AC5: Visual Preview Panel

**Given** I have made selections  
**When** I view the preview panel  
**Then** I see:

- Selected project type as a badge
- Folder structure tree (collapsible)
- Storage allocation (if selected)

### AC6: Back and Next Navigation

**Given** Step 2 is displayed  
**When** I click "Back"  
**Then** I return to Step 1 with my data preserved

**Given** valid selections made  
**When** I click "Next"  
**Then** I proceed to Step 3 with data saved in context

---

## Technical Implementation

### Step 2 Component

```tsx
// step-2-project-config.tsx
"use client";

import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as z from "zod";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useBuilder } from "./builder-context";
import { FolderPreview } from "./components/folder-preview";
import { StorageSelector } from "./components/storage-selector";

const step2Schema = z.object({
  projectTypeId: z.string().min(1, "Project type is required"),
  folderTemplateId: z.string().min(1, "Folder template is required"),
  defaultStorageTierId: z.string().optional().or(z.literal("")),
});

export function Step2ProjectConfig() {
  const { step2Data, setStep2Data, setCurrentStep } = useBuilder();

  // Queries
  const projectTypes = useQuery(api.projectTypes.list);
  const storageTiers = useQuery(api.storageTiers.list);

  // Watch project type for filtered folder templates
  const [selectedProjectTypeId, setSelectedProjectTypeId] = useState(
    step2Data?.projectTypeId ?? "",
  );

  // Folder templates filtered by project type
  const folderTemplates = useQuery(
    api.folderTemplates.listByProjectType,
    selectedProjectTypeId ? { projectTypeId: selectedProjectTypeId } : "skip",
  );

  // Watch folder template for preview
  const [selectedFolderTemplateId, setSelectedFolderTemplateId] = useState(
    step2Data?.folderTemplateId ?? "",
  );

  const form = useForm({
    defaultValues: {
      projectTypeId: step2Data?.projectTypeId ?? "",
      folderTemplateId: step2Data?.folderTemplateId ?? "",
      defaultStorageTierId: step2Data?.defaultStorageTierId ?? "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: step2Schema,
      onBlur: step2Schema,
    },
    onSubmit: async ({ value }) => {
      setStep2Data({
        projectTypeId: value.projectTypeId,
        folderTemplateId: value.folderTemplateId,
        defaultStorageTierId: value.defaultStorageTierId || undefined,
      });
      setCurrentStep(3);
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Project Type */}
        <form.Field
          name="projectTypeId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Project Type *</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    setSelectedProjectTypeId(value);
                    // Reset folder template when project type changes
                    form.setFieldValue("folderTemplateId", "");
                    setSelectedFolderTemplateId("");
                  }}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes?.map((type) => (
                      <SelectItem key={type._id} value={type._id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  This determines what type of project is created for this
                  package.
                </FieldDescription>
                {isInvalid && (
                  <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                )}
              </Field>
            );
          }}
        />

        {/* Folder Template (filtered by project type) */}
        <form.Field
          name="folderTemplateId"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            const isDisabled = !selectedProjectTypeId;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Folder Structure *</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value);
                    setSelectedFolderTemplateId(value);
                  }}
                  disabled={isDisabled}
                >
                  <SelectTrigger id={field.name} aria-invalid={isInvalid}>
                    <SelectValue
                      placeholder={
                        isDisabled
                          ? "Select a project type first"
                          : "Select folder template"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {folderTemplates?.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name}
                        {template.variant && ` (${template.variant})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription>
                  The folder structure that will be created for projects.
                </FieldDescription>
                {isInvalid && (
                  <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                )}
              </Field>
            );
          }}
        />

        {/* Storage Tier (optional) */}
        <form.Field
          name="defaultStorageTierId"
          children={(field) => (
            <StorageSelector
              tiers={storageTiers ?? []}
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        />

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            ← Back
          </Button>
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.canSubmit]}
            children={([isSubmitting, canSubmit]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Validating..." : "Next: Pricing →"}
              </Button>
            )}
          />
        </div>
      </form>

      {/* Preview Section */}
      <div className="space-y-4">
        <h3 className="font-medium">Preview</h3>

        {/* Project Type Badge */}
        {selectedProjectTypeId && (
          <div>
            <Badge variant="outline">
              {projectTypes?.find((t) => t._id === selectedProjectTypeId)?.name}
            </Badge>
          </div>
        )}

        {/* Folder Preview */}
        <div className="border rounded-lg p-4 bg-muted/50">
          <h4 className="text-sm font-medium mb-2">Folder Structure</h4>
          <FolderPreview templateId={selectedFolderTemplateId} />
        </div>
      </div>
    </div>
  );
}
```

### Folder Preview Component

```tsx
// components/folder-preview.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FolderIcon, ChevronRightIcon, ChevronDownIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface FolderPreviewProps {
  templateId: string | undefined;
}

export function FolderPreview({ templateId }: FolderPreviewProps) {
  const template = useQuery(
    api.folderTemplates.get,
    templateId ? { id: templateId } : "skip",
  );

  if (!templateId) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Select a folder template to preview structure
      </div>
    );
  }

  if (template === undefined) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!template) {
    return <div className="text-sm text-destructive">Template not found</div>;
  }

  return (
    <div className="font-mono text-sm space-y-1">
      {template.folders.map((folder) => (
        <FolderNode key={folder.path} folder={folder} level={0} />
      ))}
    </div>
  );
}

function FolderNode({ folder, level }: { folder: any; level: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 py-0.5 hover:bg-accent/50 rounded cursor-pointer",
        )}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDownIcon className="h-3 w-3" />
          ) : (
            <ChevronRightIcon className="h-3 w-3" />
          )
        ) : (
          <span className="w-3" />
        )}
        <FolderIcon className="h-4 w-4 text-yellow-500" />
        <span>{folder.name}</span>
        {folder.isRequired && <span className="text-xs text-red-500">*</span>}
      </div>

      {isOpen && hasChildren && (
        <div>
          {folder.children.map((child: any) => (
            <FolderNode key={child.path} folder={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Storage Selector Component

```tsx
// components/storage-selector.tsx
interface StorageSelectorProps {
  tiers: Doc<"storageTiers">[];
  value: string;
  onChange: (value: string) => void;
}

export function StorageSelector({
  tiers,
  value,
  onChange,
}: StorageSelectorProps) {
  return (
    <Field>
      <FieldLabel>Default Storage Tier</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select storage tier (optional)" />
        </SelectTrigger>
        <SelectContent>
          {tiers.map((tier) => (
            <SelectItem key={tier._id} value={tier._id}>
              <div className="flex justify-between w-full">
                <span>{tier.name}</span>
                <span className="text-muted-foreground">
                  {tier.storageGB} GB - ₹{tier.price}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>
        Pre-allocate storage for projects using this package.
      </FieldDescription>
    </Field>
  );
}
```

### Backend Query for Folder Templates by Project Type

```typescript
// convex/functions/folderTemplates/queries.ts

export const listByProjectType = adminQuery({
  args: { projectTypeId: v.id("projectTypes") },
  handler: async (ctx, { projectTypeId }) => {
    return await ctx.db
      .query("folderTemplates")
      .withIndex("by_projectTypeId", (q) =>
        q.eq("projectTypeId", projectTypeId),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});
```

---

## ❌ DO NOT

- ❌ Do NOT allow proceeding without project type
- ❌ Do NOT show all folder templates (filter by project type!)
- ❌ Do NOT inline complex preview logic in the form
- ❌ Do NOT forget to reset folder template when project type changes

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Project type required to proceed
- [ ] Manual test: Folder templates filtered by project type
- [ ] Manual test: Folder preview shows hierarchy
- [ ] Manual test: Back button preserves Step 1 data

---

## Files to Create

```
CREATE: src/components/modules/admin/service-packages/builder/step-2-project-config.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/folder-preview.tsx
CREATE: src/components/modules/admin/service-packages/builder/components/storage-selector.tsx

CREATE: convex/functions/folderTemplates/queries.ts (if not exists)
  - Add listByProjectType query
```

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
