# Story 16-7: Remediate In-Place Versioning Logic

**Epic**: Epic 16 - Deliverable Revision Workflow  
**Status**: done  
**Complexity**: Medium (5 points)  
**Created**: 2026-02-12  
**Priority**: MUST — Fixes core architectural flaw in versioning

---

## 📋 User Story

**As a** Studio or Admin,  
**I want** revised versions of a deliverable to be associated with the original entity instead of appearing as new deliverables,  
**So that** the project delivery timeline is clean, history is preserved linearly, and I don't see duplicate files in the UI.

---

## 🔗 Dependencies & Context

### Prerequisites

- [x] **16-1 Schema**: Base `versionRequests` table.
- [x] **16-3 Employee Workspace**: Upload interface for employees.

### Current Problem

Correction uploads were previously using `ctx.db.insert("deliverables", { ... })` for every version, creating a new "child" deliverable on every revision. This led to:

1. **Duplicates**: One file with 3 versions appeared as 3 separate deliverables in the list.
2. **Approval Chaos**: Status was spread across different records.
3. **Linearity**: No single "source of truth" for a deliverable's lifecycle.

---

## ✅ Acceptance Criteria

### AC1: In-Place Updates

- [x] `uploadCorrectedVersion` mutation UPDATES the original deliverable record via `ctx.db.patch`.
- [x] Decremented use of `parentDeliverableId` for new data (marked as deprecated).
- [x] All file metadata (minioKey, sizeBytes, mimeType) is cached on the root deliverable record for performance.

### AC2: Version History Table

- [x] New `deliverableVersions` table records every file upload (V1, V2, etc.).
- [x] Every upload (initial or corrected) creates a row in `deliverableVersions`.
- [x] Deliverable identity persists in the `deliverables` table; physical assets persist in `deliverableVersions`.

### AC3: UI Consolidation

- [x] List views (`getProjectDeliverables`, `getClientDeliverables`) filter out legacy child deliverables.
- [x] `VersionHistory` component renders inline version pills from the dedicated versions table.
- [x] No more duplicate entries in the Admin or Studio deliverables list.

### AC4: Studio-to-Admin Triage

- [x] Studio version requests now route to **Admin** for triage instead of directly to employees.
- [x] Project state transitions to `versions_requested` with `awaitingActorRole: "admin"`.

### AC5: Data Migration

- [x] Migration mutation `migrateDeliverableVersions` implemented and executed.
- [x] Correctly moved existing child deliverable data into the new versions table.

---

## 📘 Implementation Summary

### Backend Cache Strategy

The `deliverables` table maintains a cache of the _latest_ version's metadata (`minioKey`, `sizeBytes`, etc.). This allows the main list view to remain high-performance without needing joins for every row, while `deliverableVersions` provides the full audit trail and historical file access.

### Routing Logic

When a Studio user clicks "Request Changes":

1. `createVersionRequest` is called.
2. Deliverable status sets to `version_needed`.
3. Project state moves to `versions_requested`.
4. `awaitingActorRole` set to `admin`.
5. Admin is alerted via dashboard to either delegate to the employee or upload a fix directly.

---

## 📊 Results

- **Data Integrity**: Linear version history (V1 → V2 → V3) on a single object.
- **UI Clarity**: Clean deliverable list with version badges.
- **Workflow Control**: Admin acts as a quality gate for Studio feedback.
