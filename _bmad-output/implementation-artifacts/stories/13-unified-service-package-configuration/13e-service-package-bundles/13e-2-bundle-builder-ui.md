# Story 13E.2: Bundle Builder UI

**Status**: planned  
**Points**: 3  
**Epic**: [13E: Service Package Bundles](../../../../planning-artifacts/epics/13e-service-package-bundles.md)  
**Depends On**: Story 13E.1

---

## User Story

**As an** Admin,  
**I want** to create and edit bundles,  
**So that** I can define package combinations for studios.

---

## Acceptance Criteria

### AC1: Route Setup

**Given** an admin user  
**When** they navigate to `/admin/settings/bundles`  
**Then** they see a list of existing bundles

### AC2: Create Bundle Form

**Given** the bundle form  
**When** I fill it out  
**Then** I can set:

- Name (required)
- Description (optional)
- Category (dropdown)
- Package selector (multi-select from active packages)
- Discount type (none / percentage / fixed)
- Discount value (conditional on type)
- Is Active toggle

### AC3: Package Preview

**Given** packages are selected  
**When** viewing the form  
**Then** I see:

- List of selected packages
- Combined original price
- Discount amount
- Final bundle price

### AC4: Edit Bundle

**Given** an existing bundle  
**When** I click "Edit"  
**Then** the form is pre-filled with current values

### AC5: Delete Bundle

**Given** an existing bundle  
**When** I click "Delete"  
**Then** I see a confirmation dialog  
**And** the bundle is removed on confirm

---

## Technical Implementation

### File Structure

```
src/app/(protected)/@admin/settings/bundles/
├── page.tsx                    # List page
├── new/page.tsx               # Create page
└── [id]/
    ├── page.tsx               # Detail view
    └── edit/page.tsx          # Edit page

src/components/modules/admin/bundles/
├── bundle-list.tsx
├── bundle-form.tsx
├── bundle-card.tsx
├── package-selector.tsx
├── bundle-pricing-preview.tsx
├── bundle-list-loading.tsx
├── bundle-list-error.tsx
└── index.ts
```

### Backend Functions

```typescript
// convex/functions/serviceBundles/queries.ts
export const list = adminQuery({ ... })
export const get = adminQuery({ ... })
export const getWithPackages = adminQuery({ ... })

// convex/functions/serviceBundles/mutations.ts
export const create = adminMutation({ ... })
export const update = adminMutation({ ... })
export const toggleActive = adminMutation({ ... })
export const remove = adminMutation({ ... })
```

---

## ❌ DO NOT

- ❌ Do NOT allow creating bundle with 0 packages
- ❌ Do NOT show inactive packages in selector
- ❌ Do NOT store calculated prices (calculate at runtime)

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Create bundle with 3 packages
- [ ] Manual test: Edit existing bundle
- [ ] Manual test: Delete bundle

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
