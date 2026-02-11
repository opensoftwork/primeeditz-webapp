# Story 5-5: Storage Limit Enforcement

**Epic**: Epic 5 - Asset Upload & Folder Management  
**Status**: ready-for-dev  
**Complexity**: Medium (4 points)  
**Created**: 2026-01-18  
**Priority**: MUST — Cost control and business rule

---

## 📋 User Story

**As a** System,  
**I want** to enforce storage limits based on the quotation storage pool,  
**So that** clients do not exceed their allocated storage and costs are controlled.

---

## 🔗 Dependencies & Context

### Prerequisites

| Depends On                       | Status  | Notes                |
| -------------------------------- | ------- | -------------------- |
| **3-15 - Storage Pool Tracking** | ✅ Done | Quota data available |
| **5-3 - File Upload**            | Pending | Upload mechanism     |
| **5-4 - Upload Validation**      | Pending | Validation framework |

### Enables

| Story / Epic             | Notes                       |
| ------------------------ | --------------------------- |
| **Storage Upgrade Path** | Future: Upsell more storage |

---

## ✅ Acceptance Criteria

### AC1: Pre-Flight Storage Check

- [ ] **Given** a project with 98GB used of 100GB allocated
- [ ] **When** client tries to upload 5GB of files
- [ ] **Then** the system calculates `currentUsage + totalBatchSize` BEFORE generating signed URLs
- [ ] **And** if exceeds limit, reject immediately
- [ ] **And** show error: "Storage limit exceeded. You have 2GB remaining."
- [ ] **And** no upload URLs are generated

### AC2: Visual Storage Bar

- [ ] **Given** any project with storage allocation
- [ ] **Then** I see storage usage bar showing:
  - Current usage in GB
  - Total allocation in GB
  - Visual progress bar
  - Color based on usage level

### AC3: Color Coding

- [ ] **Given** storage usage levels
- [ ] **Then** colors are:
  - Green: <80% used
  - Amber/Yellow: 80-95% used
  - Red: >95% used

### AC4: Warning at High Usage

- [ ] **Given** usage is >80%
- [ ] **Then** I see warning icon and message
- [ ] **And** if >95%, show CTA: "Need more space? Contact us."

### AC5: Per-File Rejection

- [ ] **Given** batch upload where some files fit but not all
- [ ] **Then** system identifies which files would exceed limit
- [ ] **And** those files are flagged: "Would exceed storage limit"
- [ ] **And** files that fit can still upload

### AC6: Real-Time Usage Update

- [ ] **Given** files are uploading
- [ ] **Then** storage bar updates in real-time
- [ ] **And** reflects new usage after each file completes

---

## 🎨 UX Design

### Storage Bar States

```
┌─────────────────────────────────────────────────────────────────────────┐
│  💾 STORAGE                                                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │███████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ││
│  └─────────────────────────────────────────────────────────────────────┘│
│  45 GB used of 100 GB                                         45%       │
│                                                                          │
│  ● Healthy storage capacity                                             │
└─────────────────────────────────────────────────────────────────────────┘

// Warning State (80-95%)
┌─────────────────────────────────────────────────────────────────────────┐
│  💾 STORAGE                                                  ⚠️ WARNING │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │████████████████████████████████████████████████████████░░░░░░░░░░░░ ││
│  └─────────────────────────────────────────────────────────────────────┘│
│  85 GB used of 100 GB                                         85%       │
│                                                                          │
│  ⚠️ Running low on space. 15 GB remaining.                              │
└─────────────────────────────────────────────────────────────────────────┘

// Critical State (>95%)
┌─────────────────────────────────────────────────────────────────────────┐
│  💾 STORAGE                                                  🔴 CRITICAL│
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │█████████████████████████████████████████████████████████████████░░░ ││
│  └─────────────────────────────────────────────────────────────────────┘│
│  98 GB used of 100 GB                                         98%       │
│                                                                          │
│  🔴 Almost full! Only 2 GB remaining.                                   │
│                                                                          │
│  [📧 Need more space? Contact us]                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pre-Flight Rejection Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         🔴 STORAGE EXCEEDED                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Your selected files (5.2 GB) exceed available storage.                 │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Current Usage:        98 GB                                       │  │
│  │ Available:            2 GB                                        │  │
│  │ Selected Files:       5.2 GB                                      │  │
│  │ Overage:              3.2 GB                                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Options:                                                                │
│  • Remove some files from selection                                     │
│  • Contact us for storage upgrade                                       │
│                                                                          │
│                    [Cancel]     [Select Fewer Files]                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Phases

### Phase A: Storage Check Logic (~1.5 points)

#### Task A1: Storage Calculation Query

**File**: `convex/functions/storage/queries.ts`

```typescript
export const getProjectStorageUsage = clientQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Get project's quotation storage tier
    // 2. Sum all asset sizes from assets table
    // 3. Calculate percentage
    // 4. Return { used, allocated, available, percentage }
  },
});
```

- [ ] A1.1 Create `getProjectStorageUsage` query
- [ ] A1.2 Sum asset file sizes
- [ ] A1.3 Get allocated from quotation storage pool
- [ ] A1.4 Calculate percentage and available space

#### Task A2: Pre-Flight Check Utility

**File**: `src/lib/storage-check.ts`

```typescript
interface StorageCheckResult {
  canUpload: boolean;
  filesToUpload: File[];
  filesToReject: File[];
  totalSize: number;
  availableSpace: number;
  overage?: number;
}

export function checkStorageCapacity(
  files: File[],
  available: number
): StorageCheckResult { ... }
```

- [ ] A2.1 Create storage check utility
- [ ] A2.2 Calculate total batch size
- [ ] A2.3 Split files into uploadable/rejected
- [ ] A2.4 Return detailed result

#### Task A3: Enforce in Convex Action

**File**: `convex/functions/storage/actions.ts` (extend)

- [ ] A3.1 Add storage check before generating upload URL
- [ ] A3.2 Accept totalBatchSize parameter
- [ ] A3.3 Throw ConvexError if exceeds limit

---

### Phase B: UI Components (~2 points)

#### Task B1: Storage Usage Bar (Enhance)

**File**: `src/components/shared/storage-usage-bar.tsx` (from 5-1)

- [ ] B1.1 Add color state logic (green/amber/red)
- [ ] B1.2 Add warning messages
- [ ] B1.3 Add upgrade CTA for >95%
- [ ] B1.4 Add real-time update capability

#### Task B2: Storage Exceeded Modal

**File**: `src/components/modules/client/assets/storage-exceeded-modal.tsx`

- [ ] B2.1 Create modal component
- [ ] B2.2 Show usage breakdown
- [ ] B2.3 "Select Fewer Files" action
- [ ] B2.4 "Contact Us" link

#### Task B3: Per-File Storage Warning

**File**: `src/components/modules/client/assets/upload-item.tsx` (extend)

- [ ] B3.1 Add "Would exceed limit" warning state
- [ ] B3.2 Visual indicator (red border/icon)
- [ ] B3.3 Remove option

---

### Phase C: Integration (~0.5 points)

#### Task C1: Integrate in Upload Orchestrator

**File**: `src/components/modules/client/assets/upload-orchestrator.tsx`

- [ ] C1.1 Check storage before starting batch
- [ ] C1.2 Show exceeded modal if necessary
- [ ] C1.3 Filter out rejected files
- [ ] C1.4 Update storage bar after uploads

---

## 🧪 Testing Checklist

### Storage Display

- [ ] Correct usage shown
- [ ] Correct allocation shown
- [ ] Percentage matches

### Color Coding

- [ ] Green at 50% usage
- [ ] Amber at 85% usage
- [ ] Red at 98% usage

### Pre-Flight Check

- [ ] 5GB upload blocked when only 2GB available
- [ ] Clear error message shown
- [ ] Modal appears with breakdown

### Partial Upload

- [ ] If 3 files (2GB each) but only 5GB available
- [ ] First 2 files allowed, 3rd flagged
- [ ] User can choose which to keep

### Real-Time Update

- [ ] Storage bar updates after each file completes
- [ ] Color changes if threshold crossed

---

## 🚀 Definition of Done

- [ ] `getProjectStorageUsage` query working
- [ ] Storage check utility working
- [ ] Convex action enforces limit
- [ ] Storage bar with color coding
- [ ] Warning messages at thresholds
- [ ] Upgrade CTA at >95%
- [ ] Storage exceeded modal
- [ ] Per-file rejection indicators
- [ ] Real-time updates working
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                          |
| ---------- | ------------- | ------------------------------ |
| 2026-01-18 | ready-for-dev | Story created from Epic 5 plan |

---

**Previous Story**: 5-4 - Upload Progress & Validation  
**Next Story**: 5-6 - Mark Upload Complete
