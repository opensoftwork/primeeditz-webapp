# Story 23.9: Step 3 Review & Send — Data Integrity & Component Refactoring

**Epic**: Epic 23 - Quotation Sub-Items & Table Format
**Status**: in-progress
**Complexity**: Medium (5 points)
**Created**: 2026-02-25
**Priority**: HIGH — Fixes broken project display, stale data, and dead code in the quotation builder's final review step

---

## 📋 User Story

**As an** Admin creating or editing a quotation,
**I want** the Step 3 Review & Send page to correctly display all project info, properly group line items by the selected projects, and provide accurate data for PDF download and studio sending,
**So that** I can confidently review and finalize a complete, accurate quotation before sending it.

---

## 🔗 Dependencies

- **Depends on**: Story 23.8 (Package → Quotation flow is complete)
- **Depends on**: Story 23.2 (Sub-item CRUD in builder)
- **Related to**: Quotation Builder Context (`quotation-builder-context.tsx`)

---

## 🐛 Problem Analysis

### Root Cause: `mockQuotation` object is incomplete and the `projectIds` pipeline is broken

The Step 3 Review & Send view builds a `mockQuotation: any` object (L100-112 in `index.tsx`) that is passed to multiple shared detail components (`StudioProjectInfo`, `DownloadQuotation`). This object is missing critical fields that these consumer components expect, resulting in broken UI sectors:

#### Gap 1: Missing fields in `mockQuotation`

| Field           | Expected By                               | Status     | Impact                                   |
| --------------- | ----------------------------------------- | ---------- | ---------------------------------------- |
| `studioId`      | `QuotationData` type, `DownloadQuotation` | ❌ MISSING | PDF may not resolve studio name          |
| `projectIds`    | `QuotationData` type, `QuotationDocument` | ❌ MISSING | PDF has no project grouping at all       |
| `endClientName` | `StudioProjectInfo`                       | ❌ MISSING | Always shows "Not Specified"             |
| `projectId`     | `StudioProjectInfo`                       | ❌ MISSING | "Associated Project" block never renders |
| `projectName`   | `StudioProjectInfo`                       | ❌ MISSING | —                                        |
| `projectCode`   | `StudioProjectInfo`                       | ❌ MISSING | —                                        |

#### Gap 2: `formData.step3.projectIds` is never populated from builder steps

- `projectIds` exists in `QuotationFormData.step3` (constants.ts:14) and is initialized as `[]`
- It's only populated when **syncing from an existing DB quotation** (`quotation-builder-context.tsx:218`)
- **No step in the builder UI ever writes to `projectIds`**
- When packages apply line items (`use-quotation-package-logic.ts:67-74`), they set `lineItems` but never set `projectIds`
- The `ProjectSectionItems` component groups items by `item.projectId`, but since packages don't assign `projectId` to line items, all items show under "No Projects Selected" or are ungrouped

#### Gap 3: Duplicate `useQuery` for the same quotation

- `QuotationBuilderProvider` already queries `api.functions.quotations.queries.getQuotation` (context L180-184) and stores the result
- Step 3 queries the **exact same endpoint again** with `savedQuotationId` (index.tsx L75-81)
- Only used for `savedQuotation?.code` and `savedQuotation?.status` in `SendQuotationDrawer` — redundant

#### Gap 4: Stale closure in `setSubmitTrigger`

```tsx
useEffect(() => {
  setSubmitTrigger(handleSaveAsDraft);
  return () => setSubmitTrigger(null);
}, [setSubmitTrigger]); // Missing handleSaveAsDraft dependency!
```

- `handleSaveAsDraft` is not in the dependency array
- The footer "Finalize" button captures a stale closure of `handleSaveAsDraft`

#### Gap 5: `useEffect` dependency is a boolean expression

```tsx
}, [contextProjects === undefined]); // Run once when projects load
```

- Evaluates to `true`/`false` — not a stable React dependency

#### Gap 6: Unused imports

- `LineItemsSection` is imported but never used
- Various icon imports (`Download`, `ShieldAlert`, etc.) were cleaned by refactoring but the unused `LineItemsSection` import remains

#### Gap 7: `formatCurrency` recreated every render

- Defined as a local arrow function with zero state dependencies
- Causes unnecessary re-render of `PricingSummary` (which receives it as a prop)

---

## ✅ Acceptance Criteria

### AC1: Complete quotation data for review components

- [ ] **Given** an admin is on Step 3 with a studio and projects selected
- [ ] **When** the review page renders
- [ ] **Then** the "Studio & Intent" card shows: Studio Name, End Client Name, Project Name(s), and Validity Date
- [ ] **And** `mockQuotation` is replaced with a properly typed `QuotationData` object containing `studioId`, `projectIds`, and `endClientName`

### AC2: Project IDs are derived from line items

- [ ] **Given** line items have been populated (from packages or manually added)
- [ ] **When** Step 3 renders
- [ ] **Then** `projectIds` is computed by extracting unique `projectId` values from `formData.step3.lineItems`
- [ ] **And** this computed list is used for the review display and passed to `DownloadQuotation`

### AC3: PDF Download has correct project grouping

- [ ] **Given** the quotation has line items assigned to multiple projects
- [ ] **When** the admin clicks "Download PDF"
- [ ] **Then** the `QuotationDocument` correctly groups line items by project with section sub-groups
- [ ] **And** the `projectIds` field is properly set in the quotation data passed to `DownloadQuotation`

### AC4: Remove duplicate useQuery

- [ ] **Given** Step 3 previously had its own `useQuery(getQuotation)` call
- [ ] **When** the refactoring is complete
- [ ] **Then** the duplicate query is removed
- [ ] **And** the `code` and `status` for `SendQuotationDrawer` are derived from context or the save response

### AC5: Fix stale closure in setSubmitTrigger

- [ ] **Given** the footer "Finalize" button calls `submitTrigger`
- [ ] **When** the save function or router changes
- [ ] **Then** `setSubmitTrigger` effect re-runs with the latest `handleSaveAsDraft`
- [ ] **And** `handleSaveAsDraft` is included in the `useEffect` dependency array (or wrapped in `useCallback`)

### AC6: Fix auto-expand useEffect dependency

- [ ] **Given** the auto-expand effect uses `contextProjects === undefined` as dependency
- [ ] **When** the refactoring is complete
- [ ] **Then** the dependency is changed to `contextProjects` with a guard inside the effect body

### AC7: Clean up dead code and optimize

- [ ] **Given** the refactored Step 3 component
- [ ] **When** reviewed
- [ ] **Then** unused imports (e.g., `LineItemsSection`) are removed
- [ ] **And** `formatCurrency` is extracted to module level or wrapped in `useCallback`
- [ ] **And** `any` types in `review-header.tsx` props are replaced with proper types (`QuotationData`, `QuotationSection[]`, `Project[]`)

---

## 📝 Tasks / Subtasks

### Task 1: Replace `mockQuotation` with typed `reviewQuotation`

- [x] 1.1 Build a `QuotationData`-typed object using data from context
- [x] 1.2 Include `studioId` from `formData.step1.studioId`
- [x] 1.3 Compute `projectIds` from unique `item.projectId` values in `formData.step3.lineItems`
- [x] 1.4 Derive `endClientName` from the first associated project's `eventName` or from `selectedStudio.name`
- [x] 1.5 Remove the `any` type cast

### Task 2: Fix `StudioProjectInfo` data passing

- [x] 2.1 Pass computed project name/code from context projects to the quotation object
- [x] 2.2 If multiple projects, show the first project's name or a count indicator
- [x] 2.3 Verify "End Client / Identity" field renders correctly

### Task 3: Remove duplicate `useQuery` call

- [x] 3.1 Remove the `savedQuotation` query (L75-81) and `savedQuotationId` state
- [x] 3.2 Use the `quotationId` from context directly
- [x] 3.3 For `SendQuotationDrawer`, derive `code` from the mock/review quotation's code and `status` from `"draft"` (since we're always in builder)

### Task 4: Fix stale closure issues

- [x] 4.1 Wrap `handleSaveAsDraft` in `useCallback` with proper dependencies
- [x] 4.2 Add `handleSaveAsDraft` to the `setSubmitTrigger` effect dependency array
- [x] 4.3 Fix auto-expand effect to use `contextProjects` as dependency with internal guard

### Task 5: Type safety & dead code cleanup

- [x] 5.1 Remove unused `LineItemsSection` import from `index.tsx`
- [x] 5.2 Extract `formatCurrency` to module-level constant (shared with `project-section-items.tsx`)
- [x] 5.3 Replace `any` types in `ReviewHeader` props with `QuotationData`, `QuotationSection[]`, `Project[]`
- [x] 5.4 Remove redundant `code` and `version` props from `ReviewHeader` (read from `quotation` prop instead)

### Task 7: Handle unassigned items in ProjectSectionItems

- [x] 7.1 Add fallback section-only grouping for items without `projectId`
- [x] 7.2 Extract `getSectionColorClasses` helper for DRY section color rendering
- [x] 7.3 Update empty state messaging from "No Projects Selected" to "No Items Added"

### Task 6: Verify end-to-end flow

- [ ] 6.1 Test with single project selected — verify project group renders, PDF groups correctly
- [ ] 6.2 Test with multiple projects selected — verify all projects show as expandable groups
- [ ] 6.3 Test with no projects (package-only items) — verify graceful fallback display
- [ ] 6.4 Test "Send to Studio" flow — saves, opens drawer with correct data
- [ ] 6.5 Test "Finalize" footer button — calls latest save function (not stale)

---

## 📁 File List (Expected Changes)

| File                                               | Change Type | Description                                                               |
| -------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `steps/step3-review-send/index.tsx`                | MODIFY      | Replace mockQuotation, remove duplicate query, fix effects, clean imports |
| `steps/step3-review-send/review-header.tsx`        | MODIFY      | Replace `any` types with proper types, remove redundant props             |
| `steps/shared/project-section-items.tsx`           | MODIFY      | Add fallback section-only view for unassigned items                       |
| `steps/step3-review-send/review-protocol-card.tsx` | NO CHANGE   | Already clean                                                             |
| `builder/constants.ts`                             | NO CHANGE   | `projectIds` field already exists                                         |
| `builder/hooks/use-quotation-mutations.ts`         | NO CHANGE   | Already reads `projectIds` correctly                                      |

---

## 🎯 Definition of Done

- [ ] `mockQuotation` replaced with properly typed `reviewQuotation: QuotationData`
- [ ] `StudioProjectInfo` shows Studio Name, End Client, Project Info, and Validity
- [ ] `DownloadQuotation` receives `projectIds` for correct PDF grouping
- [ ] No duplicate `useQuery` calls
- [ ] No stale closures in `setSubmitTrigger`
- [ ] No unused imports
- [ ] `formatCurrency` extracted to module level
- [ ] `ReviewHeader` uses proper types (no `any`)
- [ ] Multi-project quotation breakdown renders correctly
- [ ] Story marked as `done`

---

## 🔄 Status Updates

| Date       | Status      | Notes                                                      |
| ---------- | ----------- | ---------------------------------------------------------- |
| 2026-02-25 | backlog     | Created from adversarial code review of Step 3 refactoring |
| 2026-02-25 | in-progress | Tasks 1-5, 7 complete. Pending: manual E2E verification    |

---

## 🤖 Dev Agent Record

### Completion Notes

- ✅ **Task 1**: Replaced `mockQuotation: any` with `reviewQuotation: QuotationData` using `useMemo`. Includes `studioId`, derived `projectIds`, `endClientName`, `projectName`, `projectCode`. All computed from context.
- ✅ **Task 2**: `StudioProjectInfo` now receives fully populated quotation object. End Client shows studio/project name correctly.
- ✅ **Task 3**: Removed redundant `useQuery(getQuotation)` and `savedQuotationId` state. `SendQuotationDrawer` uses `quotationId` from context or save result.
- ✅ **Task 4**: All handlers wrapped in `useCallback`. `handleSaveAsDraft` added to `setSubmitTrigger` deps. Auto-expand effect uses `contextProjects` with guard.
- ✅ **Task 5**: Removed `LineItemsSection`, `useQuery`, `api` imports. `formatCurrency` at module level. `ReviewHeader` uses `QuotationData`, `QuotationSection[]`, `Project[]`. Removed `code`/`version` props.
- ✅ **Task 7**: `ProjectSectionItems` now handles items without `projectId` (package items) via section-only grouping. Empty state updated.

### Change Log

| Date       | Change                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| 2026-02-25 | Implemented Tasks 1-5, 7: full refactoring of Step3ReviewSend + ProjectSectionItems |

---

**Previous Story**: 23-8 - Sub-Item Flow: Package → Quotation Auto-Population
**Next Story**: None planned
