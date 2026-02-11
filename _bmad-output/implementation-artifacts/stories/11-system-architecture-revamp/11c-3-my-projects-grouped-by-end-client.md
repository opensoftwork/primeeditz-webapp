# Story 11C.3: "My Projects" Grouped by End Client

Status: ready-for-dev

## Story

As a Studio,
I want to see my projects organized by End Client name,
so that I can quickly find all production work related to a specific customer event.

## Acceptance Criteria

1. On the "My Projects" page, projects are grouped by the `endClientName`.
2. Each group has a header with the End Client Name and a project count.
3. Projects within the group show:
   - Code
   - Type
   - Action State (Onboarding, WIP, etc.)
   - "Finish Onboarding" CTA if project is in `awaiting_uploads` state.
4. If no projects exist, show an empty state with a "Request Quote" CTA.

## Tasks / Subtasks

- [ ] Refactor Studio Projects query to support grouping.
- [ ] Update `ProjectCard` or list view to handle grouped rendering.
- [ ] Add conditional CTA for "Onboarding Needed" projects.

## Technical Notes

- **Query**: `api.functions.projects.queries.getForStudioGrouped` (or client-side grouping)
- **Component**: `src/components/modules/studio/projects/grouped-project-list.tsx`
