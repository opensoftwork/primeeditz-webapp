# Story 3-10: Folder Templates Configuration

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: in-progress  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-17  
**Priority**: HIGH — Required for Epic 5 folder structure
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** to define folder templates for different project types,  
**So that** projects have consistent folder structures for asset upload.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On    | Status  | Notes                             |
| ------------- | ------- | --------------------------------- |
| Schema exists | ✅ Done | `folderTemplates` table in schema |
| Project Types | ✅ Done | For template association          |

### Enables

| Story                               | Notes                            |
| ----------------------------------- | -------------------------------- |
| **3-4: Project Stage/Folder Setup** | Uses templates to create folders |
| **5-1: View Project Folders**       | Clients see folder structure     |

---

## ✅ Acceptance Criteria

### AC1: Folder Templates Listing

- [ ] Route: `/admin/settings/folder-templates`
- [ ] Display: Name, Folder Count, Associated Project Type (optional)
- [ ] Show preview of folder names

### AC2: Create Folder Template

- [ ] "Add Template" opens drawer
- [ ] Fields: Name\*, Folders (dynamic list), Project Type (optional)
- [ ] Add/remove folder names dynamically
- [ ] Drag-drop to reorder folders

### AC3: Edit Folder Template

- [ ] Click template to edit
- [ ] Modify name, folders, project type
- [ ] Warn if template is in use by projects

### AC4: Delete/Deactivate Template

- [ ] Cannot delete if in use
- [ ] Show usage count
- [ ] Soft delete (deactivate) option

### AC5: Default Templates

- [ ] Seed default templates:
  - Wedding Photography: Ceremony, Reception, Candid, Couple Portraits
  - YouTube Video: Raw Footage, B-Roll, Audio, Graphics
  - General: Raw, Edits, Finals

---

## 📘 Implementation Tasks

### Phase A: Backend (~2 points)

**File**: `convex/functions/folderTemplates/queries.ts`

- [ ] `listFolderTemplates` - Get all templates
- [ ] `getFolderTemplate` - Get single template
- [ ] `getTemplatesByProjectType` - Filter by project type

**File**: `convex/functions/folderTemplates/mutations.ts`

- [ ] `createFolderTemplate` - Create template
- [ ] `updateFolderTemplate` - Update template
- [ ] `deleteFolderTemplate` - Delete (if not in use)

**File**: `convex/seed/folderTemplates.ts`

- [ ] Seed default templates

### Phase B: UI (~3 points)

**File**: `src/app/(protected)/@admin/settings/folder-templates/page.tsx`

- [ ] Templates list page
- [ ] Add template button
- [ ] Preview folder structure

**File**: `src/components/modules/admin/settings/folder-templates/`

- [ ] `folder-templates-list.tsx`
- [ ] `folder-template-drawer.tsx` - Create/edit form
- [ ] `folder-list-editor.tsx` - Dynamic add/remove/reorder
- [ ] `folder-template-preview.tsx` - Visual preview

---

## 🧩 Schema Reference

```typescript
// Already in convex/schema.ts
folderTemplates: defineTable({
  name: v.string(),
  folders: v.array(v.string()),
});
```

**Consider adding:**

```typescript
folderTemplates: defineTable({
  name: v.string(),
  folders: v.array(v.string()),
  projectTypeId: v.optional(v.id("projectTypes")),
  isDefault: v.optional(v.boolean()),
  isActive: v.optional(v.boolean()),
});
```

---

## 🎨 UX Design

### Folder List Editor

```
┌─────────────────────────────────────────────────────────────────┐
│  Folders                                             [+ Add]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⋮⋮ 1. Ceremony                                        [🗑️]    │
│  ⋮⋮ 2. Reception                                       [🗑️]    │
│  ⋮⋮ 3. Candid                                          [🗑️]    │
│  ⋮⋮ 4. Couple Portraits                                [🗑️]    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Enter folder name...                             [Add]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Admin can view templates list
- [ ] Admin can create new template
- [ ] Admin can add/remove folders dynamically
- [ ] Admin can reorder folders (drag-drop)
- [ ] Admin can edit existing template
- [ ] Cannot delete template in use
- [ ] Default templates seeded

---

## 🚀 Definition of Done

- [ ] CRUD operations working
- [ ] Dynamic folder list editor
- [ ] Drag-drop reordering
- [ ] Default templates seeded
- [ ] UI complete with premium styling
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-9 - Storage Pricing Tiers  
**Next Story**: 3-4 - Project Stage/Folder Setup
