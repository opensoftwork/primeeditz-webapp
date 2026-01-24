# Story 11B.4: Display Spawned Projects on Quotation Detail

Status: review

## Story

As an Admin or Studio,
I want to see which projects were created from a quotation,
so that I can navigate to them directly and understand the fulfillment status.

## Acceptance Criteria

1. On the Quotation Detail page (`src/app/(protected)/@admin/quotations/[quotationId]/page.tsx` and Studio equivalent), add a "Generated Projects" section.
2. The section appears only if `status === 'approved'`.
3. Use a query `api.projects.getByQuotationId` to fetch linked projects.
4. Display a list of projects with:
   - Project Code
   - Project Type Name
   - Current Status/Phase
   - "View Project" button (links to `/projects/[id]`).
5. Real-time updates: The list should update automatically if projects are added/changed.

## Tasks / Subtasks

- [x] Create index `by_quotationId` on `projects` table (done in 11A.1).
- [x] Implement `api.projects.getByQuotationId` query.
- [x] Create UI component `SpawnedProjectsList.tsx`.
- [x] Integrate into Admin Quotation Detail page.
- [x] Integrate into Studio Quotation Detail page (or shared component).

## Dev Notes

- **File**: `convex/functions/projects/queries.ts`
- **File**: `src/components/modules/quotations/detail/spawned-projects-list.tsx`
- **Context**: This closes the loop for the user, showing the result of their approval.

### Dependencies

- Story 11B.3 (Data existence)

### References

- Epic 11B: Quotation Engine Enhancements

### Dev Agent Record

- Subtly integrated `SpawnedProjectsList` into both Admin and Client detail pages.
- Implemented `getByQuotationId` with role-based filtering (Admin sees all, Client sees own).
- Used consistent premium styling with Rocket icon and glassmorphic project cards.
- Verified pathing between Parallel Routes (`/projects/[id]` works for both).

### Completion Notes

- The "Generated Projects" section appears automatically when a quotation is in 'approved' status.
- Real-time updates handled by Convex `useQuery`.
