# Story 13D.2: Simplify Project Types UI

**Status**: backlog  
**Points**: 2  
**Epic**: [13D: Legacy Cleanup & Migration](../../../../planning-artifacts/epics/13d-legacy-cleanup-migration.md)  
**Depends On**: Epic 13A complete

---

## User Story

**As a** Developer,  
**I want** to simplify the project types UI,  
**So that** it only manages basic type info (not detailed configuration).

---

## Acceptance Criteria

### AC1: Remove Detailed Configuration

**Given** the project types detail page exists  
**When** I simplify it  
**Then** I remove:

- Dynamic fields management (`projectTypeFields` UI)
- Complex folder template assignment (now done in service packages)
- Any pricing configuration moved to service packages

### AC2: Keep Basic List

**Given** project types list page exists  
**When** I simplify  
**Then** I keep:

- List of project types (name, description, status)
- Create new project type (basic fields only)
- Edit project type (name, description, isActive)
- Delete project type (with usage check)

### AC3: Basic Project Type Fields

**Given** the simplified form  
**When** creating/editing  
**Then** only these fields are available:

- Name (required)
- Description (optional)
- Category (dropdown, optional)
- Icon (optional, for visual identification)
- Is Active (toggle)

### AC4: Remove projectTypeFields Management

**Given** the projectTypeFields table is deprecated  
**When** I clean up the UI  
**Then** I remove any UI for managing dynamic fields  
**And** keep the table for now (remove in schema cleanup later)

---

## Technical Implementation

### Files to MODIFY

```
MODIFY: src/components/modules/admin/project-types/
  - Simplify form to basic fields only
  - Remove dynamic fields section
```

### Files to DELETE (if they exist)

```
DELETE: src/components/modules/admin/project-types/fields/
  - (any dynamic fields management UI)

DELETE: src/components/modules/admin/project-type-fields/
  - (if separate from main project types)
```

### Simplified Form Example

```tsx
// project-type-form.tsx
const projectTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  icon: z.string().optional(),
  isActive: z.boolean().default(true),
});

// NO MORE:
// - dynamicFields
// - folderTemplates configuration
// - pricing defaults
```

### Removal Checklist

1. Remove "Dynamic Fields" tab/section from project type detail
2. Remove "Folder Templates" management from project type detail
3. Remove any "Pricing Defaults" section
4. Keep only: Name, Description, Category, Icon, IsActive

---

## ❌ DO NOT

- ❌ Do NOT delete the `projectTypeFields` table from schema (only UI)
- ❌ Do NOT delete the project types list page
- ❌ Do NOT remove basic CRUD for project types
- ❌ Do NOT forget to update navigation if sub-routes are removed

---

## Testing Requirements

- [x] Run `pnpm tsc --noEmit` - no TypeScript errors
- [x] Run `pnpm build` - builds successfully
- [x] Manual test: Project types list still works
- [x] Manual test: Create/edit project type with basic fields
- [x] Manual test: No dynamic fields UI visible

---

## Dev Agent Record

### Agent Model Used

Antigravity (Claude 3.5 Sonnet)

### Completion Notes

- Simplified Project Type detail view by removing "Form Structure" (dynamic fields) and "Delivery Configuration" sections.
- Removed legacy components: `field-drawer.tsx`, `field-list.tsx`, `delivery-config-form.tsx`, `detail-alerts.tsx`, `detail-stats.tsx`.
- Updated `ProjectTypeDrawer` to include basic info fields: `description` and `icon`.
- Updated Convex schema and mutations to support `description` and `icon` for `projectTypes`.
- Deleted legacy `project-type-preview.tsx` and its route.
- Removed field count display from the project types list card.

### Files Changed

- `convex/schema.ts`
- `convex/functions/projectTypes/mutations.ts`
- `src/components/modules/admin/project-types/detail/project-type-detail.tsx`
- `src/components/modules/admin/project-types/detail/detail-header.tsx`
- `src/components/modules/admin/project-types/detail/index.ts`
- `src/components/modules/admin/project-types/list/project-type-card.tsx`
- `src/components/modules/admin/project-types/list/project-type-drawer.tsx`
- `src/components/modules/admin/project-types/list/project-type-list.tsx`
- `src/components/modules/admin/project-types/index.ts`
- (Deleted several files in `src/components/modules/admin/project-types/detail/` and the preview route)
