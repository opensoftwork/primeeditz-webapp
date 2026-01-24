# Epic 11D: Terminology & Routing Cleanup

**Parent Epic**: [11: System Architecture Revamp](./11-system-restructuring-revamp.md)  
**Status**: Pending (Blocked by 11A, 11C)  
**Created**: 2026-01-23  
**Complexity**: Medium  
**Estimated Points**: 13

---

## 📋 Epic Summary

This **final cleanup epic** completes the rebranding from "Client" to "Studio" across the entire codebase. It should be executed **after the core functionality is validated** to avoid churn during development.

---

## 🎯 User Outcomes

| Role          | Outcome                                         |
| :------------ | :---------------------------------------------- |
| **Studio**    | UI consistently refers to them as "Studio"      |
| **Developer** | Codebase uses `studio` terminology consistently |
| **Admin**     | Dashboard shows "Studios" instead of "Clients"  |

---

## 📝 User Stories

### Story 11D.1: Remove `client` from Role Validator

**Points**: 2

**As a** Developer,  
**I want** to remove the deprecated `client` role from the schema,  
**So that** only `studio` is valid going forward.

**Acceptance Criteria**:

- [ ] **Pre-requisite**: Run `migrateClientToStudio` mutation (Story 11A.6).
- [ ] Verify NO profiles have `role = 'client'`.
- [ ] Update `roleValidator` to:
  ```typescript
  export const roleValidator = v.union(
    v.literal("studio"),
    v.literal("employee"),
    v.literal("admin"),
  );
  ```
- [ ] Update TypeScript types derived from the validator.
- [ ] Deploy and verify no runtime errors.

**Technical Notes**:

- File: `convex/schema.ts`
- This is a **breaking change** if migration not completed.

---

### Story 11D.2: Rename `@client` Route Folder to `@studio`

**Points**: 3

**As a** Developer,  
**I want** to rename the route folder from `@client` to `@studio`,  
**So that** URLs and code reflect the new terminology.

**Acceptance Criteria**:

- [ ] Rename `src/app/(protected)/@client` → `src/app/(protected)/@studio`.
- [ ] Update all internal imports within the folder.
- [ ] Verify routes work: `/studio/dashboard`, `/studio/projects`, `/studio/quotes`.
- [ ] Update any hardcoded URLs in navigation or links.

**Technical Notes**:

- Git should handle the rename cleanly.
- Check for any relative imports that might break.

---

### Story 11D.3: Update Layout Slot References

**Points**: 2

**As a** Developer,  
**I want** the layout to render the `@studio` slot correctly,  
**So that** the new routes are accessible.

**Acceptance Criteria**:

- [ ] Update `src/app/(protected)/layout.tsx`:
  - Change prop: `client: React.ReactNode` → `studio: React.ReactNode`
  - Change interface: `DashboardLayoutProps.client` → `.studio`
  - Change case: `case "client": return client;` → `case "studio": return studio;`
- [ ] Verify role-based routing works for all three roles.

**Technical Notes**:

- File: `src/app/(protected)/layout.tsx` (lines 27-134)

---

### Story 11D.4: Rename Backend Function Wrappers

**Points**: 3

**As a** Developer,  
**I want** backend function wrappers to use `studio` terminology,  
**So that** the codebase is consistent.

**Acceptance Criteria**:

- [ ] In `convex/lib/customFunctions.ts`:
  - Rename `clientMutation` → `studioMutation`
  - Rename `clientQuery` → `studioQuery`
- [ ] Update all usages across the codebase:
  - Use find/replace with review
  - Expected ~20-30 files
- [ ] Verify all tests (if any) pass.
- [ ] Verify existing Studio functionality works.

**Technical Notes**:

- Files: `convex/lib/customFunctions.ts`, all files using these functions.
- Use IDE refactoring tools for safety.

---

### Story 11D.5: UI Label Pass — Global Text Update

**Points**: 3

**As a** User,  
**I want** all UI text to say "Studio" instead of "Client",  
**So that** the branding is consistent.

**Acceptance Criteria**:

- [ ] Search and replace in `src/` for UI strings:
  - "Client" → "Studio"
  - "client" → "studio" (in labels, not code)
- [ ] Review each occurrence to ensure it's a user-facing label, not:
  - Variable names (handled by 11D.4)
  - Comments (optional to update)
  - Third-party library references
- [ ] Update sidebar navigation labels.
- [ ] Update breadcrumb labels.
- [ ] Update dashboard cards / headers.
- [ ] Update admin pages that reference "Clients" (e.g., client listing).

**Technical Notes**:

- Focus on:
  - `src/components/modules/sidebar/`
  - `src/components/modules/admin/clients/`
  - `src/app/(protected)/@admin/clients/`

---

## ✅ Definition of Done

- [ ] No references to `client` role in schema.
- [ ] All routes use `@studio` folder.
- [ ] Layout renders `@studio` slot.
- [ ] Backend wrappers use `studio*` naming.
- [ ] All user-facing text says "Studio".

---

## 🔗 Dependencies

| Depends On     | Notes                                      |
| :------------- | :----------------------------------------- |
| **Epic 11A.6** | Migration must be complete before 11D.1    |
| **Epic 11C**   | Portal should be working before rebranding |

---

## ⚠️ Risk Mitigation

| Risk                           | Mitigation                                    |
| :----------------------------- | :-------------------------------------------- |
| Broken links after rename      | Run full app walkthrough before merge         |
| Missed text occurrences        | Use grep/ripgrep to find all "client" strings |
| Runtime errors from role check | Add comprehensive error handling              |

---

## 📋 Checklist: Text Locations to Update

- [ ] Sidebar navigation labels
- [ ] Dashboard page titles
- [ ] Data table column headers
- [ ] Form labels and placeholders
- [ ] Toast/notification messages
- [ ] Error messages
- [ ] Modal/dialog titles
- [ ] Breadcrumb segments
- [ ] Page metadata (titles)
- [ ] Admin "Clients" section → "Studios"

---

_Document Version: 1.0_  
_Last Updated: 2026-01-23_
