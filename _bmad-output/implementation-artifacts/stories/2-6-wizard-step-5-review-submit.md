# Story 2.6: Wizard Step 5 — Review & Submit

Status: done

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

- [x] 1.1 Create `src/components/modules/projects/wizard/step-5-review.tsx`
- [x] 1.2 Integrate with wizard container
- [x] 1.3 Add step indicator showing "Step 5 of 5"
- [x] 1.4 Fetch complete draft project data

### Task 2: Step 1 Summary Section (AC: 3)

- [x] 2.1 Create section header: "Project Type & Basic Info"
- [x] 2.2 Display in read-only format:
  - Project Type
  - End Client Name
  - Event Name
  - Event Date (formatted)
  - Venue
- [x] 2.3 Add "Edit" button → navigate to step 1

### Task 3: Step 2 Summary Section (AC: 4)

- [x] 3.1 Create section header: "Project-Specific Details"
- [x] 3.2 Display `typeSpecificDetails` in read-only format
- [x] 3.3 Dynamically render fields based on project type
- [x] 3.4 Format field labels (camelCase → Title Case)
- [x] 3.5 Add "Edit" button → navigate to step 2

### Task 4: Step 3 Summary Section (AC: 5)

- [x] 4.1 Create section header: "Reference Files"
- [x] 4.2 Display uploaded files with thumbnails
- [x] 4.3 Show file count: "X files uploaded"
- [x] 4.4 Use ImageSlider component for image previews
- [x] 4.5 Show "No files uploaded" if empty
- [x] 4.6 Add "Edit" button → navigate to step 3

### Task 5: Step 4 Summary Section (AC: 6)

- [x] 5.1 Create section header: "Description & Notes"
- [x] 5.2 Display in read-only format:
  - Description (preserve line breaks)
  - Additional Notes (if provided)
  - Preferred Delivery Date (formatted)
- [x] 5.3 Add "Edit" button → navigate to step 4

### Task 6: Submit Functionality (AC: 8, 9, 10)

- [x] 6.1 Create Convex mutation `submitProject`
- [x] 6.2 Add "Submit Request" button (prominent, primary color)
- [x] 6.3 Show loading state during submission
- [x] 6.4 On success: Show toast notification
- [x] 6.5 On success: Redirect to project detail page
- [x] 6.6 Handle errors gracefully

### Task 7: Navigation (AC: 7)

- [x] 7.1 Add "Back" button → navigate to step 4
- [x] 7.2 Each section's "Edit" button navigates to respective step
- [x] 7.3 Ensure data persists when editing and returning

### Task 8: UI/UX Polish (AC: All)

- [x] 8.1 Use Card components for each section
- [x] 8.2 Add visual hierarchy (headers, spacing)
- [x] 8.3 Format dates nicely (e.g., "January 15, 2026")
- [x] 8.4 Format field labels (camelCase → "Title Case")
- [x] 8.5 Make responsive for mobile and desktop
- [ ] 8.6 Add confirmation dialog before submit (optional) _(NOT DONE)_

### Task 9: Testing & Validation (AC: All)

- [x] 9.1 Test: Navigate to Step 5 → all sections display correctly
- [x] 9.2 Test: Step 1 summary shows all fields
- [x] 9.3 Test: Step 2 summary shows dynamic fields correctly
- [x] 9.4 Test: Step 3 summary shows uploaded files
- [x] 9.5 Test: Step 4 summary shows description and notes
- [x] 9.6 Test: "Edit" buttons navigate to correct steps
- [x] 9.7 Test: "Submit Request" updates status to pending_review
- [x] 9.8 Test: Success toast appears after submission
- [x] 9.9 Test: Redirects to project detail page after submission

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

- [x] Step 5 component created and integrated
- [x] All 4 summary sections display correctly
- [x] "Edit" buttons navigate to correct steps
- [x] "Submit Request" button works
- [x] Status updates from draft to pending_review
- [x] Success toast appears after submission
- [x] Redirects to project detail page
- [x] All data displays in read-only format
- [x] TypeScript compiles clean
- [x] No console errors
- [x] Responsive on mobile and desktop

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro (via Antigravity)

### Completion Notes

**Status: DONE** ✅

**Implementation Date**: 2026-01-07 to 2026-01-08

#### Key Implementation Differences from Original Story:

| Planned              | Implemented                    | Rationale                                                |
| -------------------- | ------------------------------ | -------------------------------------------------------- |
| Simple summary cards | **Premium accordion sections** | Collapsible, animated sections matching studio aesthetic |
| File thumbnails only | **Full ImageSlider preview**   | Clicking any image opens projection viewer               |
| Basic submit button  | **Multi-stage submission**     | Files uploaded → Project submitted → Redirect            |

#### Architectural Enhancements:

1. **Deferred File Upload**: Files from Zustand store uploaded to MinIO via signed URLs only on submission. Metadata saved to project record.

2. **Project Type Enrichment**: Displays project type name by joining with `projectTypes` table.

3. **Dynamic Field Rendering**: Renders `typeSpecificDetails` using field definitions from database.

4. **Submission Flow**:
   - Fetch signed upload URLs for all files
   - Upload files in parallel
   - Call `submitProject` mutation
   - Show success toast
   - Redirect to detail view

### File List

**New Files Created:**

- `src/components/modules/projects/wizard/steps/step-5-review.tsx`
- `convex/functions/storage/actions.ts` (for signed URL generation)
