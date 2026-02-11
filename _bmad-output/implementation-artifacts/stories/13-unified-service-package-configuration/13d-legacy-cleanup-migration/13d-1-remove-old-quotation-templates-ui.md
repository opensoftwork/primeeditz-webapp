# Story 13D.1: Remove Old Quotation Templates UI

**Status**: done  
**Points**: 2  
**Epic**: [13D: Legacy Cleanup & Migration](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)  
**Depends On**: Epic 13A, 13C complete

---

## User Story

**As a** Developer,  
**I want** to remove the old quotation templates UI,  
**So that** admins only use the new service package builder.

---

## Acceptance Criteria

### AC1: Remove Route

**Given** the old route exists  
**When** I clean up  
**Then** `/admin/settings/quotation-templates` is removed  
**And** navigating there returns 404

### AC2: Remove Old Components

**Given** old UI components exist  
**When** I clean up  
**Then** these are deleted:

- `src/components/modules/admin/quotation-templates/` (entire directory)
- Any related list, form, or detail components

### AC3: Update Navigation

**Given** sidebar navigation exists  
**When** I update it  
**Then** "Quotation Templates" link is REPLACED with "Service Packages"  
**And** points to `/admin/settings/service-packages`

### AC4: Verify No Broken Imports

**Given** files are deleted  
**When** I run `pnpm tsc --noEmit`  
**Then** there are no import errors from deleted components

---

## Technical Implementation

### Files to DELETE

```
DELETE: src/app/(protected)/@admin/settings/quotation-templates/
  - page.tsx
  - [id]/page.tsx
  - new/page.tsx

DELETE: src/components/modules/admin/quotation-templates/
  - (entire directory)
```

### Files to MODIFY

```
MODIFY: src/components/layout/sidebar-nav-items.ts
  - Replace quotation-templates link with service-packages
```

### Navigation Update Example

```typescript
// Before
{
  title: "Quotation Templates",
  href: "/admin/settings/quotation-templates",
  icon: FileTextIcon,
}

// After
{
  title: "Service Packages",
  href: "/admin/settings/service-packages",
  icon: PackageIcon,
}
```

### Search for References First

Before deleting, search for any remaining references:

```bash
# Search for imports
rg "quotation-templates" --type ts --type tsx

# Search for quotationTemplates (camelCase)
rg "quotationTemplates" --type ts --type tsx
```

If references exist outside the deleted files, update them first.

---

## ❌ DO NOT

- ❌ Do NOT delete the `quotationTemplates` table yet (only UI)
- ❌ Do NOT break navigation
- ❌ Do NOT leave broken imports

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: `/admin/settings/quotation-templates` returns 404
- [ ] Manual test: Sidebar shows "Service Packages" link
- [ ] Manual test: Service Packages page loads correctly

---

## Verification Checklist

Before marking complete:

- [ ] All files in `quotation-templates/` deleted
- [ ] Navigation updated
- [ ] No broken imports
- [ ] Build succeeds

---

## Dev Agent Record

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

- Removed the old Quotation Templates UI route: `/admin/settings/quotation-templates`
- Deleted the corresponding component directory: `src/components/modules/admin/quotation-templates/`
- Updated sidebar navigation to point to "Service Packages" and removed the redundant "Quotation Templates" link.
- Verified that no remaining `src/` files import from the deleted directory.
- Fixed an unrelated `nanoid` build error in `step-3-pricing.tsx` by replacing it with `crypto.randomUUID()`.

### Files Changed

- `src/components/modules/sidebar/navigation-config.ts`
- `src/components/modules/admin/service-packages/builder/step-3-pricing.tsx` (unrelated fix)
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/stories/13-unified-service-package-configuration/13d-legacy-cleanup-migration/13d-1-remove-old-quotation-templates-ui.md`
- (Deleted many files in `src/app/(protected)/@admin/settings/quotation-templates/` and `src/components/modules/admin/quotation-templates/`)
