# Story 3-7: Project Types & Fields Management

**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Status**: done  
**Complexity**: High (13 points)  
**Created**: 2026-01-10

---

## 📋 User Story

**As an** Admin,  
**I want** to manage project types and their dynamic form fields,  
**So that** I can customize what information is collected from clients in the project wizard without code changes.

---

## ✅ Acceptance Criteria

### Project Types Management

- **Given** I navigate to `/settings/project-types`
- **When** the page loads
- **Then** I see a grid of project type cards showing name, category, field count, and status
- **And** I can add a new project type via a modal/drawer
- **And** I can click on a type to view/edit its fields
- **And** I can toggle a type's active status

### Field Builder

- **Given** I am on `/settings/project-types/[id]`
- **When** I view a project type's detail page
- **Then** I see the type info on the left and form fields on the right
- **And** I can add new fields via a side drawer
- **And** I can edit existing fields
- **And** I can reorder fields via drag handles or up/down buttons
- **And** I can delete/deactivate fields
- **And** field type selection shows type-specific options (min/max for numbers, options for select)

### Form Preview

- **Given** I have configured fields for a project type
- **When** I click "Preview Form"
- **Then** I see a modal showing exactly how Step 2 will appear to clients
- **And** the preview uses the same components as the actual wizard

---

## 🎨 UX Design Reference

### Wireframes Generated

The following wireframes were created during the brainstorming session and should guide implementation:

1. **Project Types List** - Grid layout with type cards showing quick info and hover actions
2. **Project Type Detail** - Split layout with type info (left) and field builder (right)
3. **Add Field Drawer** - Side drawer with field configuration form
4. **Select Options Builder** - Repeater pattern for managing dropdown options
5. **Form Preview Modal** - Live preview of wizard Step 2

### Route Structure

```
/settings/project-types           → List all project types
/settings/project-types/[id]      → View/edit specific type and its fields
```

---

## 📘 Implementation Phases

### Phase A: Project Types CRUD (~4 points)

#### Task A1: Convex Mutations for Project Types

**File**: `convex/functions/projectTypes/mutations.ts`

- [ ] A1.1 Create `createProjectType` mutation
- [ ] A1.2 Create `updateProjectType` mutation
- [ ] A1.3 Create `toggleProjectTypeActive` mutation
- [ ] A1.4 Create `deleteProjectType` mutation (soft delete via isActive)

#### Task A2: Convex Queries for Project Types

**File**: `convex/functions/projectTypes/queries.ts`

- [ ] A2.1 Create `getProjectTypes` query (list all, with field counts)
- [ ] A2.2 Create `getProjectType` query (single type with its fields)

#### Task A3: Project Types List Page

**File**: `src/app/(protected)/@admin/settings/project-types/page.tsx`

- [ ] A3.1 Create route and page component
- [ ] A3.2 Display grid of project type cards
- [ ] A3.3 Show: name, category badge, field count, active status
- [ ] A3.4 Implement hover state with "Configure Fields" and "Edit" actions
- [ ] A3.5 Add loading skeleton

#### Task A4: Add/Edit Project Type Drawer

**File**: `src/components/modules/admin/project-types/project-type-drawer.tsx`

- [ ] A4.1 Create drawer component
- [ ] A4.2 Form fields: name, category (select), isActive toggle
- [ ] A4.3 Handle create and edit modes
- [ ] A4.4 Form validation (name required, unique check)
- [ ] A4.5 Success/error toast notifications

---

### Phase B: Field Builder (~6 points)

#### Task B1: Convex Mutations for Fields

**File**: `convex/functions/projectTypeFields/mutations.ts`

- [ ] B1.1 Create `createProjectTypeField` mutation
- [ ] B1.2 Create `updateProjectTypeField` mutation
- [ ] B1.3 Create `deleteProjectTypeField` mutation (soft delete)
- [ ] B1.4 Create `reorderProjectTypeFields` mutation (batch update displayOrder)
- [ ] B1.5 Create `toggleFieldActive` mutation

#### Task B2: Project Type Detail Page

**File**: `src/app/(protected)/@admin/settings/project-types/[id]/page.tsx`

- [ ] B2.1 Create route with dynamic segment
- [ ] B2.2 Fetch project type and its fields
- [ ] B2.3 Display type info card (left section)
- [ ] B2.4 Display field list (right section)
- [ ] B2.5 Add breadcrumb navigation
- [ ] B2.6 Handle 404 for invalid type ID

#### Task B3: Field List Component

**File**: `src/components/modules/admin/project-types/field-list.tsx`

- [ ] B3.1 Display fields as draggable cards
- [ ] B3.2 Show: label, type badge, required/optional, options count (for select)
- [ ] B3.3 Add drag handles for reordering
- [ ] B3.4 Add edit (pencil), delete (trash) action buttons
- [ ] B3.5 Implement reorder via drag-and-drop OR up/down buttons
- [ ] B3.6 Empty state when no fields configured

#### Task B4: Add/Edit Field Drawer

**File**: `src/components/modules/admin/project-types/field-drawer.tsx`

- [ ] B4.1 Create side drawer component
- [ ] B4.2 Field name input (auto-generate slug from label)
- [ ] B4.3 Display label input
- [ ] B4.4 Field type selector (pill buttons: Text, Number, Select, Checkbox, Textarea)
- [ ] B4.5 Required toggle
- [ ] B4.6 Placeholder input
- [ ] B4.7 Help text / description input
- [ ] B4.8 Handle create and edit modes

#### Task B5: Type-Specific Field Options

**File**: `src/components/modules/admin/project-types/field-drawer.tsx` (continued)

- [ ] B5.1 **Number type**: Show min/max inputs
- [ ] B5.2 **Select type**: Show options builder component
- [ ] B5.3 **Textarea type**: (Optional) max character hint
- [ ] B5.4 Conditionally render based on selected type

#### Task B6: Select Options Builder

**File**: `src/components/modules/admin/project-types/options-builder.tsx`

- [ ] B6.1 Repeater pattern with value/label inputs
- [ ] B6.2 Add option button
- [ ] B6.3 Delete option per row
- [ ] B6.4 Reorder options (optional: drag handles)
- [ ] B6.5 Parse from/to JSON string for storage

---

### Phase C: Form Preview (~3 points)

#### Task C1: Preview Modal Component

**File**: `src/components/modules/admin/project-types/form-preview-modal.tsx`

- [ ] C1.1 Create modal dialog component
- [ ] C1.2 Accept fields array as prop
- [ ] C1.3 Render each field using the SAME components from wizard Step 2
- [ ] C1.4 Show disabled/read-only state (no form submission)
- [ ] C1.5 Header shows project type name

#### Task C2: Reuse Wizard Step 2 Components

**Existing**: `src/components/modules/projects/wizard/steps/step-2-details.tsx`

- [ ] C2.1 Extract field renderer logic into shared utility
- [ ] C2.2 Use shared renderer in both wizard and preview
- [ ] C2.3 Ensure consistent styling between preview and actual wizard

#### Task C3: Integration

- [ ] C3.1 Add "Preview Form" button to project type detail page
- [ ] C3.2 Wire up modal open state
- [ ] C3.3 Pass current fields to preview component

---

## 🧩 Component Structure

```
src/components/modules/admin/project-types/
├── index.ts                      # Barrel exports
├── project-type-card.tsx         # Card for list view
├── project-type-drawer.tsx       # Add/Edit type drawer
├── project-type-detail.tsx       # Detail page content
├── field-list.tsx                # Draggable field cards
├── field-drawer.tsx              # Add/Edit field drawer
├── options-builder.tsx           # Select options repeater
└── form-preview-modal.tsx        # Preview modal
```

---

## 🔁 Reuse Opportunities

| Existing Component              | Reuse For              |
| ------------------------------- | ---------------------- |
| `DataTableSkeleton`             | Loading states         |
| `Drawer` (shared)               | Type and field drawers |
| `Button`, `Input`, `Select`     | Form controls          |
| Dynamic field renderer (Step 2) | Preview modal          |
| Motion animations               | Card/list transitions  |
| Toast notifications             | Success/error feedback |

---

## 📦 Database Schema (Already Exists)

```typescript
// projectTypes table
projectTypes: defineTable({
  name: v.string(),
  category: v.string(),
  isActive: v.boolean(),
  displayOrder: v.optional(v.number()),
  defaultFolderTemplateId: v.optional(v.id("folderTemplates")),
});

// projectTypeFields table
projectTypeFields: defineTable({
  projectTypeId: v.id("projectTypes"),
  name: v.string(),
  label: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("select"),
    v.literal("checkbox"),
    v.literal("textarea")
  ),
  required: v.boolean(),
  placeholder: v.optional(v.string()),
  description: v.optional(v.string()),
  options: v.optional(v.string()), // JSON string
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  displayOrder: v.number(),
  isActive: v.boolean(),
});
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] Navigate to `/settings/project-types` → page loads with existing types
- [ ] Add new project type → appears in list
- [ ] Click type → navigates to detail page
- [ ] Add field → appears in field list
- [ ] Edit field → changes are saved
- [ ] Reorder fields → order persists
- [ ] Delete field → field removed/deactivated
- [ ] Toggle type active → status updates
- [ ] Preview form → matches wizard Step 2 styling
- [ ] Select field → options builder works correctly

### Edge Cases

- [ ] Empty state (no types yet)
- [ ] Empty state (type with no fields)
- [ ] Very long field labels
- [ ] Many options in select field
- [ ] Duplicate field names (should error)

---

## 🚀 Definition of Done

- [ ] All Phase A tasks complete (Project Types CRUD)
- [ ] All Phase B tasks complete (Field Builder)
- [ ] All Phase C tasks complete (Form Preview)
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Error handling with toast notifications
- [ ] No TypeScript errors
- [ ] Responsive design (mobile-friendly)
- [ ] Matches premium dark theme aesthetic
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status        | Notes                                                           |
| ---------- | ------------- | --------------------------------------------------------------- |
| 2026-01-10 | ready-for-dev | Story created with UX wireframes and phased implementation plan |

---

**Previous Story**: 3-3 - Admin Project Detail View  
**Next Story**: 3-4 - Project Stage/Folder Setup
