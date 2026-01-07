# Story 2.3: Wizard Step 2 — Project-Specific Details (Dynamic)

Status: backlog

## Story

As a **Client**,
I want to provide details specific to my project type,
so that the studio has the information needed for estimation and planning.

## Acceptance Criteria

1. **AC-1:** Step 2 form must be accessible at `/client/projects/new?step=2`
2. **AC-2:** Form fields must change dynamically based on project type selected in Step 1
3. **AC-3:** All type-specific field configurations must be hardcoded (see table below)
4. **AC-4:** Field values must be stored in `typeSpecificDetails` JSON field
5. **AC-5:** "Back" button must navigate to Step 1 without losing data
6. **AC-6:** "Next" button must navigate to Step 3
7. **AC-7:** Form data must auto-save to draft project
8. **AC-8:** Form must pre-populate with existing data if returning to Step 2

## Dynamic Fields by Project Type

| Project Type                 | Dynamic Fields                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Wedding Album**            | Album count (number), Sheets per album (number), Size (select: 12x18/16x24), Cover type (text)          |
| **Pre-Wedding Album**        | Album count (number), Sheets per album (number), Theme preference (text)                                |
| **Birthday Album**           | Album count (number), Sheets per album (number), Theme (text)                                           |
| **Wedding Photography Edit** | Estimated photo count (number), Number of locations (number), Candid ratio preference (text)            |
| **Wedding Film**             | Duration in minutes (number), Highlights needed? (boolean), Estimated raw footage size (text)           |
| **YouTube Video**            | Target duration (number), Thumbnail needed? (boolean), B-roll available? (boolean), Music source (text) |
| **Instagram Reel**           | Duration (select: 15/30/60s), Platform (text), Music preference (text)                                  |
| **Corporate Event**          | Event type (text), Number of days (number), Expected deliverables (textarea)                            |

## Tasks / Subtasks

### Task 1: Create Step 2 Component (AC: 1)

- [ ] 1.1 Create `src/components/modules/projects/wizard/step-2-project-details.tsx`
- [ ] 1.2 Integrate with wizard container
- [ ] 1.3 Add step indicator showing "Step 2 of 5"
- [ ] 1.4 Get project type from draft project (saved in Step 1)

### Task 2: Define Dynamic Field Configurations (AC: 2, 3)

- [ ] 2.1 Create `src/lib/constants/project-type-fields.ts`:
  ```typescript
  export const PROJECT_TYPE_FIELDS = {
    "wedding-album": [
      {
        name: "albumCount",
        label: "Album Count",
        type: "number",
        required: true,
      },
      {
        name: "sheetsPerAlbum",
        label: "Sheets per Album",
        type: "number",
        required: true,
      },
      {
        name: "size",
        label: "Size",
        type: "select",
        options: ["12x18", "16x24"],
        required: true,
      },
      { name: "coverType", label: "Cover Type", type: "text", required: false },
    ],
    "pre-wedding-album": [
      {
        name: "albumCount",
        label: "Album Count",
        type: "number",
        required: true,
      },
      {
        name: "sheetsPerAlbum",
        label: "Sheets per Album",
        type: "number",
        required: true,
      },
      {
        name: "themePreference",
        label: "Theme Preference",
        type: "text",
        required: false,
      },
    ],
    // ... (continue for all project types)
  } as const;
  ```
- [ ] 2.2 Create TypeScript types for field configurations
- [ ] 2.3 Add validation rules for each field type

### Task 3: Dynamic Form Renderer (AC: 2)

- [ ] 3.1 Create `src/components/modules/projects/wizard/dynamic-form-field.tsx`
- [ ] 3.2 Implement field type rendering:
  - `text` → Input component
  - `number` → Input type="number"
  - `select` → Select component with options
  - `boolean` → Checkbox or Switch
  - `textarea` → Textarea component
- [ ] 3.3 Map project type to field configuration
- [ ] 3.4 Render fields dynamically based on configuration

### Task 4: Form State Management (AC: 4, 7, 8)

- [ ] 4.1 Use TanStack Form with dynamic schema based on project type
- [ ] 4.2 Store all field values in `typeSpecificDetails` object
- [ ] 4.3 Create dynamic Zod schema generator:
  ```typescript
  const createStep2Schema = (projectType: string) => {
    const fields = PROJECT_TYPE_FIELDS[projectType];
    const schemaShape = {};

    fields.forEach((field) => {
      if (field.type === "number") {
        schemaShape[field.name] = field.required
          ? z.number().min(1)
          : z.number().optional();
      }
      // ... handle other types
    });

    return z.object(schemaShape);
  };
  ```
- [ ] 4.4 Pre-populate form with `draftProject.typeSpecificDetails`
- [ ] 4.5 Auto-save on field blur (debounced)

### Task 5: Navigation (AC: 5, 6)

- [ ] 5.1 Add "Back" button → navigate to `?step=1`
- [ ] 5.2 Add "Next" button → validate → save → navigate to `?step=3`
- [ ] 5.3 Ensure data persists when navigating back and forth
- [ ] 5.4 Show unsaved changes warning if navigating away

### Task 6: Validation (AC: 3)

- [ ] 6.1 Validate required fields before allowing "Next"
- [ ] 6.2 Show inline error messages
- [ ] 6.3 Validate number fields (min/max where applicable)
- [ ] 6.4 Disable "Next" button if form is invalid

### Task 7: UI/UX Polish (AC: All)

- [ ] 7.1 Add smooth transition when fields change (if user changes project type in Step 1)
- [ ] 7.2 Add field descriptions/help text
- [ ] 7.3 Ensure consistent spacing and typography
- [ ] 7.4 Make responsive for mobile and desktop
- [ ] 7.5 Add loading state while fetching draft project

### Task 8: Testing & Validation (AC: All)

- [ ] 8.1 Test: Each project type shows correct fields
- [ ] 8.2 Test: Required field validation works
- [ ] 8.3 Test: Auto-save triggers correctly
- [ ] 8.4 Test: "Back" button preserves data
- [ ] 8.5 Test: "Next" button navigates to Step 3
- [ ] 8.6 Test: Returning to Step 2 pre-populates form
- [ ] 8.7 Test: Changing project type in Step 1 updates Step 2 fields
- [ ] 8.8 Test: All field types render correctly (text, number, select, boolean, textarea)

## Dev Notes

### Dynamic Field Configuration Structure

```typescript
interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "boolean" | "textarea";
  options?: string[]; // for select fields
  required: boolean;
  placeholder?: string;
  helpText?: string;
  min?: number; // for number fields
  max?: number; // for number fields
}

type ProjectTypeFields = {
  [key in ProjectType]: FieldConfig[];
};
```

### Dynamic Form Rendering Pattern

```typescript
const Step2ProjectDetails = () => {
  const { projectId } = useSearch();
  const draftProject = useQuery(api.projects.queries.getDraft, { projectId });
  const projectType = draftProject?.projectType;

  const fields = PROJECT_TYPE_FIELDS[projectType] || [];

  return (
    <form>
      {fields.map((field) => (
        <DynamicFormField
          key={field.name}
          config={field}
          value={draftProject?.typeSpecificDetails?.[field.name]}
          onChange={(value) => handleFieldChange(field.name, value)}
        />
      ))}
    </form>
  );
};
```

### Storing Type-Specific Details

All dynamic fields are stored in a single JSON field:

```typescript
// In Convex mutation:
await ctx.db.patch(projectId, {
  typeSpecificDetails: {
    albumCount: 2,
    sheetsPerAlbum: 20,
    size: "12x18",
    coverType: "Hardcover",
  },
  updatedAt: Date.now(),
});
```

### Handling Project Type Changes

If user goes back to Step 1 and changes project type:

- Clear `typeSpecificDetails` field
- Show new fields for new project type
- Warn user that previous Step 2 data will be lost

### References

- [Story 2.0: Wizard Infrastructure](./2-0-wizard-infrastructure-draft-project.md)
- [Story 2.2: Step 1](./2-2-wizard-step-1-project-type-basic-info.md)
- [Epic 2: Client Portal](../planning-artifacts/epics/02-client-portal-request.md)

## Dependencies

- Story 2.0: Complete (wizard infrastructure)
- Story 2.2: Complete (project type selection)
- shadcn/ui: Form, Input, Select, Checkbox, Textarea, Button
- TanStack Form: useForm, zodValidator
- Zod: dynamic schema generation

## Definition of Done

- [ ] Step 2 component created and integrated
- [ ] All 8 project types have field configurations defined
- [ ] Dynamic form renderer works for all field types
- [ ] Form fields change based on selected project type
- [ ] Form validation works for all field types
- [ ] Auto-save to `typeSpecificDetails` works
- [ ] Navigation (Back/Next) preserves data
- [ ] Form pre-populates when returning to Step 2
- [ ] TypeScript compiles clean
- [ ] No console errors
- [ ] Responsive on mobile and desktop

## Dev Agent Record

### Agent Model Used

(To be filled after implementation)

### Completion Notes

(To be filled after implementation)

### File List

(To be filled after implementation)
