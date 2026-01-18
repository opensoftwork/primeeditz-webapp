# Track A: Epic 5 - Asset Upload & Folder Management

**Created**: 2026-01-18  
**Track Owner**: Senior Dev  
**Priority**: HIGH  
**Estimated Duration**: 2-3 weeks

---

## 📋 Track Overview

This track implements the core asset upload and folder management system for PrimeEditz. It includes resumable uploads for large video files using the tus protocol.

---

## 🎯 Stories In Scope

| Story | Title                         | Points | Status        |
| ----- | ----------------------------- | ------ | ------------- |
| 5-1   | View Project Folders          | 5      | ready-for-dev |
| 5-2   | Gated Upload Enforcement      | 3      | ready-for-dev |
| 5-3   | File Upload (Dual Strategy)   | 8      | ready-for-dev |
| 5-4   | Upload Progress & Validation  | 5      | ready-for-dev |
| 5-5   | Storage Limit Enforcement     | 4      | ready-for-dev |
| 5-6   | Mark Upload Complete          | 2      | ready-for-dev |
| 5-7   | Admin Asset Upload (Internal) | 3      | ready-for-dev |

**Total**: 30 story points

---

## 🔧 Technical Stack

| Technology        | Purpose                             |
| ----------------- | ----------------------------------- |
| **@tus/server**   | Resumable upload server             |
| **@tus/s3-store** | MinIO storage backend for tus       |
| **tus-js-client** | Browser-side resumable uploads      |
| **Zustand**       | Upload queue state management       |
| **Convex**        | Metadata storage, real-time updates |
| **MinIO**         | S3-compatible storage (existing)    |

---

## 📁 Key Files to Create/Modify

### New Files

```
src/
├── stores/
│   └── upload-store.ts                    # Zustand upload queue
├── hooks/
│   ├── use-standard-upload.ts             # Pre-signed URL upload
│   └── use-resumable-upload.ts            # tus resumable upload
├── lib/
│   ├── file-validation.ts                 # MIME type, size validation
│   └── storage-check.ts                   # Pre-flight storage check
├── app/
│   └── api/
│       └── upload/
│           └── [...file]/
│               └── route.ts               # tus server endpoint
└── components/
    └── shared/
        ├── project-folders/               # Shared folder components
        │   ├── folder-card.tsx
        │   ├── folder-grid.tsx
        │   └── index.ts
        └── storage-usage-bar.tsx

convex/
├── lib/
│   └── uploadGate.ts                      # Gate check utility
└── functions/
    ├── storage/
    │   └── queries.ts                     # getProjectStorageUsage
    └── assets/
        └── mutations.ts                   # recordAssetUpload
```

### Files to Modify

```
src/components/modules/projects/detail/
├── project-detail-view.tsx                # Add assets section
└── assets-section.tsx                     # NEW: Client assets view

src/components/modules/admin/projects/project-detail/
└── index.tsx                              # Enhance with assets section
```

---

## 🎨 UI Pattern: Admin Project Detail Redesign

Based on schema analysis, the admin project detail needs to show:

### Currently Available Data (from schema)

| Field                    | Table                     | Notes                                            |
| ------------------------ | ------------------------- | ------------------------------------------------ |
| **Basic Info**           | `projects`                | code, eventName, endClientName, venue, eventDate |
| **Status**               | `projects`                | status, source                                   |
| **Client**               | `profiles`                | via clientId join                                |
| **Project Type**         | `projectTypes`            | via projectTypeId join                           |
| **Type-Specific Fields** | `projectTypeFields`       | Dynamic fields                                   |
| **Reference Files**      | `projects.referenceFiles` | Array of file metadata                           |
| **Folders**              | `folders`                 | Project folders via projectId                    |
| **Assets**               | `assets`                  | Uploaded files via folderId                      |
| **Quotation**            | `quotations`              | via projectId                                    |
| **Storage**              | `projects`                | storageAllocated, storageUsed                    |
| **Assignment**           | `profiles`                | via assignedEmployeeId                           |
| **Deliverables**         | `deliverables`            | via projectId                                    |
| **Status History**       | `statusHistory`           | Audit trail via projectId                        |

### Recommended Admin Project Detail Tabs

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROJECT: PRIME-2026-001                                                 │
│                                                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │  OVERVIEW   │ │   ASSETS    │ │   QUOTES    │ │ DELIVERABLES│        │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

1. **Overview Tab**: Project specs, client info, status, history
2. **Assets Tab**: Folders, uploads, storage (this Epic 5)
3. **Quotes Tab**: Quotation history, status
4. **Deliverables Tab**: QC workflow (Epic 6)

---

## 🔄 Implementation Order

### Week 1: Foundation (5-1, 5-2)

1. **5-1: View Project Folders**
   - Create shared folder components
   - Add `AssetsSection` to client detail view
   - Storage usage bar

2. **5-2: Gated Upload Enforcement**
   - Gate check utility
   - Locked/unlocked UI states
   - API enforcement

### Week 2: Upload Core (5-3, 5-4)

3. **5-3: File Upload Dual Strategy**
   - Install tus packages
   - Create tus API route
   - Zustand upload store
   - Standard upload hook
   - Resumable upload hook

4. **5-4: Upload Progress & Validation**
   - File validation utility
   - Progress UI components
   - Retry logic

### Week 3: Polish (5-5, 5-6, 5-7)

5. **5-5: Storage Limit Enforcement**
   - Pre-flight checks
   - Storage exceeded modal

6. **5-6: Mark Upload Complete**
   - Status transition

7. **5-7: Admin Asset Upload**
   - Internal project handling

---

## ⚠️ Dependencies on Other Tracks

| Dependency | Track | Status | Notes                  |
| ---------- | ----- | ------ | ---------------------- |
| None       | -     | -      | Track A is independent |

---

## 🧪 Testing Checklist

- [ ] Standard upload works (<100MB)
- [ ] Resumable upload works (>100MB video)
- [ ] Upload pause/resume works
- [ ] Browser refresh allows resume
- [ ] Storage limits enforced
- [ ] Gate blocks unapproved projects
- [ ] Internal projects bypass gate

---

## 📝 Daily Standup Notes

| Date       | Progress        | Blockers | Next      |
| ---------- | --------------- | -------- | --------- |
| 2026-01-18 | Stories created | None     | Start 5-1 |

---

## 📚 Reference Documentation

- Story files: `_bmad-output/implementation-artifacts/stories/5-*.md`
- Epic file: `_bmad-output/planning-artifacts/epics/05-asset-upload.md`
- tus docs: `_bmad-output/docs/tus/`
- Existing pattern: `src/components/modules/admin/projects/folder-setup/project-folders-list.tsx`
