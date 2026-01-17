# Story 3-14: Enhanced Folder Setup with Quotation Selection

**Epic**: Epic 3 - Admin Portal & System Management  
**Status**: in-dev  
**Complexity**: Medium (3 points)  
**Created**: 2026-01-17  
**Priority**: HIGH — Improves folder setup UX significantly
**Track**: B (Parallel development)

---

## 📋 User Story

**As an** Admin,  
**I want** the folder setup drawer to include quotation selection as the first step (when needed),  
**So that** I can link a project to a quotation and setup folders in one smooth flow.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                           | Status        | Notes                         |
| ------------------------------------ | ------------- | ----------------------------- |
| **3-4: Project Stage/Folder Setup**  | in-dev        | Base folder setup implemented |
| **3-12: Link Project to Quotation**  | ready-for-dev | Quotation linking mutation    |
| **3-13: Client Approved Quotations** | ready-for-dev | Query for quotation selection |

### Enables

| Story                         | Notes                        |
| ----------------------------- | ---------------------------- |
| **5-1: View Project Folders** | Folders properly initialized |
| **5-3: File Upload**          | Storage properly allocated   |

---

## 🎯 Enhanced Flow

### Flow A: Project Already Has Linked Approved Quotation

```
Step 1: Select Folder Template (skip quotation selection)
Step 2: Allocate Storage (from linked quotation's pool)
Step 3: Preview & Confirm
```

### Flow B: Project Has No Quotation (New Enhancement)

```
Step 1: Select/Link Quotation (from client's approved quotations)
Step 2: Select Folder Template
Step 3: Allocate Storage (from newly linked quotation)
Step 4: Preview & Confirm
```

---

## ✅ Acceptance Criteria

### AC1: Smart Step Detection

- [ ] Drawer detects if project has linked approved quotation
- [ ] If YES → Skip to Step 2 (Template Selection)
- [ ] If NO → Show Step 1 (Quotation Selection)

### AC2: Quotation Selection Step

- [ ] Shows client's approved quotations (uses 3-13 query)
- [ ] Each quotation displays:
  - Code, total value
  - Storage remaining
  - Visual indicator if sufficient storage
- [ ] Selection required before proceeding
- [ ] On selection, links quotation to project

### AC3: Storage Allocation Step (Enhanced)

- [ ] Shows storage from selected/linked quotation
- [ ] Pre-selects recommended tier based on project type
- [ ] Shows impact on quotation's remaining storage
- [ ] Prevents over-allocation (cannot exceed remaining)

### AC4: Combined Action

- [ ] Single "Create Folders" button:
  - Links quotation (if not already linked)
  - Creates folder records
  - Updates project's storageAllocated
  - Updates quotation's used storage tracking

---

## 📘 Implementation Tasks

### Phase A: Update Folder Setup Drawer (~3 points) ✅

**File**: `src/components/modules/admin/projects/folder-setup/folder-setup-drawer.tsx`

- [ ] Add quotation selection step (Step 1)
- [ ] Conditional step visibility based on quotation state
- [ ] Integrate `getClientApprovedQuotations` query
- [ ] Update submit handler to:
  - Link quotation if not linked
  - Create folders
  - Track storage allocation

**File**: `src/components/modules/admin/projects/folder-setup/quotation-selector.tsx`

- [ ] New component for quotation selection
- [ ] Display quotation cards with storage info
- [ ] Visual indicators for storage availability

### Phase B: Update Backend (~1 point)

**File**: `convex/functions/folders/mutations.ts`

- [ ] Update `setupProjectFolders` to optionally link quotation first
- [ ] Add storage validation against quotation pool

---

## 🎨 UX Design

### Enhanced Folder Setup Drawer

```
┌─────────────────────────────────────────────────────────────────┐
│  Setup Project Folders                                     [X]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📁 PROJECT: Rani's Wedding                                     │
│  📋 CODE: PE-202601-004                                         │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ① SELECT QUOTATION                                    ✓ Done   │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  Currently linked: QT-2026-00012 (Wedding Package)              │
│  │ Total: ₹45,000 │ Storage: 200 GB │ Remaining: 150 GB │       │
│                                                                  │
│  OR select different quotation:                                 │
│  ○ QT-2026-00015 - Album Add-on (₹12,000 - 50GB)               │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ② SELECT FOLDER TEMPLATE                              ○ Active │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  ● Wedding Photography (4 folders)                              │
│    Ceremony • Reception • Candid • Portraits                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ③ ALLOCATE STORAGE                                             │
│  ───────────────────────────────────────────────────────────    │
│                                                                  │
│  [100 GB ▼]  from QT-2026-00012                                 │
│  Remaining after allocation: 50 GB                              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Cancel]                          [✓ Create Folders]           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

- [ ] Drawer shows quotation step when no quotation linked
- [ ] Drawer skips quotation step when already linked
- [ ] Cannot proceed without selecting quotation
- [ ] Storage allocation respects quotation's remaining storage
- [ ] Cannot over-allocate storage
- [ ] All steps complete successfully
- [ ] Project shows correct linked quotation after setup

---

## 🚀 Definition of Done

- [ ] Smart step detection working
- [ ] Quotation selector component complete
- [ ] Storage allocation from quotation pool
- [ ] Over-allocation prevention
- [ ] Single-action submit (link + create + allocate)
- [ ] Story marked as `done` in `sprint-status.yaml`

---

**Previous Story**: 3-13 - Client Approved Quotations Query  
**Next Story**: 3-15 - Storage Pool Tracking
