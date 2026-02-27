# Story 28.3: "Create Internal Project" Button + Creation Drawer

**Epic**: Epic 28 - Admin Internal Project Flow
**Status**: backlog
**Complexity**: Large (8 points)
**Created**: 2026-02-27
**Priority**: HIGH — Main UI for creating internal projects

---

## 📋 User Story

**As an** Admin,
**I want** a "Create Internal Project" button on the All Projects page that opens a creation drawer,
**So that** I can quickly create projects for internal management.

---

## ✅ Acceptance Criteria

### Button Placement

- [ ] **Given** the All Projects page
- [ ] **When** viewing the action bar
- [ ] **Then** a "Create Internal Project" button is visible (alongside New Quotation)

### Creation Drawer

- [ ] **Given** the drawer opens
- [ ] **When** viewing the form
- [ ] **Then** it shows fields: Project Name, Project Type, Folder Template, Assign Employees, Notes
- [ ] **And** drawer width is `sm:max-w-lg`

### Form Validation

- [ ] **Given** the form
- [ ] **When** submitting without required fields
- [ ] **Then** validation errors are shown for: Project Name, Project Type

### Successful Creation

- [ ] **Given** valid form data
- [ ] **When** clicking "Create Project"
- [ ] **Then** `createInternalProject` mutation is called
- [ ] **And** success toast is shown
- [ ] **And** navigation goes to the new project's detail page

---

## 📁 Files to Create/Update

| File                                                                       | Change     |
| -------------------------------------------------------------------------- | ---------- |
| `src/components/modules/admin/projects/create-internal-project-drawer.tsx` | **NEW**    |
| `src/components/modules/admin/projects/project-list/`                      | Add button |

---

## 🚀 Definition of Done

- [ ] "Create Internal Project" button on All Projects page
- [ ] Drawer with all fields
- [ ] Form validation
- [ ] Successful creation and navigation
- [ ] Consistent with PrimeEditz design system
- [ ] Story marked as `done`

---

**Previous Story**: 28-2 - Project listing badge
**Next Story**: 28-4 - Employee assignment during creation
