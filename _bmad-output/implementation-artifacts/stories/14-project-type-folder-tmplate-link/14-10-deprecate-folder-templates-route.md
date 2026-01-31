# Story 14.10: Deprecate Standalone Folder Templates Route

**Status**: done  
**Points**: 2  
**Epic**: [14: Project Type + Folder Template Integration](../../../planning-artifacts/epics/14-project-type-folder-template-integration.md)  
**Depends On**: Stories 14.1-14.9 (ALL previous stories must be complete)

---

## User Story

**As a** Developer,  
**I want** to remove the standalone folder templates route,  
**So that** the codebase is clean and users only access templates through project types.

---

## ⚠️ CRITICAL: Execute ONLY After All Other Stories Complete

This story should be the **LAST** to execute. Ensure all the following are verified before proceeding:

- [ ] Story 14.1 - Wizard Context complete
- [ ] Story 14.2 - Step 1 Identity complete
- [ ] Story 14.3 - Step 2 Folders complete
- [ ] Story 14.4 - Step 3 Review complete
- [ ] Story 14.5 - Wizard Layout complete
- [ ] Story 14.6 - Routes complete
- [ ] Story 14.7 - Draft functionality complete
- [ ] Story 14.8 - Scoped template list complete
- [ ] Story 14.9 - Template builder context complete
- [ ] All above thoroughly tested in staging

---

## Acceptance Criteria

### AC1: Sidebar Navigation Updated

**Given** I view the admin sidebar  
**When** I look at the settings section  
**Then** "Folder Templates" is NO LONGER visible as a standalone link

### AC2: Route Removed

**Given** I try to navigate to `/settings/folder-templates`  
**When** the page loads  
**Then** I see a 404 page (or redirect to project types)

### AC3: Redirect for Existing Links

**Given** someone has bookmarked `/settings/folder-templates`  
**When** they visit that URL  
**Then** they are redirected to `/settings/project-types`
**And** they see a toast: "Folder templates are now accessed through Project Types"

### AC4: Folder Template Builder Still Accessible

**Given** folder templates are managed through project types  
**When** I navigate to `/settings/project-types/{id}/folder-templates`  
**Then** the builder still works correctly
**And** all existing functionality is preserved

### AC5: Code Cleanup

**Given** the route is deprecated  
**When** I check the codebase  
**Then** the following are removed:

- `/settings/folder-templates` route pages
- Sidebar nav link for folder templates
- Any orphaned components

---

## Technical Implementation

### Step 1: Add Redirect

Before removing files, add a redirect to catch existing bookmarks:

```tsx
// src/app/(protected)/@admin/settings/folder-templates/page.tsx
// TEMPORARILY replace content with redirect

import { redirect } from "next/navigation";

export default function DeprecatedFolderTemplatesPage() {
  // This route is deprecated
  redirect("/settings/project-types");
}
```

### Step 2: Update Sidebar

```tsx
// Remove this from admin sidebar navigation config

// BEFORE:
{
  href: "/settings/folder-templates",
  icon: FolderTree,
  label: "Folder Templates",
}

// AFTER: Remove entirely
```

### Step 3: Files to Remove

```
DELETE: src/app/(protected)/@admin/settings/folder-templates/page.tsx
DELETE: src/app/(protected)/@admin/settings/folder-templates/new/page.tsx
DELETE: src/app/(protected)/@admin/settings/folder-templates/[id]/page.tsx
DELETE: src/components/modules/admin/folder-templates/list/  (if exists)
```

### Step 4: Update Any Internal Links

Search for and update any internal links that still point to `/settings/folder-templates`:

```bash
# Search command
grep -r "settings/folder-templates" src/ --include="*.tsx" --include="*.ts"
```

Update found links to point to the new project-type-scoped routes.

### Step 5: Keep Shared Components

The following should be KEPT as they're reused:

```
KEEP: src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx
KEEP: src/components/modules/admin/folder-templates/builder/folder-tree.tsx
KEEP: src/components/modules/admin/folder-templates/builder/folder-node.tsx
KEEP: src/components/modules/admin/folder-templates/builder/index.ts
```

---

## Migration Notes

### For Internal Teams

Post a notification:

> **Folder Templates Route Deprecated**
>
> The `/settings/folder-templates` route has been removed. Folder templates are now managed directly through Project Types:
>
> 1. Go to **Settings > Project Types**
> 2. Click on a project type
> 3. Click "Manage Templates" or create with the wizard
>
> Any bookmarks to the old route will redirect automatically.

### For Documentation

Update any internal docs that reference:

- `/settings/folder-templates` → `/settings/project-types`
- "Create a folder template" → "Create with project type or add via Project Type > Manage Templates"

---

## ❌ DO NOT

- ❌ Do NOT execute this story until ALL other 14.x stories are complete and tested
- ❌ Do NOT delete the FolderTree/FolderNode components (they're reused)
- ❌ Do NOT delete Convex mutations/queries for folder templates
- ❌ Do NOT skip the redirect step (users may have bookmarks)
- ❌ Do NOT forget to update internal links

---

## Testing Requirements

- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Run `pnpm build` - builds successfully
- [ ] Manual test: Sidebar no longer shows "Folder Templates"
- [ ] Manual test: /settings/folder-templates redirects properly
- [ ] Manual test: Project type scoped templates still work
- [ ] Manual test: Creating template via wizard works
- [ ] Manual test: Editing template works
- [ ] Manual test: No broken links in application

---

## Files to Delete

```
DELETE: src/app/(protected)/@admin/settings/folder-templates/page.tsx
DELETE: src/app/(protected)/@admin/settings/folder-templates/new/page.tsx
DELETE: src/app/(protected)/@admin/settings/folder-templates/[id]/page.tsx
DELETE: src/app/(protected)/@admin/settings/folder-templates/[id]/not-found.tsx (if exists)
```

## Files to Modify

```
MODIFY: src/components/modules/admin/layout/sidebar/sidebar-config.ts (or equivalent)
  - Remove folder templates nav item

MODIFY: Any files found by grep search for "settings/folder-templates"
```

---

## Rollback Plan

If issues are discovered after deprecation:

1. Restore route files from git
2. Re-add sidebar nav item
3. Document which stories need fixes
4. Apply fixes
5. Re-attempt deprecation

---

## Dev Agent Record

### Agent Model Used

Claude (Anthropic)

### Completion Notes

Deprecated the standalone folder templates route. Key changes:

1. **Sidebar Navigation (AC1)** - Removed "Folder Templates" link from admin sidebar
2. **Route Redirects (AC2, AC3)** - Replaced all standalone folder template route pages with redirects to `/settings/project-types`:
   - `/settings/folder-templates` → redirects
   - `/settings/folder-templates/new` → redirects
   - `/settings/folder-templates/[templateId]` → redirects
3. **Builder Fallback URL** - Updated FolderTemplateBuilder's non-context fallback URL from deprecated route to `/settings/project-types`
4. **Code Cleanup (AC5)** - Removed unused `FolderTree` icon import from navigation config

**Note:** Routes were converted to redirects rather than deleted to preserve bookmarks and provide graceful migration for existing users. The builder components are preserved as they're still used by project-type-scoped routes.

### Files Changed

- `MODIFY: src/components/modules/sidebar/navigation-config.ts` - Removed Folder Templates nav item and FolderTree import
- `MODIFY: src/app/(protected)/@admin/settings/folder-templates/page.tsx` - Replaced with redirect
- `MODIFY: src/app/(protected)/@admin/settings/folder-templates/new/page.tsx` - Replaced with redirect
- `MODIFY: src/app/(protected)/@admin/settings/folder-templates/[templateId]/page.tsx` - Replaced with redirect
- `MODIFY: src/components/modules/admin/folder-templates/builder/folder-template-builder.tsx` - Updated fallback URL
