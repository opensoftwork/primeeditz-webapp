# Story 3-3: Project Type Fields Admin Management

## Story Info

- **Epic**: 3 - Admin Portal
- **Status**: backlog
- **Priority**: medium
- **Points**: 8

## User Story

As an **Admin**, I want to **manage dynamic form fields for each project type** so that **I can customize what information is collected from clients during the project request wizard without code changes**.

## Background & Context

The project wizard's Step 2 (Details) now uses database-driven field definitions from the `projectTypeFields` table. This allows the system to display different fields based on the selected project type (Wedding Album vs Birthday Album vs Corporate Event, etc.).

Currently, fields are seeded via a mutation, but admins need a user interface to:

- View existing fields for each project type
- Add new fields
- Edit field properties (label, type, required, options, etc.)
- Reorder fields
- Enable/disable fields

## Database Schema (Already Implemented)

```typescript
projectTypeFields: defineTable({
  projectTypeId: v.id("projectTypes"),
  name: v.string(), // Field key (e.g., 'albumCount')
  label: v.string(), // Display label
  type: v.union(
    // Field type
    v.literal("text"),
    v.literal("number"),
    v.literal("select"),
    v.literal("checkbox"),
    v.literal("textarea")
  ),
  required: v.boolean(),
  placeholder: v.optional(v.string()),
  description: v.optional(v.string()),
  options: v.optional(v.string()), // JSON string for select options
  min: v.optional(v.number()), // For number validation
  max: v.optional(v.number()),
  displayOrder: v.number(),
  isActive: v.boolean(),
});
```

## Acceptance Criteria

### AC1: Field List View

- [ ] Display all fields grouped by project type
- [ ] Show field name, label, type, required status
- [ ] Visual indicator for active/inactive fields
- [ ] Quick actions: Edit, Toggle Active, Delete

### AC2: Add New Field

- [ ] Form to create new field with all properties
- [ ] Field type selector with preview
- [ ] For select type: UI to add/remove options
- [ ] Validation for required properties (name, label, type)
- [ ] Name uniqueness validation per project type

### AC3: Edit Field

- [ ] Pre-populated form with existing values
- [ ] Live preview of changes
- [ ] Save/Cancel actions
- [ ] Cannot change field name if used in existing projects (data integrity)

### AC4: Reorder Fields

- [ ] Drag-and-drop reordering
- [ ] Or up/down buttons for mobile
- [ ] Persist order to `displayOrder` field

### AC5: Delete Field

- [ ] Soft delete (set isActive = false) for fields with existing data
- [ ] Hard delete only if field has never been used
- [ ] Confirmation dialog

### AC6: Field Type Options

- [ ] For select type: Manage options list
- [ ] Add/remove/reorder options
- [ ] Option value and label inputs
- [ ] Preview dropdown with options

## Technical Tasks

### Task 1: Convex Mutations

- [ ] 1.1 Create `createProjectTypeField` mutation
- [ ] 1.2 Create `updateProjectTypeField` mutation
- [ ] 1.3 Create `deleteProjectTypeField` mutation
- [ ] 1.4 Create `reorderProjectTypeFields` mutation
- [ ] 1.5 Create `toggleFieldActive` mutation

### Task 2: Admin UI Components

- [ ] 2.1 Create `ProjectTypeFieldsManager` container component
- [ ] 2.2 Create `FieldListItem` component with actions
- [ ] 2.3 Create `FieldForm` component (add/edit)
- [ ] 2.4 Create `SelectOptionsEditor` component
- [ ] 2.5 Create `FieldPreview` component

### Task 3: Admin Route

- [ ] 3.1 Create route at `/admin/project-types/[id]/fields`
- [ ] 3.2 Add navigation from project types list
- [ ] 3.3 Breadcrumb navigation

### Task 4: Validation & Error Handling

- [ ] 4.1 Client-side form validation
- [ ] 4.2 Server-side uniqueness checks
- [ ] 4.3 Data integrity checks before delete
- [ ] 4.4 User-friendly error messages

## UI/UX Design Notes

- Use a two-panel layout: Project type selector on left, fields list on right
- Drag handle for reordering
- Inline edit for quick changes (label, required)
- Modal for full edit form
- Toast notifications for success/error
- Preview showing how field will appear in wizard

## Dependencies

- Story 3-1: Admin Dashboard Layout (done)
- Project Types table seeded
- `projectTypeFields` table created

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Responsive design (mobile-friendly)
- [ ] Loading and error states
- [ ] Empty states for no fields
- [ ] Code review completed
- [ ] No TypeScript errors
