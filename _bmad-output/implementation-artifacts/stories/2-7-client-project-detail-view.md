# Story 2.7: Client Project Detail View

Status: backlog

## Story

As a **Client**,
I want to view the full details of a submitted project,
so that I can track its progress and see any quotations or updates.

## Acceptance Criteria

1. **AC-1:** Route `/client/projects/{projectId}` must display project details
2. **AC-2:** Show Project Header with name, code, and status badge
3. **AC-3:** Show Project-Specific Details section (rendered based on type)
4. **AC-4:** Show Reference Files section with file list
5. **AC-5:** Show Description & Notes section
6. **AC-6:** If quotation exists, show "View Quotation" button
7. **AC-7:** Real-time subscription must update status if it changes
8. **AC-8:** Loading state must show skeleton components
9. **AC-9:** Empty states must be shown for sections with no data
10. **AC-10:** Verify client owns the project (authorization)

## Tasks / Subtasks

### Task 1: Create Project Detail Route (AC: 1, 10)

- [ ] 1.1 Create `src/routes/_authed/client/projects/$projectId.tsx`
- [ ] 1.2 Add route guard to verify client role
- [ ] 1.3 Extract `projectId` from route params
- [ ] 1.4 Set up page metadata (title, description)

### Task 2: Convex Query for Project Details (AC: 1, 7, 10)

- [ ] 2.1 Create `getProject` query in `convex/functions/projects/queries.ts`:
  ```typescript
  export const getProject = clientQuery({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
      const project = await ctx.db.get(args.projectId);

      if (!project) {
        throw new Error("Project not found");
      }

      // Verify ownership
      if (project.clientId !== ctx.profile._id) {
        throw new Error("Unauthorized");
      }

      // Get project type details
      const projectType = await ctx.db.get(project.projectTypeId);

      // Get reference files
      const referenceFiles = await ctx.db
        .query("assets")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .filter((q) => q.eq(q.field("folderId"), null)) // Reference files have no folder
        .collect();

      // Get quotation if exists
      const quotation = await ctx.db
        .query("quotations")
        .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
        .first();

      return {
        ...project,
        projectType: projectType?.name,
        referenceFiles,
        quotation,
      };
    },
  });
  ```
- [ ] 2.2 Use `useQuery` hook for real-time updates

### Task 3: Project Header (AC: 2)

- [ ] 3.1 Create `src/components/modules/projects/project-header.tsx`
- [ ] 3.2 Display:
  - Project name (eventName or endClientName)
  - Project code (e.g., "PE-202601-001")
  - Status badge with color coding
- [ ] 3.3 Add breadcrumb: Dashboard > Projects > {Project Name}
- [ ] 3.4 Use consistent styling with dashboard

### Task 4: Project Details Section (AC: 3)

- [ ] 4.1 Create `src/components/modules/projects/project-details-section.tsx`
- [ ] 4.2 Display basic info:
  - Project Type
  - End Client Name
  - Event Name
  - Event Date (formatted)
  - Venue
- [ ] 4.3 Display type-specific details from `typeSpecificDetails` JSON
- [ ] 4.4 Dynamically render fields based on project type
- [ ] 4.5 Format field labels (camelCase → Title Case)

### Task 5: Reference Files Section (AC: 4, 9)

- [ ] 5.1 Create `src/components/modules/projects/reference-files-section.tsx`
- [ ] 5.2 Display uploaded reference files with thumbnails
- [ ] 5.3 Use ImageSlider component for image previews
- [ ] 5.4 Show file count: "X reference files"
- [ ] 5.5 Show empty state if no files: "No reference files uploaded"
- [ ] 5.6 Add download button for each file (optional)

### Task 6: Description Section (AC: 5, 9)

- [ ] 6.1 Create `src/components/modules/projects/description-section.tsx`
- [ ] 6.2 Display:
  - Description (preserve line breaks)
  - Additional Notes (if provided)
  - Preferred Delivery Date (formatted)
- [ ] 6.3 Show empty state if no description

### Task 7: Quotation Section (AC: 6)

- [ ] 7.1 Create `src/components/modules/projects/quotation-section.tsx`
- [ ] 7.2 If quotation exists:
  - Show quotation summary (total amount, status)
  - Add "View Quotation" button → navigate to quotation detail page
- [ ] 7.3 If no quotation:
  - Show "Quotation pending" message
  - Explain: "We're reviewing your request and will send a quotation soon"

### Task 8: Loading & Empty States (AC: 8, 9)

- [ ] 8.1 Create skeleton components for each section
- [ ] 8.2 Show loading state while fetching project data
- [ ] 8.3 Create empty states for:
  - No reference files
  - No quotation
  - No additional notes
- [ ] 8.4 Handle project not found (404 state)

### Task 9: Real-time Updates (AC: 7)

- [ ] 9.1 Use Convex's `useQuery` for automatic real-time updates
- [ ] 9.2 Test: Admin updates project status → client sees update immediately
- [ ] 9.3 Test: Admin creates quotation → "View Quotation" button appears

### Task 10: Layout & Styling (AC: All)

- [ ] 10.1 Use Card components for each section
- [ ] 10.2 Add visual hierarchy (headers, spacing)
- [ ] 10.3 Ensure consistent typography and colors
- [ ] 10.4 Make responsive for mobile and desktop
- [ ] 10.5 Follow design system patterns

### Task 11: Testing & Validation (AC: All)

- [ ] 11.1 Test: Navigate to project detail → page loads
- [ ] 11.2 Test: Project header displays correctly
- [ ] 11.3 Test: All sections display correct data
- [ ] 11.4 Test: Reference files show thumbnails
- [ ] 11.5 Test: Quotation section shows correctly
- [ ] 11.6 Test: Empty states display when appropriate
- [ ] 11.7 Test: Loading skeleton shows while fetching
- [ ] 11.8 Test: Real-time status updates work
- [ ] 11.9 Test: Authorization works (cannot view other clients' projects)
- [ ] 11.10 Test: 404 state for non-existent project

## Dev Notes

### Route Structure

```
/client/projects/{projectId}
  ↓
  Displays full project details
  ↓
  Sections:
  - Header (name, code, status)
  - Project Details (basic + type-specific)
  - Reference Files (thumbnails)
  - Description & Notes
  - Quotation (if exists)
```

### Status Badge Colors (Reuse from Story 2.1)

| Status         | Color  | Meaning                   |
| -------------- | ------ | ------------------------- |
| pending_review | Yellow | Awaiting admin review     |
| quoted         | Blue   | Quotation sent            |
| approved       | Blue   | Client approved quotation |
| in_progress    | Blue   | Work in progress          |
| completed      | Green  | Project completed         |
| cancelled      | Gray   | Project cancelled         |

### Field Label Formatting (Reuse from Story 2.6)

```typescript
const formatFieldLabel = (camelCase: string): string => {
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};
```

### Authorization Pattern

The `clientQuery` wrapper automatically verifies:

1. User is authenticated
2. User has client role
3. Additional check: project.clientId === profile.\_id

### Real-time Updates

Convex's `useQuery` automatically subscribes to changes:

```typescript
const project = useQuery(api.projects.queries.getProject, { projectId });

// When admin updates status in database, this component re-renders automatically
```

### References

- [Story 2.1: Client Dashboard](./2-1-client-dashboard-with-project-listing.md) - Status badges
- [Story 2.6: Review & Submit](./2-6-wizard-step-5-review-submit.md) - Summary sections
- [Architecture: RBAC](../planning-artifacts/architecture/04-implementation-patterns.md#rbac)

## Dependencies

- Story 2.0: Complete (ImageSlider component)
- Story 2.1: Complete (Status badge component)
- shadcn/ui: Card, Badge, Button, Skeleton
- Convex: getProject query
- TanStack Router: useParams

## Definition of Done

- [ ] Project detail route accessible at `/client/projects/{projectId}`
- [ ] Project header displays correctly
- [ ] All detail sections display correct data
- [ ] Reference files show with thumbnails
- [ ] Quotation section shows correctly (if exists)
- [ ] Empty states display appropriately
- [ ] Loading skeleton shows while fetching
- [ ] Real-time status updates work
- [ ] Authorization prevents viewing other clients' projects
- [ ] 404 state for non-existent projects
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
