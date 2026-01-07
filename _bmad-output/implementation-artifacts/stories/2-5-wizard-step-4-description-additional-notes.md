# Story 2.5: Wizard Step 4 — Description & Additional Notes

Status: backlog

## Story

As a **Client**,
I want to add a description and any additional notes,
so that I can communicate anything not captured in the structured fields.

## Acceptance Criteria

1. **AC-1:** Step 4 form must be accessible at `/client/projects/new?step=4`
2. **AC-2:** Description field (multiline, required) must be present
3. **AC-3:** Additional Notes field (multiline, optional) must be present
4. **AC-4:** Preferred Delivery Date field (date picker, optional) must be present
5. **AC-5:** Form data must auto-save to draft project
6. **AC-6:** "Back" button must navigate to Step 3
7. **AC-7:** "Next" button must navigate to Step 5 (Review)
8. **AC-8:** Form must pre-populate with existing data if returning to Step 4

## Tasks / Subtasks

### Task 1: Create Step 4 Component (AC: 1)

- [ ] 1.1 Create `src/components/modules/projects/wizard/step-4-description.tsx`
- [ ] 1.2 Integrate with wizard container
- [ ] 1.3 Add step indicator showing "Step 4 of 5"

### Task 2: Description Field (AC: 2)

- [ ] 2.1 Add Textarea component for description
- [ ] 2.2 Label: "Project Description"
- [ ] 2.3 Placeholder: "Describe your project requirements in detail..."
- [ ] 2.4 Make field required (min 20 characters)
- [ ] 2.5 Add character counter (optional, helpful UX)
- [ ] 2.6 Show validation error if too short

### Task 3: Additional Notes Field (AC: 3)

- [ ] 3.1 Add Textarea component for additional notes
- [ ] 3.2 Label: "Additional Notes (Optional)"
- [ ] 3.3 Placeholder: "Any special instructions, preferences, or important details..."
- [ ] 3.4 Make field optional
- [ ] 3.5 Add help text: "Include any specific requirements not covered above"

### Task 4: Preferred Delivery Date (AC: 4)

- [ ] 4.1 Add date picker using shadcn/ui Calendar + Popover
- [ ] 4.2 Label: "Preferred Delivery Date (Optional)"
- [ ] 4.3 Disable past dates (only allow future dates)
- [ ] 4.4 Add help text: "When would you like to receive the final deliverables?"
- [ ] 4.5 Store as Unix timestamp in Convex

### Task 5: Form Validation (AC: 2)

- [ ] 5.1 Create Zod schema for Step 4:
  ```typescript
  const step4Schema = z.object({
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    additionalNotes: z.string().optional(),
    preferredDeliveryDate: z.number().optional(),
  });
  ```
- [ ] 5.2 Integrate with TanStack Form's zodValidator
- [ ] 5.3 Show inline error messages
- [ ] 5.4 Disable "Next" button if form is invalid

### Task 6: Auto-save (AC: 5)

- [ ] 6.1 Use `updateDraft` mutation from Story 2.0
- [ ] 6.2 Debounce auto-save (500ms after last keystroke)
- [ ] 6.3 Show "Saving..." indicator
- [ ] 6.4 Show "Saved" checkmark after successful save

### Task 7: Navigation (AC: 6, 7, 8)

- [ ] 7.1 Add "Back" button → navigate to `?step=3`
- [ ] 7.2 Add "Next" button → validate → save → navigate to `?step=5`
- [ ] 7.3 Pre-populate form fields from draft project on mount
- [ ] 7.4 Ensure data persists when navigating back and forth

### Task 8: UI/UX Polish (AC: All)

- [ ] 8.1 Use consistent spacing and typography
- [ ] 8.2 Add field descriptions/help text
- [ ] 8.3 Ensure textareas are properly sized (min-height)
- [ ] 8.4 Make responsive for mobile and desktop
- [ ] 8.5 Add focus states for inputs

### Task 9: Testing & Validation (AC: All)

- [ ] 9.1 Test: Navigate to Step 4 → form loads
- [ ] 9.2 Test: Description field validation (min 20 chars)
- [ ] 9.3 Test: Additional notes field is optional
- [ ] 9.4 Test: Date picker only allows future dates
- [ ] 9.5 Test: Auto-save triggers on field blur
- [ ] 9.6 Test: "Back" button preserves data
- [ ] 9.7 Test: "Next" button navigates to Step 5
- [ ] 9.8 Test: Returning to Step 4 pre-populates form
- [ ] 9.9 Test: Form is responsive on mobile

## Dev Notes

### Form State Management

```typescript
const form = useForm({
  defaultValues: {
    description: draftProject?.description || "",
    additionalNotes: draftProject?.additionalNotes || "",
    preferredDeliveryDate: draftProject?.preferredDeliveryDate,
  },
  validatorAdapter: zodValidator(),
  validators: {
    onChange: step4Schema,
  },
  onSubmit: async ({ value }) => {
    await updateDraft({ projectId, ...value });
    navigate({ search: { step: 5, projectId } });
  },
});
```

### Textarea Sizing

```css
/* Minimum height for textareas */
.description-textarea {
  min-height: 150px;
}

.notes-textarea {
  min-height: 100px;
}
```

### Character Counter (Optional Enhancement)

```typescript
const [charCount, setCharCount] = useState(0);

<Textarea
  value={description}
  onChange={(e) => {
    setDescription(e.target.value);
    setCharCount(e.target.value.length);
  }}
/>
<p className="text-sm text-muted-foreground">
  {charCount} / 20 minimum characters
</p>
```

### References

- [Story 2.0: Wizard Infrastructure](./2-0-wizard-infrastructure-draft-project.md)
- [Story 2.3: Step 2](./2-3-wizard-step-2-project-specific-details-dynamic.md)

## Dependencies

- Story 2.0: Complete (wizard infrastructure, updateDraft mutation)
- shadcn/ui: Form, Textarea, Calendar, Popover, Button
- TanStack Form: useForm, zodValidator
- Zod: validation schemas

## Definition of Done

- [ ] Step 4 component created and integrated
- [ ] Description field with validation works
- [ ] Additional notes field works (optional)
- [ ] Preferred delivery date picker works
- [ ] Auto-save to draft project works
- [ ] Navigation (Back/Next) preserves data
- [ ] Form pre-populates when returning to Step 4
- [ ] Form validation works
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
