# Story 2.1: Client Dashboard with Project Listing

Status: backlog

## Story

As a **Client**,
I want to see a dashboard with all my submitted projects,
so that I can track the status of my work requests at a glance.

## Acceptance Criteria

1. **AC-1:** Route `/client/dashboard` must display client's submitted projects
2. **AC-2:** Each project card must show: Project Name, Project Type, Submission Date, and Status badge
3. **AC-3:** A prominent "Request New Project" button must be visible
4. **AC-4:** Draft projects must NOT appear in the list (only submitted projects with status ≠ 'draft')
5. **AC-5:** Empty state must show for first-time clients with no projects
6. **AC-6:** Status badges must use color coding: Pending (yellow), Active (blue), Completed (green)
7. **AC-7:** Projects must be sorted by submission date (newest first)
8. **AC-8:** Real-time updates via Convex subscription

## Tasks / Subtasks

### Task 1: Create Dashboard Route (AC: 1)

- [ ] 1.1 Create `src/routes/_authed/client/dashboard.tsx`
- [ ] 1.2 Add route guard in `beforeLoad` to verify client role
- [ ] 1.3 Set up page metadata (title, description)
- [ ] 1.4 Create loading state with skeleton components

### Task 2: Convex Query for Projects (AC: 1, 4, 7)

- [ ] 2.1 Create `convex/functions/projects/queries.ts` if not exists
- [ ] 2.2 Implement `getMyProjects` query:
  ```typescript
  export const getMyProjects = clientQuery({
    handler: async (ctx) => {
      const profile = await ctx.profile; // from clientQuery wrapper

      return await ctx.db
        .query("projects")
        .withIndex("by_clientId", (q) => q.eq("clientId", profile._id))
        .filter((q) => q.neq(q.field("status"), "draft"))
        .order("desc")
        .collect();
    },
  });
  ```
- [ ] 2.3 Add computed field for `submittedAt` or use `_creationTime`

### Task 3: Project Card Component (AC: 2, 6)

- [ ] 3.1 Create `src/components/modules/projects/project-card.tsx`
- [ ] 3.2 Display project information:
  - Project name (eventName or endClientName)
  - Project type (from projectTypes table join)
  - Submission date (formatted)
  - Status badge with color coding
- [ ] 3.3 Make card clickable → navigate to `/client/projects/{projectId}`
- [ ] 3.4 Add hover effect for better UX
- [ ] 3.5 Create status badge component with color variants:
  ```typescript
  const statusColors = {
    pending_review: "yellow",
    quoted: "blue",
    approved: "blue",
    in_progress: "blue",
    completed: "green",
    cancelled: "gray",
  };
  ```

### Task 4: Request New Project Button (AC: 3)

- [ ] 4.1 Add prominent CTA button at top of dashboard
- [ ] 4.2 Button text: "Request New Project" with plus icon
- [ ] 4.3 On click: Create draft project via mutation, redirect to wizard
- [ ] 4.4 Use existing `createDraft` mutation from Story 2.0

### Task 5: Empty State (AC: 5)

- [ ] 5.1 Create `src/components/modules/projects/empty-state.tsx`
- [ ] 5.2 Show when projects array is empty
- [ ] 5.3 Display:
  - Illustration or icon
  - Heading: "No projects yet"
  - Description: "Start by requesting your first project"
  - "Request New Project" button
- [ ] 5.4 Use shadcn/ui Card component

### Task 6: Real-time Subscription (AC: 8)

- [ ] 6.1 Use Convex's `useQuery` hook (auto-subscribes)
- [ ] 6.2 Verify live updates when project status changes
- [ ] 6.3 Test: Admin updates project status → client dashboard updates immediately

### Task 7: Layout & Styling (AC: All)

- [ ] 7.1 Use grid layout for project cards (responsive: 1 col mobile, 2-3 cols desktop)
- [ ] 7.2 Add page header with title "My Projects"
- [ ] 7.3 Add loading skeleton matching card layout
- [ ] 7.4 Ensure consistent spacing and typography
- [ ] 7.5 Follow design system from `architecture/06-design-system.md`

### Task 8: Testing & Validation (AC: All)

- [ ] 8.1 Test: Navigate to `/client/dashboard` → projects load
- [ ] 8.2 Test: Empty state shows for new client
- [ ] 8.3 Test: Draft projects do NOT appear
- [ ] 8.4 Test: Submitted projects appear with correct info
- [ ] 8.5 Test: Click project card → navigates to detail view
- [ ] 8.6 Test: Click "Request New Project" → creates draft, redirects to wizard
- [ ] 8.7 Test: Status badges show correct colors
- [ ] 8.8 Test: Real-time update when admin changes status

## Dev Notes

### Route Structure

```
/client/dashboard
  ↓
  Displays list of submitted projects (status ≠ 'draft')
  ↓
  Click project → /client/projects/{projectId}
  Click "Request New Project" → /client/projects/new?projectId={newDraftId}
```

### Project Card Data

```typescript
interface ProjectCardProps {
  project: {
    _id: Id<"projects">;
    code: string;
    eventName?: string;
    endClientName?: string;
    projectType: string; // from join
    status: ProjectStatus;
    _creationTime: number;
  };
}
```

### Status Badge Colors

| Status         | Color  | Tailwind Class                |
| -------------- | ------ | ----------------------------- |
| pending_review | Yellow | bg-yellow-100 text-yellow-800 |
| quoted         | Blue   | bg-blue-100 text-blue-800     |
| approved       | Blue   | bg-blue-100 text-blue-800     |
| in_progress    | Blue   | bg-blue-100 text-blue-800     |
| completed      | Green  | bg-green-100 text-green-800   |
| cancelled      | Gray   | bg-gray-100 text-gray-800     |

### Convex Query Pattern

Use `clientQuery` wrapper from `convex/lib/customFunctions.ts` to automatically:

- Verify user is authenticated
- Get user's profile
- Filter by clientId

### References

- [Story 2.0: Wizard Infrastructure](./2-0-wizard-infrastructure-draft-project.md) - Draft creation mutation
- [Architecture: Project Structure](../planning-artifacts/architecture/05-project-structure.md)
- [Epic 2: Client Portal](../planning-artifacts/epics/02-client-portal-request.md)

## Dependencies

- Story 2.0: Complete (provides `createDraft` mutation)
- shadcn/ui: Card, Badge, Button, Skeleton
- Convex: clientQuery wrapper
- TanStack Router: Link, useNavigate

## Definition of Done

- [ ] Dashboard route accessible at `/client/dashboard`
- [ ] Projects query returns only submitted projects (no drafts)
- [ ] Project cards display all required information
- [ ] Status badges show correct colors
- [ ] "Request New Project" button creates draft and redirects
- [ ] Empty state shows for clients with no projects
- [ ] Real-time updates work via Convex subscription
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
