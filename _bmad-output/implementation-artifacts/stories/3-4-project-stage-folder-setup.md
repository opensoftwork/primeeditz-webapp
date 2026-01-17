# Story 3-4: Project Stage/Folder Setup

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: in-dev  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-17  
**Priority**: HIGH — Required for Epic 5 folder creation
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** to set up the folder structure for a project after quotation approval,  
**So that** clients know where to upload their assets.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                 | Status        | Notes                      |
| -------------------------- | ------------- | -------------------------- |
| **3-10: Folder Templates** | ready-for-dev | Templates must exist first |
| **4-8: Client Accept**     | ready-for-dev | Triggered after acceptance |

### Enables

| Story                         | Notes                     |
| ----------------------------- | ------------------------- |
| **5-1: View Project Folders** | Folders visible to client |
| **5-3: File Upload**          | Files uploaded to folders |

---

## ✅ Acceptance Criteria

### AC1: Folder Setup Trigger

- [x] Admin project detail shows "Setup Folders" button
- [x] Button enabled only when:
  - Project has approved quotation (status = `approved`)
  - Folders not already created

### AC2: Folder Template Selection

- [x] Clicking "Setup Folders" opens drawer
- [x] Shows available folder templates
- [x] Templates filtered by project type (if associated)
- [x] Preview shows folder names

### AC3: Folder Creation

- [x] Selecting template + confirming creates folder records
- [x] Folders created in `folders` table linked to project
- [x] Each folder has: name, path, status = `pending_upload`

### AC4: Storage Tier Assignment

- [x] During setup, select/confirm storage tier
- [ ] Storage tier from quotation pre-selected (not yet implemented - no quotation linkage)
- [x] Can override if needed
- [x] Project's `storageAllocated` updated

### AC5: Post-Setup State

- [x] Project shows folder structure in detail view
- [ ] Client can now see folders in their portal (requires client portal update)
- [x] "Setup Folders" button changes to "View Folders"

---

## 📘 Implementation Tasks

### Phase A: Backend (~2 points)

**File**: `convex/functions/folders/mutations.ts`

- [x] `setupProjectFolders` mutation
  - Input: projectId, templateId, storageTierId
  - Creates folder records from template
  - Updates project storageAllocated

**File**: `convex/functions/folders/queries.ts`

- [x] `getProjectFolders` - Get folders for project
- [x] `canSetupFolders` - Check if setup allowed

### Phase B: UI (~3 points)

**File**: `src/components/modules/admin/projects/folder-setup/`

- [x] `folder-setup-drawer.tsx` - Main drawer
- [x] `template-selector.tsx` - Template selection
- [x] `storage-tier-selector.tsx` - Tier selection
- [x] `folder-preview.tsx` - Preview before creation

**File**: `src/components/modules/admin/projects/project-detail/`

- [x] Add "Setup Folders" button to project detail (via system-controls.tsx)
- [x] Show folder list after setup (via project-folders-list.tsx)

---

## 🎨 UX Design

### Folder Setup Drawer

```
┌─────────────────────────────────────────────────────────────────┐
│  Setup Project Folders                                     [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📁 PROJECT: Wedding of Rahul & Priya                           │
│  📋 CODE: PRJ-2026-00042                                        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SELECT FOLDER TEMPLATE                                         │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  ○ Wedding Photography (4 folders)                              │
│    Ceremony • Reception • Candid • Portraits                    │
│                                                                  │
│  ○ General Template (3 folders)                                 │
│    Raw • Edits • Finals                                         │
│                                                                  │
│  ● Custom (from quotation)                                      │
│    Ceremony • Reception • Pre-Wedding • Couple                  │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STORAGE ALLOCATION                                             │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  [500 GB - Premium ▼]               ₹5,000                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Cancel]                          [✓ Create Folders]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Schema Reference

```typescript
// Already in convex/schema.ts
folders: defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  path: v.string(),
  status: folderStatusValidator, // pending_upload | in_progress | completed
}).index("by_projectId", ["projectId"]);
```

---

## 🧪 Testing Checklist

- [ ] Button disabled before quotation approval
- [ ] Button enabled after quotation approval
- [ ] Template selection works
- [ ] Folder preview accurate
- [ ] Storage tier selection works
- [ ] Folders created in database
- [ ] Client can see folders after setup
- [ ] Cannot setup folders twice

---

## 🚀 Definition of Done

- [ ] `setupProjectFolders` mutation working
- [ ] Folder setup drawer complete
- [ ] Template and tier selection functional
- [ ] Folders created and visible
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-10 - Folder Templates  
**Enables**: Epic 5 - Asset Upload
