# Story 11C.1: Quote Request Flow (Replaces Wizard Entry)

Status: ready-for-dev

## Story

As a Studio,
I want to request a quote by selecting a package template,
so that I can quickly get pricing for my end client without needing to set up a full project first.

## Acceptance Criteria

1. On Studio Dashboard, the primary CTA is "Request Quote" (replaces or sits prominently next to legacy project actions).
2. Clicking "Request Quote" opens the `QuoteRequestWizard`:
   - **Step 1**: Select Package Template (displays active templates).
   - **Step 2**: Enter End Client Name (required) and Event Date (optional).
   - **Step 3**: Review selected package and submit.
3. Submitting creates a quotation record in Convex:
   - `status`: `'initiated'`
   - `clientId`: Studio's profile ID
   - `endClientName`: Captured from step 2
   - `lineItems`: Cloned from the selected template
4. User is redirected to the "My Quote Requests" list view with a success notification.

## Tasks / Subtasks

- [ ] Update Studio Dashboard primary CTA to "Request Quote".
- [ ] Implement `QuoteRequestWizard` component using the new 3-step flow.
- [ ] Create `requestQuotation` mutation in Convex.
- [ ] Add success state and redirection logic.

## Technical Notes

- **File**: `src/components/modules/studio/quote-request/quote-request-wizard.tsx`
- **Convex Mutation**: `api.functions.quotations.mutations.requestQuotation`
- **Route**: `/studio/quotes/new`
