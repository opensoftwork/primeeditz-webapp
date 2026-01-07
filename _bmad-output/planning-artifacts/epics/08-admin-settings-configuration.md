# Epic 8: Admin Settings & Configuration Management

## Epic Overview

- **ID**: 08-admin-settings-configuration
- **Status**: backlog
- **Priority**: medium
- **Estimated Points**: 21

## Business Value

Enable administrators to manage system configuration without code changes, including project types, dynamic form fields, storage tiers, and folder templates. This reduces development overhead and empowers business users to adapt the system to changing needs.

## Functional Requirements

### FR-4.1: Project Types Management

- CRUD operations for project types
- Enable/disable project types
- Reorder display order
- Assign default folder templates

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

## Scope

### In Scope

- Admin UI for project type CRUD
- Admin UI for field definitions CRUD
- Admin UI for storage tiers
- Admin UI for folder templates
- Validation and error handling
- Audit logging for changes

### Out of Scope

- Advanced field types (array-from-count, repeaters) - moved to Epic 9
- Field conditionals and dependencies
- Bulk import/export

## Acceptance Criteria

### AC-4.1: Project Types Management

- [ ] Admin can view all project types in a list
- [ ] Admin can create new project type with name and category
- [ ] Admin can edit existing project type
- [ ] Admin can enable/disable project type
- [ ] Admin can reorder project types
- [ ] Changes reflect immediately in client wizard

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

## Stories

| Story ID | Title                       | Points | Status  |
| -------- | --------------------------- | ------ | ------- |
| 8-1      | Project Types Admin CRUD    | 5      | backlog |
| 8-2      | Dynamic Fields Admin CRUD   | 8      | backlog |
| 8-3      | Storage Tiers Admin CRUD    | 3      | backlog |
| 8-4      | Folder Templates Admin CRUD | 5      | backlog |

## Dependencies

- Epic 2: Client Portal (complete wizard flow)
- Epic 3: Admin Dashboard Layout

## Technical Notes

- Use same UI patterns as existing admin components
- All mutations should validate admin role
- Implement optimistic updates for better UX
- Add audit trail entries for configuration changes

## UX Design Notes

- Two-panel layout: List on left, detail/edit form on right
- Inline editing for quick changes
- Modal dialogs for complex operations
- Toast notifications for feedback
- Confirmation dialogs for destructive actions
