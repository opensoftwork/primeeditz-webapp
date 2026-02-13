# Epic 18: Dual-Track Versioning System

**Status**: In Progress
**Owner**: Antigravity
**Created**: 2026-02-13

## 📋 Overview

The PrimeEditz system requires two distinct versioning tracks for deliverables to maintain professional separation between internal quality control (QC) and client-facing revisions.

1.  **Internal Track (Admin ↔ Employee)**: Rapid QC cycles between admin and employee. Internal versions (v1, v2, v3...) increment on every re-upload.
2.  **External Track (Studio ↔ Admin)**: Controlled revision cycles between studio and admin. The first "Send to Studio" event starts `studioVersion` at 1, regardless of how many internal versions exist. Subsequent "Send to Studio" events increment the `studioVersion`.

## 🎯 Objectives

- [ ] Implement dual version counters: `version` (internal) and `studioVersion` (external).
- [ ] Ensure `studioVersion` starts at 1 upon the first "Publication" (Send to Studio).
- [ ] Provide admin visibility into both version tracks via a dual-badge UI.
- [ ] Maintain a clean, professional studio view that only shows external-scope versions.
- [ ] Update backend logic to correctly increment each counter at the appropriate lifecycle stage.

## 🏗️ Technical Architecture

### Schema Enhancements

- **`deliverables`**: Add `studioVersion` (number).
- **`deliverableVersions`**: Add `studioVersionNumber` (number) and `scope` (internal/external).

### Key Lifecycle Events

- **QC Upload (Employee)**: Increments internal `version`. Increments `studioVersion` ONLY if it hasn't been set yet (initial upload)? NO, the user said "First Send to Studio starts studioVersion at 1". So initial upload has `studioVersion: undefined`.
- **Send to Studio (Admin)**: Sets `studioVersion` to 1 if it's the first time, or increments it. Tags the current file version as `scope: external`.
- **Studio Revision Request**: Admin triages and assigns to employee. New internal versions are created during fix.
- **Resend to Studio**: Admin approves fix and sends to studio. `studioVersion` increments.

## 📝 Stories

- [ ] **18-1: Dual-Track Schema and Logic** (Backend migration, mutations, and queries)
- [ ] **18-2: Admin Dual-Version Badge UI** (Dashboard and Detail view enhancements)
- [ ] **18-3: Studio Version Filter UI** (Detail view and Version History filtering)

---

## 🔄 Status History

- **2026-02-13**: Epic initialized based on user requirements.
