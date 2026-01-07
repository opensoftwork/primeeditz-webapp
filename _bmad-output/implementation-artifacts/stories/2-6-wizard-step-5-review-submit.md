# Story 2.6: Wizard Step 5 — Review & Submit

Status: backlog

## Story

As a **Client**,
I want to review all my project details before final submission,
so that I can verify accuracy before the studio receives my request.

## Acceptance Criteria

1. **AC-1:** Step 5 must be accessible at `/client/projects/new?step=5`
2. **AC-2:** Display read-only summary of all previous steps
3. **AC-3:** Show Project Type & Basic Info (Step 1)
4. **AC-4:** Show Project-Specific Details (Step 2)
5. **AC-5:** Show Uploaded Reference Files with thumbnails (Step 3)
6. **AC-6:** Show Description & Notes (Step 4)
7. **AC-7:** "Edit" button next to each section to jump back to that step
8. **AC-8:** "Submit Request" button must update status from `draft` → `pending_review`
9. **AC-9:** Show success toast after submission
10. **AC-10:** Redirect to `/client/projects/{projectId}` after submission

## Tasks / Subtasks

### Task 1: Create Step 5 Component (AC: 1)

- [ ] 1.1 Create `src/components/modules/projects/wizard/step-5-review.tsx`
- [ ] 1.2 Integrate with wizard container
- [ ] 1.3 Add step indicator showing "Step 5 of 5"
- [ ] 1.4 Fetch complete draft project data

### Task 2: Step 1 Summary Section (AC: 3)

- [ ] 2.1 Create section header: "Project Type & Basic Info"
- [ ] 2.2 Display in read-only format:
  - Project Type
  - End Client Name
  - Event Name
  - Event Date (formatted)
  - Venue
- [ ] 2.3 Add "Edit" button → navigate to `?step=1`

### Task 3: Step 2 Summary Section (AC: 4)

- [ ] 3.1 Create section header: "Project-Specific Details"
- [ ] 3.2 Display `typeSpecificDetails` in read-only format
- [ ] 3.3 Dynamically render fields based on project type
- [ ] 3.4 Format field labels (camelCase → Title Case)
- [ ] 3.5 Add "Edit" button → navigate to `?step=2`

### Task 4: Step 3 Summary Section (AC: 5)

- [ ] 4.1 Create section header: "Reference Files"
- [ ] 4.2 Display uploaded files with thumbnails
- [ ] 4.3 Show file count: "X files uploaded"
- [ ] 4.4 Use ImageSlider component for image previews
- [ ] 4.5 Show "No files uploaded" if empty
- [ ] 4.6 Add "Edit" button → navigate to `?step=3`

### Task 5: Step 4 Summary Section (AC: 6)

- [ ] 5.1 Create section header: "Description & Notes"
- [ ] 5.2 Display in read-only format:
  - Description (preserve line breaks)
  - Additional Notes (if provided)
  - Preferred Delivery Date (formatted)
- [ ] 5.3 Add "Edit" button → navigate to `?step=4`

### Task 6: Submit Functionality (AC: 8, 9, 10)

- [ ] 6.1 Create Convex mutation `submitProject`:
  ```typescript
  export const submitProject = clientMutation({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
      // Verify ownership
      const project = await ctx.db.get(args.projectId);
      if (project.clientId !== ctx.profile._id) {
        throw new Error("Unauthorized");
      }

      // Update status
      await ctx.db.patch(args.projectId, {
        status: "pending_review",
        submittedAt: Date.now(),
        updatedAt: Date.now(),
      });

      return { success: true };
    },
  });
  ```
- [ ] 6.2 Add "Submit Request" button (prominent, primary color)
- [ ] 6.3 Show loading state during submission
- [ ] 6.4 On success: Show toast notification
- [ ] 6.5 On success: Redirect to project detail page
- [ ] 6.6 Handle errors gracefully

### Task 7: Navigation (AC: 7)

- [ ] 7.1 Add "Back" button → navigate to `?step=4`
- [ ] 7.2 Each section's "Edit" button navigates to respective step
- [ ] 7.3 Ensure data persists when editing and returning

### Task 8: UI/UX Polish (AC: All)

- [ ] 8.1 Use Card components for each section
- [ ] 8.2 Add visual hierarchy (headers, spacing)
- [ ] 8.3 Format dates nicely (e.g., "January 15, 2026")
- [ ] 8.4 Format field labels (camelCase → "Title Case")
- [ ] 8.5 Make responsive for mobile and desktop
- [ ] 8.6 Add confirmation dialog before submit (optional)

### Task 9: Testing & Validation (AC: All)

- [ ] 9.1 Test: Navigate to Step 5 → all sections display correctly
- [ ] 9.2 Test: Step 1 summary shows all fields
- [ ] 9.3 Test: Step 2 summary shows dynamic fields correctly
- [ ] 9.4 Test: Step 3 summary shows uploaded files
- [ ] 9.5 Test: Step 4 summary shows description and notes
- [ ] 9.6 Test: "Edit" buttons navigate to correct steps
- [ ] 9.7 Test: "Submit Request" updates status to pending_review
- [ ] 9.8 Test: Success toast appears after submission
- [ ] 9.9 Test: Redirects to project detail page after submission
- [ ] 9.10 Test: Cannot submit if required fields missing (should not reach Step 5)

## Dev Notes

### Summary Section Component

Create reusable component for summary sections:

```typescript
interface SummarySectionProps {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}

const SummarySection = ({ title, onEdit, children }: SummarySectionProps) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);
```

### Field Label Formatting

```typescript
const formatFieldLabel = (camelCase: string): string => {
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

// Example: "albumCount" → "Album Count"
```

### Date Formatting

```typescript
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "Not specified";
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
```

### Success Toast

```typescript
import { toast } from "sonner";

toast.success("Project submitted successfully!", {
  description: "We'll review your request and get back to you soon.",
});
```

### References

- [Story 2.0: Wizard Infrastructure](./2-0-wizard-infrastructure-draft-project.md)
- [All previous wizard steps](./2-2-wizard-step-1-project-type-basic-info.md)

## Dependencies

- Stories 2.0-2.5: Complete (all wizard steps)
- shadcn/ui: Card, Button, Badge
- Convex: submitProject mutation
- TanStack Router: useNavigate
- sonner: Toast notifications

## Definition of Done

- [ ] Step 5 component created and integrated
- [ ] All 4 summary sections display correctly
- [ ] "Edit" buttons navigate to correct steps
- [ ] "Submit Request" button works
- [ ] Status updates from draft to pending_review
- [ ] Success toast appears after submission
- [ ] Redirects to project detail page
- [ ] All data displays in read-only format
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
