# Epic 16 — Version Workflow Analysis & Remediation Plan

> **Date:** 2026-02-12  
> **Analysts:** PM · Architect · UX Designer (collaborative brainstorm)  
> **Status:** 🔴 Critical Architectural Flaw Identified

---

## 1. Problem Statement (Articulated from User's Intent)

The user's intended business logic is:

> **A Deliverable (D1) should contain all its versions (V1, V2, V3…) as a linear history within that single deliverable entity.** When a corrected file is uploaded (by employee or admin), it should become V2 _of D1_, not a brand-new deliverable D2.

### What's Happening Now (The Bug)

The `uploadCorrectedVersion` mutation in `convex/functions/deliverables/mutations.ts` (line 470–558) **creates a brand-new row in the `deliverables` table** with `parentDeliverableId` linking back to the original. This means:

```
Current (Flawed):
  deliverables table:
    D1 = { name: "photo.jpg", version: 1, status: "version_requested" }
    D2 = { name: "photo.jpg", version: 2, status: "pending_qc", parentDeliverableId: D1 }
    D3 = { name: "photo.jpg", version: 3, status: "pending_qc", parentDeliverableId: D1 }
```

This causes:

- **Visual Duplication**: The deliverables list shows D1, D2, D3 as separate items
- **Business Logic Confusion**: Each "version" looks like a new deliverable to studio/client
- **Approval Chaos**: Studio may approve D1 but see D2 as a different deliverable
- **Version History is Scattered**: Versions are spread across multiple rows instead of being a linear progression on one entity

### What Should Happen (Intended)

```
Intended:
  deliverables table:
    D1 = { name: "photo.jpg", currentVersion: 3, status: "pending_qc" }

  deliverableVersions table (NEW):
    V1 = { deliverableId: D1, version: 1, minioKey: "...", uploadedBy: employee }
    V2 = { deliverableId: D1, version: 2, minioKey: "...", uploadedBy: employee }
    V3 = { deliverableId: D1, version: 3, minioKey: "...", uploadedBy: admin }
```

---

## 2. Intended Workflow (Full Flow Diagrams)

### 2.1 Initial Upload → QC → Studio Review

```
┌────────────────────────────────────────────────────────────────┐
│                     INITIAL UPLOAD FLOW                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Employee uploads file                                         │
│       ↓                                                        │
│  D1 created → V1 auto-created → status: pending_qc            │
│       ↓                                                        │
│  Admin QC Review                                               │
│       ├── ✅ Approve → status: approved                        │
│       │       ↓                                                │
│       │   Admin clicks "Send to Studio"                        │
│       │       ↓                                                │
│       │   Studio sees D1 (V1) for review                       │
│       │       ├── ✅ Studio Approves D1 → done                 │
│       │       └── 🔄 Studio Requests Changes                   │
│       │               ↓                                        │
│       │           VERSION REQUEST FLOW (see 2.2)               │
│       │                                                        │
│       └── ❌ Admin Requests Version                             │
│               ↓                                                │
│           VERSION REQUEST FLOW (see 2.2)                       │
└────────────────────────────────────────────────────────────────┘
```

### 2.2 Version Request Flow (The Core Cycle)

```
┌────────────────────────────────────────────────────────────────┐
│                  VERSION REQUEST CYCLE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  WHO initiates?                                                │
│       ├── Admin (during QC)                                    │
│       │       → Creates versionRequest                         │
│       │       → Assigns to employee                            │
│       │       → Employee sees "Version Workspace"              │
│       │       → Employee uploads corrected file                │
│       │       → D1.currentVersion = N+1 (IN-PLACE update)     │
│       │       → D1.status = "pending_qc" (back to admin QC)   │
│       │                                                        │
│       └── Studio (during review)                               │
│               → Creates versionRequest                         │
│               → ⚠️ Admin gets alert (NEW behavior)            │
│               → Admin reviews the request                      │
│               → Admin DECIDES:                                 │
│                   ├── Delegate to Employee                     │
│                   │       → Same as admin flow above           │
│                   └── Upload Corrected Version Themselves       │
│                       → D1.currentVersion = N+1                │
│                       → D1.status = "pending_qc" or approved   │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ KEY: D1 is ALWAYS the same deliverable.                 │   │
│  │ V1, V2, V3... are stored in deliverableVersions table.  │   │
│  │ The deliverable row reflects the LATEST version state.   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  Cycle repeats until Studio approves the latest version.       │
└────────────────────────────────────────────────────────────────┘
```

### 2.3 Who Can Do What

| Actor    | Can Request Version? | Can Upload Corrected Version? | Can Assign Employee? |
| -------- | -------------------- | ----------------------------- | -------------------- |
| Admin    | ✅ (during QC)       | ✅ (directly)                 | ✅                   |
| Studio   | ✅ (during review)   | ❌                            | ❌                   |
| Employee | ❌                   | ✅ (when assigned)            | ❌                   |

---

## 3. Root Cause Analysis (Architect)

### 3.1 Schema Design Flaw

The current `deliverables` table stores **both** the identity of the deliverable AND its version-specific data (minioKey, sizeBytes, mimeType) in the **same row**. This means:

- To create a new version, you MUST create a new deliverable row
- This conflates "logical deliverable" with "physical file version"

**Current Schema (Problematic):**

```typescript
deliverables: {
  projectId, name, description,
  version,        // ← version number baked into the deliverable
  status,
  minioKey,       // ← file reference baked into the deliverable
  sizeBytes,      // ← file metadata baked into the deliverable
  mimeType,
  uploadedBy,
  parentDeliverableId,  // ← linked-list approach (fragile)
}
```

### 3.2 What Needs to Change

**Separate concerns: Deliverable identity vs. Version data.**

```
deliverables (identity + current state):
  - projectId, name, description
  - currentVersion (number)
  - latestVersionId (reference to deliverableVersions)
  - status (reflects the latest version's review state)

deliverableVersions (NEW table — one row per physical file):
  - deliverableId (→ deliverables)
  - versionNumber (1, 2, 3...)
  - minioKey, sizeBytes, mimeType
  - uploadedBy
  - uploadedByRole ("admin" | "employee")
  - description / notes
  - status (optional — per-version QC status)
```

---

## 4. Impact Assessment

### 4.1 What Breaks Without This Fix

| Issue                                                                                                     | Severity    | Affected Roles |
| --------------------------------------------------------------------------------------------------------- | ----------- | -------------- |
| Deliverables list shows duplicates (D1 V1 + D1 V2 appear as separate items)                               | 🔴 Critical | Admin, Studio  |
| Studio reviews wrong version (sees V1 when V2 is the corrected one)                                       | 🔴 Critical | Studio         |
| No clear "which version am I looking at?" indicator from a single deliverable                             | 🟡 Major    | All            |
| `getClientDeliverables` query filters `status === "approved"` — only shows ONE version, potentially stale | 🔴 Critical | Studio         |
| Version count on project tracks project-level versions, not per-deliverable                               | 🟡 Major    | Admin          |
| Employee's "Corrected Upload" creates orphan deliverables                                                 | 🔴 Critical | Employee       |

### 4.2 What Works Correctly Today

- ✅ `versionRequests` table is well-designed (per-deliverable, tracks who requested)
- ✅ `createVersionRequest` mutation correctly differentiates admin vs. studio
- ✅ Status transitions (project action states) are reasonable
- ✅ Handoff logs capture the workflow transitions
- ✅ Reference image upload for version requests works

---

## 5. Remediation Plan

### Phase 1: Schema Migration (Backend)

#### 5.1.1 Create `deliverableVersions` Table

```typescript
deliverableVersions: defineTable({
  deliverableId: v.id("deliverables"),
  projectId: v.id("projects"),
  versionNumber: v.number(),
  minioKey: v.string(),
  sizeBytes: v.number(),
  mimeType: v.optional(v.string()),
  uploadedBy: v.id("profiles"),
  uploadedByRole: v.union(v.literal("admin"), v.literal("employee")),
  description: v.optional(v.string()),
  // Per-version QC
  qcStatus: v.optional(
    v.union(
      v.literal("pending_qc"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  ),
  qcReviewedBy: v.optional(v.id("profiles")),
  qcNotes: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_deliverableId", ["deliverableId"])
  .index("by_projectId", ["projectId"]);
```

#### 5.1.2 Update `deliverables` Table

Remove version-specific fields, add version tracking:

```diff
deliverables: defineTable({
  projectId: v.id("projects"),
  name: v.string(),
  description: v.optional(v.string()),
- version: v.number(),
+ currentVersion: v.number(),          // Latest version number
+ latestVersionId: v.optional(v.id("deliverableVersions")),
  status: deliverableStatusValidator,
- minioKey: v.string(),                // MOVED to deliverableVersions
- sizeBytes: v.number(),               // MOVED to deliverableVersions
- mimeType: v.optional(v.string()),    // MOVED to deliverableVersions
  uploadedBy: v.id("profiles"),        // Original uploader
  qcReviewedBy: v.optional(v.id("profiles")),
  qcNotes: v.optional(v.string()),
  versionFeedback: v.optional(v.string()),
  rejectionNotes: v.optional(v.string()),
- parentDeliverableId: v.optional(v.id("deliverables")), // NO LONGER NEEDED
})
```

### Phase 2: Mutation Updates (Backend)

#### 5.2.1 `uploadDeliverable` — Initial Upload

- Create deliverable row with `currentVersion: 1`
- Create deliverableVersions row for V1
- Set `latestVersionId` on deliverable

#### 5.2.2 `uploadCorrectedVersion` → Rename to `uploadNewVersion`

- **DO NOT** create a new deliverable row
- Create a new `deliverableVersions` row (V2, V3, etc.)
- **UPDATE** the existing deliverable: increment `currentVersion`, update `latestVersionId`, reset `status` to `pending_qc`
- Resolve pending versionRequests (keep existing logic)

#### 5.2.3 New: `adminUploadVersion`

- Same as `uploadNewVersion` but allows admin to upload directly
- Sets `uploadedByRole: "admin"`
- Can optionally skip QC (auto-approve) since admin is doing it

### Phase 3: Query Updates (Backend)

#### 5.3.1 `getProjectDeliverables`

- No longer needs to filter out "child" deliverables
- Each deliverable is unique; include `currentVersion` and latest file info from joined `deliverableVersions`

#### 5.3.2 `getDeliverable`

- Join with `deliverableVersions` to include current file details (minioKey, sizeBytes, mimeType)

#### 5.3.3 `getDeliverableVersions`

- Query `deliverableVersions` table by `deliverableId` instead of matching by name
- Much simpler and more reliable

#### 5.3.4 `getClientDeliverables`

- Only shows deliverables where `status === "approved"`
- Joins with latest version to get file URL

### Phase 4: Frontend Updates

#### 5.4.1 Admin Deliverables List

- Remove duplicate entries (automatic — schema fix resolves this)
- Show `v{currentVersion}` badge on each deliverable card

#### 5.4.2 Admin Deliverable Detail View

- "Version History" tab shows all `deliverableVersions` for this deliverable
- Preview shows the LATEST version's file
- Can navigate between versions (V1, V2, V3 tabs/switcher)

#### 5.4.3 Employee Versions Workspace

- `CorrectedUpload` calls `uploadNewVersion` instead of `uploadCorrectedVersion`
- The upload UPDATES D1 in-place (conceptually)

#### 5.4.4 Studio Review

- Studio sees ONE card per deliverable (not duplicates)
- Card shows current version number
- "Request Changes" still creates a `versionRequest` (no change needed here)

### Phase 5: Studio → Admin Alert Flow (New Feature)

#### 5.5.1 When Studio Requests Changes

Current: `createVersionRequest` with `requestedByRole: "studio"` → transitions project to `versions_requested` → awaits employee.

**Problem**: Studio changes should go to admin FIRST, not directly to employee.

**Fix**:

```diff
// In createVersionRequest, when isStudio:
- awaitingActorRole: "employee",
- awaitingActorId: project.assignedEmployeeId,
+ awaitingActorRole: "admin",       // Admin triages first
+ awaitingActorId: undefined,       // Goes to admin pool
```

#### 5.5.2 Admin Triage of Studio Requests

Admin sees the version request and can:

1. **Delegate to Employee**: Reassign `awaitingActorRole: "employee"`
2. **Handle Themselves**: Upload corrected version directly (new `adminUploadVersion`)

---

## 6. Data Migration Strategy

For existing data in the current flawed state:

1. Query all deliverables
2. Group by `name + projectId`
3. For each group:
   - The one WITHOUT `parentDeliverableId` is the "root" deliverable
   - Create `deliverableVersions` entries for each version
   - Update root deliverable to reflect latest version
   - Delete child deliverable rows (now in `deliverableVersions`)

**Note**: This should be done as a one-time Convex migration mutation.

---

## 7. UX Design Considerations

### 7.1 Deliverable Card (Admin & Studio)

```
┌─────────────────────────────────────────┐
│  🖼️  [File Preview Thumbnail]           │
│                                         │
│  photo-001.jpg                          │
│  v3  ·  Pending QC  ·  12.4 MB         │
│                                         │
│  [Version History ▸]  [3 versions]      │
│                                         │
│  [Approve]  [Request Changes]           │
└─────────────────────────────────────────┘
```

### 7.2 Version History Panel (Inline/Sidebar)

```
┌─────────────────────────────────────────┐
│  VERSION HISTORY — photo-001.jpg        │
├─────────────────────────────────────────┤
│  V3 (Current) ● Pending QC             │
│    Uploaded by Admin · Feb 12           │
│    "Fixed color correction"             │
│                                         │
│  V2 ○ Rejected                          │
│    Uploaded by John (Employee) · Feb 11 │
│    "Applied feedback changes"           │
│                                         │
│  V1 ○ Version Requested                 │
│    Uploaded by John (Employee) · Feb 10 │
│    Original upload                      │
└─────────────────────────────────────────┘
```

### 7.3 Studio Version Request Alert → Admin Dashboard

```
┌─────────────────────────────────────────┐
│  ⚠️  STUDIO REQUEST — Action Required   │
│                                         │
│  Studio "XYZ" requested changes to:     │
│  📄 photo-001.jpg (Project: Wedding A)  │
│                                         │
│  "Colors too warm, need cooler tones"   │
│  📎 2 reference images attached         │
│                                         │
│  [Assign to Employee ▸]  [Upload Fix]   │
└─────────────────────────────────────────┘
```

---

## 8. Implementation Priority & Task Breakdown

| #   | Task                                                                     | Effort | Priority |
| --- | ------------------------------------------------------------------------ | ------ | -------- |
| 1   | Create `deliverableVersions` table in schema                             | S      | 🔴 P0    |
| 2   | Update `deliverables` table schema (add currentVersion, latestVersionId) | S      | 🔴 P0    |
| 3   | Write data migration mutation                                            | M      | 🔴 P0    |
| 4   | Refactor `uploadDeliverable` to create version row                       | M      | 🔴 P0    |
| 5   | Refactor `uploadCorrectedVersion` to update-in-place                     | M      | 🔴 P0    |
| 6   | Create `adminUploadVersion` mutation                                     | S      | 🟡 P1    |
| 7   | Update all queries to join with `deliverableVersions`                    | M      | 🔴 P0    |
| 8   | Fix studio `createVersionRequest` to route to admin first                | S      | 🟡 P1    |
| 9   | Update Admin deliverables list (remove duplication)                      | S      | 🔴 P0    |
| 10  | Update Admin deliverable detail (version switcher)                       | M      | 🟡 P1    |
| 11  | Update Employee corrected upload flow                                    | S      | 🔴 P0    |
| 12  | Update Studio review cards                                               | S      | 🔴 P0    |
| 13  | Admin triage screen for studio requests                                  | L      | 🟢 P2    |
| 14  | Remove `parentDeliverableId` usage                                       | S      | 🟢 P2    |

**Effort Legend**: S = Small (< 1h), M = Medium (1-3h), L = Large (3-6h)

---

## 9. Risk Assessment

| Risk                                                          | Mitigation                                     |
| ------------------------------------------------------------- | ---------------------------------------------- |
| Data migration corrupts existing deliverables                 | Run migration on dev first; backup before prod |
| Breaking changes to queries used across admin/studio/employee | Update all consumers in same PR                |
| `parentDeliverableId` removal breaks existing references      | Keep field optional, deprecate gradually       |
| Studio requests going to admin adds bottleneck                | Admin dashboard alert makes triage fast        |

---

## 10. Decision Points (Needs User Input)

1. **Should we keep `minioKey`/`sizeBytes`/`mimeType` on the `deliverables` table as a cache of the latest version?** (Simplifies queries at the cost of data duplication)

2. **When admin uploads a version themselves, should it auto-approve (skip QC)?** (Since admin IS the QC, it may make sense)

3. **Should the data migration be run immediately, or should we support both patterns during transition?** (Clean break vs. gradual migration)

4. **Do we want a notification system for studio→admin alerts, or is the dashboard sufficient for now?**
