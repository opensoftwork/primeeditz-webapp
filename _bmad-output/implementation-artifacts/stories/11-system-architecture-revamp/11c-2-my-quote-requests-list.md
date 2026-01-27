# Story 11C.2: "My Quote Requests" List View

Status: ready-for-dev

## Story

As a Studio,
I want to see all my quote requests and their statuses,
so that I can track which quotes are pending, approved, or rejected by the admin.

## Acceptance Criteria

1. New route `/studio/quotes` (or integrated into dashboard).
2. List displays all quotations where `clientId` matches the current Studio profile.
3. Information shown:
   - Quote Code (e.g., `QT-000001`)
   - End Client Name
   - Package Name
   - Status Badge (using `QuotationStatusBadge`)
   - Last Updated date
4. Clicking a quote row/card navigates to the Quote Detail view.
5. List updates in real-time when Admin changes quote status.

## Tasks / Subtasks

- [ ] Create `/studio/quotes` page.
- [ ] Implement `api.functions.quotations.queries.getMyQuotations` query.
- [ ] Build Studio-facing quotation list component.
- [ ] Ensure `QuotationStatusBadge` supports the `'initiated'` status.

## Technical Notes

- **Query**: `api.functions.quotations.queries.getForClient`
- **Component**: `src/components/modules/studio/quotations/quotation-list.tsx`
