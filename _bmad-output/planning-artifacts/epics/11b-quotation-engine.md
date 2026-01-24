# Epic 11B: Quotation Engine Enhancements

**Parent Epic**: [11: System Architecture Revamp](./11-system-restructuring-revamp.md)  
**Status**: Pending (Blocked by 11A)  
**Created**: 2026-01-23  
**Complexity**: High  
**Estimated Points**: 21

---

## 📋 Epic Summary

This epic enhances the existing Quotation system (Epic 4) to support **project-spawning configuration**. When a quotation is approved, the system automatically creates linked projects based on the line item configurations.

---

## 🎯 User Outcomes

| Role       | Outcome                                              |
| :--------- | :--------------------------------------------------- |
| **Admin**  | Configure which quotation line items create projects |
| **Admin**  | Select folder templates during quote configuration   |
| **System** | Automatically create projects when quote is approved |
| **Studio** | See their projects immediately after quote approval  |

---

## 📝 User Stories

### Story 11B.1: Admin UI — Link Line Items to Project Types

**Points**: 5

**As an** Admin,  
**I want** to specify which project type a quotation line item should spawn,  
**So that** the correct project is created when the quote is approved.

**Acceptance Criteria**:

- [ ] In the Quotation Template Builder, each line item row has a "Project Link" section.
- [ ] The section contains:
  - Toggle: "Spawns Project" (default: off)
  - Dropdown: "Project Type" (only shown when toggle is on)
- [ ] Dropdown fetches from `projectTypes` (active only).
- [ ] Some line items (e.g., "Extra Storage", "USB Delivery") should NOT spawn projects.
- [ ] Changes are saved to `quotationTemplates.lineItems[].spawnsProject` and `.projectTypeId`.

**Technical Notes**:

- File: `src/components/modules/admin/quotations/builder/line-item-row.tsx`
- Query: `api.projectTypes.getActive`

---

### Story 11B.2: Admin UI — Select Folder Template per Spawnable Item

**Points**: 5

**As an** Admin,  
**I want** to select a folder template for each project-spawning line item,  
**So that** the created project has the right folder structure.

**Acceptance Criteria**:

- [ ] When "Spawns Project" is enabled, show "Folder Template" dropdown.
- [ ] Dropdown filters templates by the selected `projectTypeId`.
- [ ] If `variant` is set on templates, group or label them in the dropdown.
- [ ] Selected template ID saved to `lineItems[].selectedFolderTemplateId`.
- [ ] Default selection: The folder template with `isDefault: true` for that project type.

**Technical Notes**:

- File: `src/components/modules/admin/quotations/builder/line-item-row.tsx`
- Query: `api.folderTemplates.getByProjectType`

---

### Story 11B.3: Backend — Project Spawning on Quote Approval

**Points**: 8

**As a** System,  
**I want** to automatically create projects when a quotation is approved,  
**So that** Studios don't need to manually request projects.

**Acceptance Criteria**:

- [ ] Modify `approveQuotation` mutation in `convex/functions/quotations/mutations.ts`.
- [ ] After status change to `approved`, iterate through `quotation.lineItems`.
- [ ] For each item where `spawnsProject === true`:
  - Generate project code using existing `generateProjectCode`.
  - Create project record with:
    - `projectTypeId` from line item
    - `clientId` from quotation
    - `quotationId` linking to this quotation
    - `endClientName` from quotation (new field or derived)
    - `source: 'quotation_spawned'` (new literal)
    - `actionState: 'storage_allocated'` (skip quote steps)
  - Call `setupProjectFolders` with `selectedFolderTemplateId` from line item.
- [ ] Return list of created project IDs.
- [ ] Log project creation in status history.
- [ ] If no spawnable items, proceed without error (service-only quote).

**Technical Notes**:

- File: `convex/functions/quotations/mutations.ts`
- Add new source literal: `quotation_spawned` to `projectSourceValidator`.
- Consider extracting spawning logic to `convex/functions/projects/mutation/fromQuotation.ts`.

**Edge Cases**:

- Quotation with 0 spawnable items → Valid (e.g., "Camera Rental Only" package).
- Same project type in multiple line items → Create multiple projects (each gets unique code).

---

### Story 11B.4: Display Spawned Projects on Quotation Detail

**Points**: 3

**As an** Admin or Studio,  
**I want** to see which projects were created from a quotation,  
**So that** I can navigate to them directly.

**Acceptance Criteria**:

- [ ] On Quotation Detail page, add "Generated Projects" section.
- [ ] Query projects where `quotationId === thisQuotation._id`.
- [ ] Display: Project Code, Type, Current Phase, Link to project.
- [ ] If no projects, show "No projects generated" or hide section.
- [ ] Real-time subscription to update if projects are created.

**Technical Notes**:

- File: `src/app/(protected)/@admin/quotations/[quotationId]/page.tsx`
- Query: `api.projects.getByQuotationId` (new query needed)

---

## ✅ Definition of Done

- [ ] Admin can configure project types on quotation line items.
- [ ] Admin can select folder templates for spawnable items.
- [ ] Approving a quotation creates the expected projects.
- [ ] Created projects are linked to the quotation.
- [ ] UI displays the relationship clearly.

---

## 🔗 Dependencies

| Depends On   | Notes                        |
| :----------- | :--------------------------- |
| **Epic 11A** | Schema must be updated first |

| Blocks                                                       |
| :----------------------------------------------------------- |
| Epic 11C (indirectly — Studio needs to see spawned projects) |

---

## 🔄 Integration Points

| Existing Component                      | Change Required                            |
| :-------------------------------------- | :----------------------------------------- |
| `approveQuotation` mutation             | Add project spawning logic                 |
| `setupProjectFolders` mutation          | Called programmatically for each project   |
| `transitionProjectsForQuotation` helper | May need update for new source type        |
| Quotation Builder UI                    | Add project type/folder template selectors |

---

_Document Version: 1.0_  
_Last Updated: 2026-01-23_
