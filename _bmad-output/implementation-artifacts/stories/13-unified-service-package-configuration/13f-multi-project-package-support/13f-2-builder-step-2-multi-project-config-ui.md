# Story 13F.2: Update Builder Step 2 - Multi-Project Config UI

**Status**: done
**Points**: 5
**Epic**: [13F: Multi-Project Package Support](../../../../planning-artifacts/epics/13f-multi-project-package-support.md)  
**Depends On**: 13F.1 (Schema Update)

## Dev Agent Record

- Renamed Step 2 header and description.
- Created `ProjectConfigCard` component for array-based configuration.
- Integrated TanStack Form array mode for project configurations.
- Implemented nanoid for unique project IDs during creation.
- Added logic to filter folder templates by project type in each card.
- Updated Preview panel to show "Spawned Projects" summary.
- Updated Step 4 Review to display all configured projects and save them via mutations.
- Updated mutations `create` and `update` to support `projectConfigs` and `applyGST`.
- Verified UI consistency and validation (min 1 project).
- Verified build check passed for modified files.

---

## User Story

**As an** Admin,  
**I want** to configure multiple project types in Step 2 of the package builder,  
**So that** I can create combo packages like "Complete Wedding" with Photo + Video + Album.

---

## Acceptance Criteria

### AC1: Rename Step 2 Header

**Given** the package builder wizard  
**When** the user navigates to Step 2  
**Then** the header reads "Project Configurations" (plural)

**And** the description explains this step defines what projects get created

### AC2: Display Project Config Cards

**Given** Step 2 is loaded  
**When** there are project configurations defined  
**Then** each config is displayed as a card showing:

- Label input field (e.g., "Photo Editing")
- Project Type selector dropdown
- Folder Template selector (filtered by selected project type)
- Storage Tier selector
- Delete button (X icon) - disabled if only 1 config remains

### AC3: Add Project Configuration Button

**Given** the project configs list  
**When** the user clicks "Add Project Configuration"  
**Then** a new empty config card is added with:

- Auto-generated unique ID (using nanoid)
- Empty label
- Unselected project type
- Unselected folder template
- Unselected storage tier

### AC4: Folder Template Filtering

**Given** a project config card  
**When** the user selects a Project Type  
**Then** the Folder Template dropdown is filtered to show only templates for that project type

**And** if a template was previously selected for a different type, it is cleared

### AC5: Minimum One Config Validation

**Given** the project configs array  
**When** the user tries to proceed to Step 3  
**Then** validation ensures at least 1 project config exists

**And** each config must have: projectTypeId and folderTemplateId

### AC6: Update Builder Context

**Given** the `builder-context.tsx`  
**When** I update the Step2Data interface  
**Then** it matches this structure:

```typescript
export interface Step2Data {
  projectConfigs: {
    id: string;
    label: string;
    projectTypeId: string;
    folderTemplateId: string;
    defaultStorageTierId?: string;
  }[];
}
```

### AC7: Preview Panel

**Given** project configs are defined  
**When** viewing the step  
**Then** a preview panel shows:

- Number of projects that will be created
- List of project types with their labels
- Visual indication of folder templates selected

---

## Technical Implementation

### Files to Modify

```
MODIFY: src/components/modules/admin/service-packages/builder/builder-context.tsx
  - Update Step2Data interface to use projectConfigs array
  - Update default values

MODIFY: src/components/modules/admin/service-packages/builder/step-2-project-config.tsx
  - Complete rewrite to support multiple configs
  - Use TanStack Form array mode for projectConfigs

CREATE: src/components/modules/admin/service-packages/builder/components/project-config-card.tsx
  - Reusable card component for each project config
  - Contains all form fields for a single config
```

### Updated Context Interface

```typescript
// builder-context.tsx

export interface ProjectConfig {
  id: string;
  label: string;
  projectTypeId: string;
  folderTemplateId: string;
  defaultStorageTierId?: string;
}

export interface Step2Data {
  projectConfigs: ProjectConfig[];
}
```

### Form Schema (TanStack Form + Zod)

```typescript
// step-2-project-config.tsx

const projectConfigSchema = z.object({
  id: z.string(),
  label: z.string().max(50),
  projectTypeId: z.string().min(1, "Project type is required"),
  folderTemplateId: z.string().min(1, "Folder template is required"),
  defaultStorageTierId: z.string().optional(),
});

const step2Schema = z.object({
  projectConfigs: z
    .array(projectConfigSchema)
    .min(1, "At least one project configuration is required"),
});
```

### Array Field Usage

```tsx
// step-2-project-config.tsx

<form.Field name="projectConfigs" mode="array">
  {(field) => (
    <>
      {field.state.value.map((config, index) => (
        <ProjectConfigCard
          key={config.id}
          form={form}
          index={index}
          onRemove={() => field.removeValue(index)}
          canRemove={field.state.value.length > 1}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() =>
          field.pushValue({
            id: nanoid(),
            label: "",
            projectTypeId: "",
            folderTemplateId: "",
            defaultStorageTierId: "",
          })
        }
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Project Configuration
      </Button>
    </>
  )}
</form.Field>
```

### Project Config Card Component

```tsx
// components/project-config-card.tsx

interface ProjectConfigCardProps {
  form: FormApi<Step2FormValues>;
  index: number;
  onRemove: () => void;
  canRemove: boolean;
}

export function ProjectConfigCard({
  form,
  index,
  onRemove,
  canRemove,
}: ProjectConfigCardProps) {
  // Get selected project type to filter folder templates
  const projectTypeId = form.useStore(
    (state) => state.values.projectConfigs[index]?.projectTypeId,
  );

  const folderTemplates = useQuery(
    api.functions.folderTemplates.queries.listByProjectType,
    projectTypeId ? { projectTypeId } : "skip",
  );

  return (
    <Card className="relative bg-white/5 border-white/10">
      {/* Delete button */}
      {canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <CardContent className="space-y-4 pt-6">
        {/* Label field */}
        <form.Field name={`projectConfigs[${index}].label`}>
          {(field) => (
            <Field>
              <FieldLabel>Configuration Label</FieldLabel>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g., Photo Editing, Video Editing"
              />
            </Field>
          )}
        </form.Field>

        {/* Project Type selector */}
        <form.Field name={`projectConfigs[${index}].projectTypeId`}>
          {(field) => (
            <Field>
              <FieldLabel>Project Type</FieldLabel>
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  // Clear folder template when project type changes
                  form.setFieldValue(
                    `projectConfigs[${index}].folderTemplateId`,
                    "",
                  );
                }}
              >
                {/* Options from useQuery */}
              </Select>
            </Field>
          )}
        </form.Field>

        {/* Folder Template selector (filtered) */}
        {/* Storage Tier selector */}
      </CardContent>
    </Card>
  );
}
```

---

## UI Mockup

```
┌────────────────────────────────────────────────────────────┐
│ STEP 2: PROJECT CONFIGURATIONS                             │
│ Define what projects will be created when this package     │
│ is selected.                                               │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 📷 CONFIG 1                                    [X]   │   │
│ │                                                      │   │
│ │ Label:           [Photo Editing                    ] │   │
│ │ Project Type:    [Photo Post-Production      ▼     ] │   │
│ │ Folder Template: [Wedding Photos             ▼     ] │   │
│ │ Storage Tier:    [Premium (500GB)            ▼     ] │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 🎬 CONFIG 2                                    [X]   │   │
│ │                                                      │   │
│ │ Label:           [Video Editing                    ] │   │
│ │ Project Type:    [Video Production           ▼     ] │   │
│ │ Folder Template: [Wedding Cinema             ▼     ] │   │
│ │ Storage Tier:    [Enterprise (1TB)           ▼     ] │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                            │
│ [+ Add Project Configuration]                              │
│                                                            │
│ ─────────────────────────────────────────────────────────  │
│ 📋 PREVIEW: This package will create 2 projects            │
│    • Photo Post-Production (Photo Editing)                 │
│    • Video Production (Video Editing)                      │
│                                                            │
│                                         [ Back ] [ Next ]  │
└────────────────────────────────────────────────────────────┘
```

---

## ❌ DO NOT

- ❌ Do NOT allow 0 project configs (minimum 1 required)
- ❌ Do NOT allow duplicate project types in the same package (show warning)
- ❌ Do NOT hardcode project type or folder template options
- ❌ Do NOT break backward compatibility with existing packages that have single projectTypeId
- ❌ Do NOT modify Step 3 (Pricing) in this story - that's 13F.3

---

## Tasks/Subtasks

- [x] **Context Updates**
  - [x] Update `builder-context.tsx` with new Step2Data interface
  - [x] Add ProjectConfig type export
- [x] **Component Implementation**
  - [x] Create `components/project-config-card.tsx`
  - [x] Rewrite `step-2-project-config.tsx` for array mode
  - [x] Implement filtered folder template query
  - [x] Add preview panel showing configured projects
- [x] **Form Validation**
  - [x] Implement Zod schema for projectConfigs array
  - [x] Add minimum 1 config validation
  - [x] Add required field validation per config
- [x] **Styling**
  - [x] Style config cards with proper spacing
  - [x] Add visual distinction between configs
  - [x] Ensure responsive layout (stack on mobile)
- [x] **Validation**
  - [x] Run `pnpm tsc --noEmit` - no TypeScript errors
  - [x] Run `pnpm build` - build succeeds
  - [x] Manual test: Add 3 project configs
  - [x] Manual test: Remove middle config
  - [x] Manual test: Navigate back and forth between steps

---

## Testing Requirements

- [x] Run `pnpm tsc --noEmit` - no TypeScript errors
- [x] Run `pnpm build` - build succeeds
- [x] Manual: Create package with 1 project config (backward compat)
- [x] Manual: Create package with 3 project configs
- [x] Manual: Delete a config, verify minimum 1 enforced
- [x] Manual: Change project type, verify folder templates filter
- [x] Manual: Navigate Step 1 → Step 2 → Step 3 → Step 2, data preserved

---

## Dev Agent Record

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

Successfully implemented the multi-project configuration UI in Step 2.

- Transitioned `BuilderContext` to support a `projectConfigs` array.
- Developed `ProjectConfigCard` for modular configuration management.
- Integrated TanStack Form's array field capabilities for dynamic addition/removal.
- Implemented real-time preview of spawned projects.
- Updated Step 4 (Review) to display and save the multi-project structure.
- Updated database mutations to support the new schema fields.

### Files Changed

- `src/components/modules/admin/service-packages/builder/builder-context.tsx`
- `src/components/modules/admin/service-packages/builder/step-2-project-config.tsx`
- `src/components/modules/admin/service-packages/builder/components/project-config-card.tsx`
- `src/components/modules/admin/service-packages/builder/step-4-review.tsx`
- `convex/functions/servicePackages/mutations.ts`
