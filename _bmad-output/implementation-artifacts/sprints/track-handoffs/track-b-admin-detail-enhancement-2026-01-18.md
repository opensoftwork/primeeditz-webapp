# Track B: Admin Project Detail Enhancement

**Created**: 2026-01-18  
**Track Owner**: Mid-Level Dev  
**Priority**: MEDIUM  
**Estimated Duration**: 3-4 days

---

## 📋 Track Overview

This track enhances the admin project detail page to properly display all available project data based on the schema. It restructures the page into a tabbed interface and adds dedicated pages for folders/assets.

**Key Insight**: The schema has MUCH more data than currently displayed!

---

## 🎯 Scope

### What's Missing in Current Admin Project Detail

Based on schema analysis (`convex/schema.ts`):

| Data                          | Schema Location                     | Currently Displayed? |
| ----------------------------- | ----------------------------------- | -------------------- |
| Basic info (code, name, date) | `projects`                          | ✅ Yes               |
| Client info                   | `profiles` via `clientId`           | ✅ Partial           |
| Project type                  | `projectTypes`                      | ❌ Name only         |
| Type-specific fields          | `projectTypeFields`                 | ❌ No                |
| Reference files               | `projects.referenceFiles`           | ✅ Yes               |
| Folders                       | `folders`                           | ✅ Yes (inline)      |
| Folder template               | `folderTemplates`                   | ❌ No                |
| Assets (uploaded files)       | `assets`                            | ❌ No                |
| Quotation                     | `quotations`                        | ❌ No                |
| Storage usage                 | `projects.storageUsed/Allocated`    | ⚠️ Partial           |
| Assigned employee             | `profiles` via `assignedEmployeeId` | ❌ No                |
| Deliverables                  | `deliverables`                      | ❌ No                |
| Status history                | `statusHistory`                     | ✅ Yes               |
| Soft delete info              | `projects.deletedAt/By`             | ❌ No                |

---

## 📁 New Route Structure

### Current

```
/admin/projects/[projectId]  → Single page with everything inline
```

### Proposed

```
/admin/projects/[projectId]           → Tabbed interface
/admin/projects/[projectId]/assets    → Dedicated Assets tab (or modal)
/admin/projects/[projectId]/quotes    → Quotation history
```

---

## 🎨 UI Design: Tabbed Project Detail

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROJECT: PRIME-2026-001                              Status: ACTIVE     │
│  Wedding - Rahul & Priya                              Source: CLIENT     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌────────────┐ ┌───────────┐ │
│  │ OVERVIEW  │ │  ASSETS   │ │  QUOTES   │ │DELIVERABLES│ │  HISTORY  │ │
│  └───────────┘ └───────────┘ └───────────┘ └────────────┘ └───────────┘ │
│                                                                          │
│ ─────────────────────────────────────────────────────────────────────── │
│                                                                          │
│  [TAB CONTENT HERE]                                                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Tab 1: OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PROJECT SPECIFICATIONS                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ Event Name:        Rahul & Priya Wedding                                 │
│ End Client:        Sharma Family                                         │
│ Event Date:        February 15, 2026                                     │
│ Venue:             The Grand Ballroom, Mumbai                            │
│ Project Type:      Wedding Photography + Videography                     │
│ Delivery Date:     March 1, 2026                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ TYPE-SPECIFIC DETAILS                              (from projectTypeFields)|
├─────────────────────────────────────────────────────────────────────────┤
│ Number of Albums:   3                                                    │
│ Video Duration:     30 minutes                                           │
│ Drone Coverage:     Yes                                                  │
│ Pre-Wedding Shoot:  Yes                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ CLIENT INFORMATION                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ Name:              Rahul Sharma                                          │
│ Email:             rahul@email.com                                       │
│ Phone:             +91 98765 43210                                       │
│ Company:           -                                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ ASSIGNMENT                                                               │
├─────────────────────────────────────────────────────────────────────────┤
│ Assigned To:       [Select Employee ▼]                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ NOTES                                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Description:       "We want a cinematic wedding film..."                 │
│ Additional Notes:  "Please focus on traditional ceremonies"             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tab 2: ASSETS

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STORAGE                                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ ████████████░░░░░░░░ 78 GB / 100 GB (78%)                               │
├─────────────────────────────────────────────────────────────────────────┤
│ REFERENCE FILES (from wizard)                                            │
├─────────────────────────────────────────────────────────────────────────┤
│ [📎 sample_1.jpg] [📎 reference.mp4] [📎 mood_board.pdf]                │
│                                                [View All in Vault]       │
├─────────────────────────────────────────────────────────────────────────┤
│ PROJECT FOLDERS                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐ │
│ │ 📁 Ceremony         │ │ 📁 Reception        │ │ 📁 Candid           │ │
│ │ 124 files • 25 GB   │ │ 0 files • 0 GB      │ │ 45 files • 10 GB    │ │
│ │ ✅ Complete         │ │ ⏳ Pending          │ │ 🔄 In Progress      │ │
│ │ [View Files →]      │ │ [View Files →]      │ │ [View Files →]      │ │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘ │
│                                                                          │
│ Folder Template: Wedding Standard                                        │
│                                                                          │
│ [⚙️ Manage Folders]   [📤 Upload Files (Admin)]                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tab 3: QUOTES

```
┌─────────────────────────────────────────────────────────────────────────┐
│ QUOTATION HISTORY                                                        │
├─────────────────────────────────────────────────────────────────────────┤
│ Current Quotation:  QUO-2026-0045 v2              Status: APPROVED ✅    │
│                                                                          │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ Amount:       ₹2,50,000                                             │ │
│ │ Approved:     January 15, 2026                                      │ │
│ │ Storage Tier: 100 GB                                                │ │
│ │                                                                     │ │
│ │ [View Quotation] [Download PDF]                                     │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Previous Versions:                                                       │
│ • v1 - Rejected (Jan 10) - "Budget too high"                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📘 Implementation Tasks

### Task 1: Create Tabbed Layout Component

**File**: `src/components/modules/admin/projects/project-detail/project-tabs.tsx`

- [ ] Create tab container with state
- [ ] Tab buttons with active indicator
- [ ] Lazy load tab content

### Task 2: Overview Tab (Enhance Existing)

**File**: `src/components/modules/admin/projects/project-detail/tabs/overview-tab.tsx`

- [ ] Move existing ProjectSpecs content
- [ ] Add type-specific fields display
- [ ] Add employee assignment selector
- [ ] Add full client info card

### Task 3: Assets Tab

**File**: `src/components/modules/admin/projects/project-detail/tabs/assets-tab.tsx`

- [ ] Storage usage bar
- [ ] Reference files section
- [ ] Folder grid (use shared component)
- [ ] Link to folder detail

### Task 4: Quotes Tab

**File**: `src/components/modules/admin/projects/project-detail/tabs/quotes-tab.tsx`

- [ ] Current quotation card
- [ ] Version history
- [ ] Quick actions

### Task 5: Query Enhancement

**File**: `convex/functions/admin/queries.ts`

- [ ] Enhance `getAdminProject` to include:
  - Quotation data
  - Assigned employee name
  - Project type name + fields
  - Asset counts per folder

---

## 🔗 Dependencies

| Dependency               | Status  | Notes                |
| ------------------------ | ------- | -------------------- |
| Epic 5 shared components | Pending | Can use once created |
| Quotation system         | ✅ Done | Epic 4 complete      |

---

## 🧪 Testing Checklist

- [ ] All tabs render correctly
- [ ] Tab switching is smooth
- [ ] Type-specific fields display
- [ ] Quotation info shows
- [ ] Storage bar accurate
- [ ] Folder counts accurate

---

## 📝 Notes

This track can run **parallel** with Track A (Epic 5) but will benefit from shared components created in Track A.

**Suggested Order**:

1. Wait for Track A to create shared folder components (5-1)
2. Then implement tabbed layout using those components
3. OR start with tabbed structure, use placeholder for Assets tab
