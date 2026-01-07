# Story 2.2: Wizard Step 1 — Project Type & Basic Info

Status: backlog

## Story

As a **Client**,
I want to select a project type and enter basic event information,
so that the studio knows what kind of work I need done.

## Acceptance Criteria

1. **AC-1:** Step 1 form must be accessible within the wizard at `/client/projects/new?step=1`
2. **AC-2:** Project Type dropdown must show hardcoded options (see list below)
3. **AC-3:** Required fields: End Client Name, Event Name
4. **AC-4:** Optional fields: Event Date, Venue
5. **AC-5:** Form validation must prevent proceeding to Step 2 without required fields
6. **AC-6:** Form data must auto-save to draft project on field blur
7. **AC-7:** "Next" button must navigate to Step 2
8. **AC-8:** Form must pre-populate with existing draft data if returning to Step 1

## Project Type Options (Hardcoded for MVP)

- Wedding Album
- Pre-Wedding Album
- Birthday Album
- Wedding Photography Edit
- Wedding Film
- YouTube Video
- Instagram Reel
- Corporate Event

## Tasks / Subtasks

### Task 1: Create Step 1 Component (AC: 1)

- [ ] 1.1 Create `src/components/modules/projects/wizard/step-1-basic-info.tsx`
- [ ] 1.2 Integrate with wizard container from Story 2.0
- [ ] 1.3 Add step indicator showing "Step 1 of 5"
- [ ] 1.4 Set up form with TanStack Form (already configured in Story 2.0)

### Task 2: Project Type Dropdown (AC: 2)

- [ ] 2.1 Create `src/lib/constants/project-types.ts`:
  ```typescript
  export const PROJECT_TYPES = [
    { value: "wedding-album", label: "Wedding Album" },
    { value: "pre-wedding-album", label: "Pre-Wedding Album" },
    { value: "birthday-album", label: "Birthday Album" },
    { value: "wedding-photography-edit", label: "Wedding Photography Edit" },
    { value: "wedding-film", label: "Wedding Film" },
    { value: "youtube-video", label: "YouTube Video" },
    { value: "instagram-reel", label: "Instagram Reel" },
    { value: "corporate-event", label: "Corporate Event" },
  ] as const;
  ```
- [ ] 2.2 Use shadcn/ui Select component for dropdown
- [ ] 2.3 Add placeholder: "Select project type"
- [ ] 2.4 Make field required

### Task 3: Basic Info Form Fields (AC: 3, 4)

- [ ] 3.1 Add "End Client Name" text input (required)
  - Label: "Client Name"
  - Placeholder: "e.g., Priya & Raj"
  - Validation: min 2 characters
- [ ] 3.2 Add "Event Name" text input (required)
  - Label: "Event Name"
  - Placeholder: "e.g., Wedding Ceremony"
  - Validation: min 2 characters
- [ ] 3.3 Add "Event Date" date picker (optional)
  - Label: "Event Date"
  - Use shadcn/ui Calendar + Popover
- [ ] 3.4 Add "Venue" text input (optional)
  - Label: "Venue/Location"
  - Placeholder: "e.g., Grand Ballroom, Mumbai"

### Task 4: Form Validation (AC: 5)

- [ ] 4.1 Create Zod schema for Step 1:
  ```typescript
  const step1Schema = z.object({
    projectType: z.string().min(1, "Project type is required"),
    endClientName: z
      .string()
      .min(2, "Client name must be at least 2 characters"),
    eventName: z.string().min(2, "Event name must be at least 2 characters"),
    eventDate: z.number().optional(),
    venue: z.string().optional(),
  });
  ```
- [ ] 4.2 Integrate with TanStack Form's zodValidator
- [ ] 4.3 Show inline error messages below fields
- [ ] 4.4 Disable "Next" button if form is invalid

### Task 5: Auto-save to Draft (AC: 6)

- [ ] 5.1 Use `updateDraft` mutation from Story 2.0
- [ ] 5.2 Debounce auto-save (500ms after last field change)
- [ ] 5.3 Show "Saving..." indicator during save
- [ ] 5.4 Show "Saved" checkmark after successful save
- [ ] 5.5 Handle save errors gracefully

### Task 6: Navigation (AC: 7, 8)

- [ ] 6.1 Add "Next" button at bottom of form
- [ ] 6.2 On click: Validate form → Save draft → Navigate to `?step=2`
- [ ] 6.3 Pre-populate form fields from draft project on mount
- [ ] 6.4 Use TanStack Router's `useSearch` to get current step
- [ ] 6.5 Add "Back" button to return to dashboard (with unsaved changes warning)

### Task 7: UI/UX Polish (AC: All)

- [ ] 7.1 Use consistent spacing and typography
- [ ] 7.2 Add field descriptions/help text where needed
- [ ] 7.3 Ensure form is keyboard-accessible (tab navigation)
- [ ] 7.4 Add focus states for inputs
- [ ] 7.5 Make responsive for mobile and desktop

### Task 8: Testing & Validation (AC: All)

- [ ] 8.1 Test: Navigate to wizard → Step 1 loads
- [ ] 8.2 Test: Project type dropdown shows all options
- [ ] 8.3 Test: Required field validation works
- [ ] 8.4 Test: Cannot proceed without required fields
- [ ] 8.5 Test: Auto-save triggers on field blur
- [ ] 8.6 Test: "Next" button navigates to Step 2
- [ ] 8.7 Test: Returning to Step 1 pre-populates form
- [ ] 8.8 Test: Date picker works correctly
- [ ] 8.9 Test: Form is responsive on mobile

## Dev Notes

### Form State Management

Use TanStack Form with Zod validation (configured in Story 2.0):

```typescript
const form = useForm({
  defaultValues: {
    projectType: draftProject?.projectType || "",
    endClientName: draftProject?.endClientName || "",
    eventName: draftProject?.eventName || "",
    eventDate: draftProject?.eventDate,
    venue: draftProject?.venue || "",
  },
  validatorAdapter: zodValidator(),
  validators: {
    onChange: step1Schema,
  },
  onSubmit: async ({ value }) => {
    await updateDraft({ projectId, ...value });
    navigate({ search: { step: 2, projectId } });
  },
});
```

### Auto-save Pattern

```typescript
import { useDebouncedCallback } from "use-debounce";

const debouncedSave = useDebouncedCallback(async (fieldName, value) => {
  setIsSaving(true);
  await updateDraft({ projectId, [fieldName]: value });
  setIsSaving(false);
}, 500);

// On field blur:
onBlur: (e) => debouncedSave(fieldName, e.target.value);
```

### Date Handling

Store dates as Unix timestamps (number) in Convex:

```typescript
// Convert Date to timestamp
const timestamp = eventDate ? eventDate.getTime() : undefined;

// Convert timestamp to Date
const date = eventDate ? new Date(eventDate) : undefined;
```

### References

- [Story 2.0: Wizard Infrastructure](./2-0-wizard-infrastructure-draft-project.md) - Wizard setup, form context
- [shadcn/ui Form](https://ui.shadcn.com/docs/components/form)
- [TanStack Form](https://tanstack.com/form/latest)

## Dependencies

- Story 2.0: Complete (wizard infrastructure, draft mutations)
- shadcn/ui: Form, Input, Select, Calendar, Popover, Button
- TanStack Form: useForm, zodValidator
- Zod: validation schemas
- use-debounce: auto-save debouncing

## Definition of Done

- [ ] Step 1 component created and integrated with wizard
- [ ] Project type dropdown shows all hardcoded options
- [ ] All form fields render correctly
- [ ] Required field validation works
- [ ] Auto-save to draft project works
- [ ] "Next" button navigates to Step 2
- [ ] Form pre-populates when returning to Step 1
- [ ] Date picker works correctly
- [ ] Form is responsive
- [ ] TypeScript compiles clean
- [ ] No console errors

## Dev Agent Record

### Agent Model Used

(To be filled after implementation)

### Completion Notes

(To be filled after implementation)

### File List

(To be filled after implementation)
