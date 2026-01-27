# Epic 13B: Folder Template Enhancement

**Parent Epic**: [13: Unified Service Package Configuration](./13-unified-service-package-configuration.md)  
**Status**: Backlog  
**Created**: 2026-01-27  
**Complexity**: Medium  
**Estimated Points**: 13

---

## 📋 Epic Summary

This epic enhances folder templates to support:

1. **Hierarchical folder structures** (nested folders, not flat arrays)
2. **Project-type specificity** (Wedding vs YouTube have different structures)
3. **Cultural/regional variants** (South Indian Wedding vs Christian Wedding)
4. **Folder metadata** (descriptions, required flags)

Key principle: **Folders are for studio INPUTS only**. Deliverables are managed by the system.

---

## 🎯 User Outcomes

| Role       | Outcome                                                   |
| :--------- | :-------------------------------------------------------- |
| **Admin**  | Create meaningful folder structures for each service type |
| **Studio** | Clear understanding of what to upload where               |
| **System** | Automatic folder creation with proper nesting             |

---

## 📝 User Stories

### Story 13B.1: Enhance `folderTemplates` Schema

**Points**: 3

**As a** Developer,  
**I want** folder templates to support hierarchical structures,  
**So that** we can create nested folder organizations like `/Photos/Family/`.

**Acceptance Criteria**:

- [ ] Change `folders: v.array(v.string())` to structured objects
- [ ] Each folder object has: `name`, `path`, `description`, `isRequired`, `children`
- [ ] `children` allows unlimited nesting depth
- [ ] Add `projectTypeId` as required field (folders belong to a project type)
- [ ] Add `variant` for cultural/regional variations

**New Schema**:

```typescript
const folderObjectValidator = v.object({
  name: v.string(),           // "Family"
  path: v.string(),           // "/Photos/Family"
  description: v.optional(v.string()),  // "Upload family portraits here"
  isRequired: v.optional(v.boolean()),  // Must have at least one file
  children: v.optional(v.array(v.lazy(() => folderObjectValidator))),
});

folderTemplates: defineTable({
  name: v.string(),
  projectTypeId: v.id("projectTypes"),
  variant: v.optional(v.string()),       // "South Indian", "Christian"
  description: v.optional(v.string()),   // Template description
  folders: v.array(folderObjectValidator),
  isDefault: v.optional(v.boolean()),
  isActive: v.boolean(),
}).index("by_projectTypeId", ["projectTypeId"]),
```

**Technical Notes**:

- Convex doesn't support `v.lazy()` - use max 3-level nesting instead
- File: `convex/schema.ts`

---

### Story 13B.2: Create Wedding Folder Template Seeds

**Points**: 3

**As a** Developer,  
**I want** pre-built wedding folder templates for different traditions,  
**So that** admins have useful starting points.

**Acceptance Criteria**:

- [ ] Create "South Indian Traditional Wedding" template:
  - `/Photos/Muhurtham/` (Required)
  - `/Photos/Vardhaani/`
  - `/Photos/Reception/`
  - `/Photos/Family/`
  - `/Photos/Couple/`
  - `/Video/Ceremony/`
  - `/Video/Drone/`
  - `/Audio/Songs/`
  - `/Album/References/`
- [ ] Create "Christian Wedding" template:
  - `/Photos/Church Ceremony/` (Required)
  - `/Photos/Reception/`
  - `/Photos/Couple/`
  - `/Photos/Bridal Party/`
  - `/Photos/Family/`
  - `/Video/Ceremony/`
  - `/Video/Reception/`
- [ ] Create "North Indian Wedding" template:
  - `/Photos/Haldi/`
  - `/Photos/Mehendi/`
  - `/Photos/Sangeet/`
  - `/Photos/Baraat/`
  - `/Photos/Pheras/` (Required)
  - `/Photos/Reception/`
  - `/Video/Events/`

**Files**:

- `convex/seeds/folderTemplates.ts` (update)

---

### Story 13B.3: Create Content Creator Folder Template Seeds

**Points**: 2

**As a** Developer,  
**I want** folder templates for content creation projects,  
**So that** YouTube/reels editors have organized structures.

**Acceptance Criteria**:

- [ ] Create "YouTube Long-Form Video" template:
  - `/Raw Footage/A-Roll/` (Required)
  - `/Raw Footage/B-Roll/`
  - `/Graphics/Thumbnails/`
  - `/Graphics/Lower Thirds/`
  - `/Audio/Voiceover/`
  - `/Audio/Background Music/`
  - `/Scripts/`
  - `/Brand Assets/`

- [ ] Create "YouTube Shorts / Reels" template:
  - `/Clips/` (Required)
  - `/Audio/`
  - `/Captions/`

- [ ] Create "Album Design Only" template:
  - `/Photos/Selected/` (Required)
  - `/References/Design Style/`
  - `/References/Layout Preferences/`

---

### Story 13B.4: Update Folder Setup Mutation

**Points**: 2

**As a** Developer,  
**I want** the folder setup mutation to handle hierarchical templates,  
**So that** nested folders are created correctly.

**Acceptance Criteria**:

- [ ] `setupFoldersInternal` recursively creates nested folders
- [ ] Each folder record includes: `name`, `path`, `projectId`, `status`
- [ ] Child folders are created after parent folders
- [ ] Folder paths are properly concatenated

**Current Logic**:

```typescript
// OLD: Flat array
for (const folderName of template.folders) {
  await ctx.db.insert("folders", { name: folderName, path: `/${folderName}` });
}
```

**New Logic**:

```typescript
// NEW: Recursive creation
async function createFolders(folders, parentPath = "") {
  for (const folder of folders) {
    await ctx.db.insert("folders", {
      name: folder.name,
      path: `${parentPath}/${folder.name}`,
      description: folder.description,
      isRequired: folder.isRequired,
    });
    if (folder.children) {
      await createFolders(folder.children, `${parentPath}/${folder.name}`);
    }
  }
}
```

---

### Story 13B.5: Folder Template Builder UI

**Points**: 3

**As an** Admin,  
**I want** a visual folder template builder,  
**So that** I can easily create and modify folder structures.

**Acceptance Criteria**:

- [ ] Tree view showing folder hierarchy
- [ ] Add root folder button
- [ ] Add child folder button (appears on hover)
- [ ] Edit folder: name, description, isRequired toggle
- [ ] Delete folder (with confirmation for folders with children)
- [ ] Drag-and-drop reordering (COULD - defer if complex)
- [ ] Project type selector
- [ ] Variant name input
- [ ] Save and preview

**UI Components**:

- `src/components/modules/admin/folder-templates/builder/`
  - `folder-tree.tsx`
  - `folder-node.tsx`
  - `folder-editor-drawer.tsx`
  - `template-form.tsx`

---

## ✅ Definition of Done

- [ ] Schema supports hierarchical folder structures
- [ ] Wedding templates created for 3 traditions
- [ ] Content creator templates created
- [ ] Folder creation mutation handles nesting
- [ ] Builder UI allows visual template creation
- [ ] All templates seed correctly

---

## 🔗 Dependencies

| Depends On   | Notes                       |
| :----------- | :-------------------------- |
| **Epic 13A** | Schema changes needed first |

| Blocks       | Notes                              |
| :----------- | :--------------------------------- |
| **Epic 13C** | Service Package Builder uses these |

---

_Document Version: 1.0_  
_Last Updated: 2026-01-27_
