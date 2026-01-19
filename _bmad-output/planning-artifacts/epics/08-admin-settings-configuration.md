# Epic 8: Admin Settings & Configuration Management

## Epic Overview

- **ID**: 08-admin-settings-configuration
- **Status**: backlog
- **Priority**: medium
- **Estimated Points**: 26
- **Depends On**: Epic 3 (Admin Dashboard Layout), Epic 5A (for delivery config)

## Business Value

Enable administrators to manage system configuration without code changes, including project types, dynamic form fields, storage tiers, folder templates, and **delivery configuration**. This reduces development overhead and empowers business users to adapt the system to changing needs.

---

## Functional Requirements

### FR-4.1: Project Types Management

- CRUD operations for project types
- Enable/disable project types
- Reorder display order
- Assign default folder templates
- **NEW: Configure delivery settings (Epic 5A integration)**

### FR-4.2: Dynamic Field Management

- Manage fields for each project type
- Add/edit/delete field definitions
- Configure field types (text, number, select, checkbox, textarea)
- Manage select options
- Set validation rules (required, min, max)
- Reorder field display order

### FR-4.3: Storage Tiers Management

- CRUD for storage tier packages
- Set storage sizes and pricing
- Enable/disable tiers

### FR-4.4: Folder Templates Management

- Create reusable folder structures
- Edit folder hierarchy
- Assign to project types

### FR-4.5: Delivery Configuration (NEW - Epic 5A Integration)

- Configure delivery type per project type
- Set physical delivery options (album, prints, USB)
- Set digital delivery options
- Configure delivery labels for UI
- Set signoff requirements

---

## Scope

### In Scope

- Admin UI for project type CRUD with delivery config
- Admin UI for field definitions CRUD
- Admin UI for storage tiers
- Admin UI for folder templates
- Validation and error handling
- Audit logging for changes
- **Delivery configuration per project type**

### Out of Scope

- Advanced field types (array-from-count, repeaters) - moved to Epic 9
- Field conditionals and dependencies
- Bulk import/export

---

## Acceptance Criteria

### AC-4.1: Project Types Management

- [ ] Admin can view all project types in a list
- [ ] Admin can create new project type with name and category
- [ ] Admin can edit existing project type
- [ ] Admin can enable/disable project type
- [ ] Admin can reorder project types
- [ ] **Changes reflect immediately in client wizard**

### AC-4.2: Dynamic Field Management

- [ ] Admin can view fields for each project type
- [ ] Admin can add new field with all properties
- [ ] Admin can edit existing field properties
- [ ] Admin can delete unused fields (soft delete if data exists)
- [ ] Admin can reorder fields via drag-and-drop
- [ ] Admin can manage select options for dropdown fields
- [ ] Field preview shows how it will appear in wizard

### AC-4.3: Storage Tiers

- [ ] Admin can view all storage tiers
- [ ] Admin can create/edit/delete tiers
- [ ] Admin can set pricing in INR
- [ ] Admin can enable/disable tiers

### AC-4.4: Folder Templates

- [ ] Admin can view all templates
- [ ] Admin can create template with folder structure
- [ ] Admin can edit folder hierarchy
- [ ] Admin can assign template to project types

### AC-4.5: Delivery Configuration (NEW)

- [ ] Admin can configure delivery type when editing project type
- [ ] Admin can set `hasPhysicalDelivery: boolean`
- [ ] Admin can set `physicalDeliveryLabel: string` (e.g., "Album Production")
- [ ] Admin can set `hasDigitalDelivery: boolean`
- [ ] Admin can set `digitalDeliveryLabel: string` (e.g., "File Delivery")
- [ ] Admin can set `requiresSignoff: boolean`
- [ ] Preview shows how delivery phase will appear in project

---

## Stories

| Story ID | Title                           | Points | Status  |
| -------- | ------------------------------- | ------ | ------- |
| 8-1      | Project Types Admin CRUD        | 5      | backlog |
| 8-2      | Dynamic Fields Admin CRUD       | 8      | backlog |
| 8-3      | Storage Tiers Admin CRUD        | 3      | backlog |
| 8-4      | Folder Templates Admin CRUD     | 5      | backlog |
| 8-5      | Delivery Configuration UI (NEW) | 5      | backlog |

---

## Story 8-5: Delivery Configuration UI (NEW)

**As an** Admin,
**I want** to configure how the delivery phase works for each project type,
**So that** projects show context-appropriate labels (e.g., "Album Production" vs "Video Rendering").

**Acceptance Criteria:**

**Given** I am editing a project type
**When** I navigate to the "Delivery Settings" section
**Then** I must see toggle options for:

- Has Physical Delivery (album, prints, USB)
- Physical Delivery Label (text input)
- Has Digital Delivery (file download)
- Digital Delivery Label (text input)
- Requires Client Signoff (checkbox)
  **And** a preview must show how the delivery phase will display in project detail.

**Given** I save a project type with `hasPhysicalDelivery: true` and `physicalDeliveryLabel: "Album Production"`
**When** a project of this type reaches `actionState: 'preparing_delivery'`
**Then** the UI must show "Album Production" instead of generic "Preparing Delivery".

---

## Dependencies

| Dependency               | Status   | Notes                  |
| ------------------------ | -------- | ---------------------- |
| Epic 2: Client Portal    | Required | Wizard flow            |
| Epic 3: Admin Dashboard  | Required | Admin layout           |
| Epic 5A: Status Workflow | Required | Delivery config schema |

---

## Technical Notes

- Use same UI patterns as existing admin components
- All mutations should validate admin role
- Implement optimistic updates for better UX
- Add audit trail entries for configuration changes
- Delivery config stored in `projectTypes.deliveryConfig` (Epic 5A schema)

---

## UX Design Notes

- Two-panel layout: List on left, detail/edit form on right
- Inline editing for quick changes
- Modal dialogs for complex operations
- Toast notifications for feedback
- Confirmation dialogs for destructive actions
- **Delivery config as collapsible section in project type editor**
