# Story 11B.5: [ADMIN] Proposal Creation & Dispatch

Status: ready-for-dev

## Story

As an Admin,
I want to review 'Initiated' requests from Studios and transform them into formal proposals,
so that I can verify technical feasibility and pricing before the Studio commits.

## Acceptance Criteria

1. **Queue Management**: The Quotation List highlights `initiated` requests as high-priority "New Requests".
2. **Review Environment**:
   - Admin opens an `initiated` quotation.
   - Admin can add/remove line items.
   - Admin can adjust rates or add specific project-spawning rules (spawnsProject: true).
3. **Dispatch**:
   - Admin clicks "Send Proposal".
   - Status transitions from `initiated` -> `sent`.
4. **Link Preservation**: The Quote retains the link to the original Studio requester (`clientId`).

## Tasks / Subtasks

- [ ] Implement Admin "Review" view for `initiated` quotations.
- [ ] Add "Send Proposal" action button with confirmation.
- [ ] Ensure `spawnsProject` flags can be toggled during review.

## Technical Notes

- **Page**: `/admin/quotations/[id]`
- **Mutation**: `api.functions.quotations.mutations.sendQuotation`
