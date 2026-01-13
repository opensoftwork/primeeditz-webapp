# Parallel Sprint Strategy

**Created**: 2026-01-06  
**Status**: Active  
**Objective**: Execute Epic 2 and Epic 3 in parallel to double development velocity

---

## 🎯 Sprint Allocation

### Sprint A (Primary Chat): Epic 2 - Client Portal — Project Request

**Owner**: Current PM session  
**Timeline**: ~6-8 days  
**Stories**: 2.0 → 2.7 (7 stories)

### Sprint B (Parallel Chat): Epic 3 - Admin Portal — Project & System Management

**Owner**: New PM session (to be started)  
**Timeline**: ~8-10 days  
**Stories**: 3.1 → 3.10 (10 stories)

---

## ✅ Conflict Analysis

| Aspect                | Sprint A (Epic 2)                         | Sprint B (Epic 3)                            | Conflict Risk | Mitigation               |
| --------------------- | ----------------------------------------- | -------------------------------------------- | ------------- | ------------------------ |
| **Routes**            | `/client/projects/*`                      | `/admin/*`                                   | ❌ None       | Different route trees    |
| **Components**        | `components/modules/projects/wizard/*`    | `components/modules/admin/*`                 | ❌ None       | Separate namespaces      |
| **Schema**            | Uses existing `projects` table            | Uses existing `projects`, adds `employees`   | ⚠️ Low        | Schema already complete  |
| **Convex Functions**  | `functions/projects/*` (client mutations) | `functions/admin/*`, `functions/employees/*` | ❌ None       | Different function paths |
| **Shared Components** | StepIndicator, ImageSlider                | DataTable, Filters                           | ❌ None       | Different components     |
| **Dependencies**      | @unpic/react, react-hook-form             | @tanstack/react-table                        | ❌ None       | Independent deps         |

**Overall Risk**: **LOW** ✅

---

## 📋 Sprint A: Epic 2 Stories (Client Portal)

| Story   | Title                                     | Status        | Dependencies |
| ------- | ----------------------------------------- | ------------- | ------------ |
| **2.0** | Wizard Infrastructure & Draft Project     | ready-for-dev | Epic 1 ✅    |
| **2.1** | Client Dashboard with Project Listing     | backlog       | 2.0          |
| **2.2** | Wizard Step 1 — Project Type & Basic Info | backlog       | 2.0          |
| **2.3** | Wizard Step 2 — Project-Specific Details  | backlog       | 2.2          |
| **2.4** | Wizard Step 3 — Reference Files Upload    | backlog       | 2.3          |
| **2.5** | Wizard Step 4 — Description & Notes       | backlog       | 2.4          |
| **2.6** | Wizard Step 5 — Review & Submit           | backlog       | 2.5          |
| **2.7** | Client Project Detail View                | backlog       | 2.6          |

**Key Deliverables**:

- Client can create project requests via 5-step wizard
- Client can upload reference files
- Client can view their submitted projects
- Draft project auto-save functionality

---

## 📋 Sprint B: Epic 3 Stories (Admin Portal)

| Story    | Title                               | Status  | Dependencies |
| -------- | ----------------------------------- | ------- | ------------ |
| **3.1**  | Admin Dashboard Layout              | backlog | Epic 1 ✅    |
| **3.2**  | Admin Project Listing with Filters  | backlog | 3.1          |
| **3.3**  | Admin Project Detail View           | backlog | 3.2          |
| **3.4**  | Project Stage Folder Setup          | backlog | 3.3          |
| **3.5**  | Update Project Status               | backlog | 3.3          |
| **3.6**  | Employee Management CRUD            | backlog | 3.1          |
| **3.7**  | Project Types Management            | backlog | 3.1          |
| **3.8**  | Quotation Templates Management      | backlog | 3.1          |
| **3.9**  | Storage Pricing Tiers Configuration | backlog | 3.1          |
| **3.10** | Folder Templates Configuration      | backlog | 3.1          |

**Key Deliverables**:

- Admin can view all pending project requests
- Admin can manage employees, project types, templates
- Admin can configure system settings
- Admin can update project statuses

---

## 🔄 Integration Points (Merge Strategy)

### When Both Sprints Complete:

1. **Schema Changes**:

   - Sprint A: No schema changes (uses existing `projects`)
   - Sprint B: May add `employees` table fields
   - **Action**: Review schema.ts for conflicts before final merge

2. **Shared Components**:

   - Sprint A: Wizard components, ImageSlider
   - Sprint B: DataTable, FilterBar
   - **Action**: No conflicts expected

3. **Convex Functions**:

   - Sprint A: `functions/projects/mutations.ts` (client-facing)
   - Sprint B: `functions/admin/queries.ts`, `functions/employees/*`
   - **Action**: Ensure no duplicate function names

4. **Routes**:
   - Sprint A: `/client/projects/*`
   - Sprint B: `/admin/*`
   - **Action**: No conflicts

---

## 🚦 Coordination Rules

### DO's ✅

- Work independently on separate route trees
- Create separate component modules
- Use separate Convex function namespaces
- Commit frequently with clear prefixes: `[Epic2]` or `[Epic3]`

### DON'Ts ❌

- Don't modify shared schema without coordination
- Don't edit the same component files
- Don't create functions with overlapping names
- Don't merge until both sprints are code-reviewed

---

## 📊 Progress Tracking

### Sprint A Progress (Epic 2)

- [ ] 2.0 - Wizard Infrastructure
- [ ] 2.1 - Client Dashboard
- [ ] 2.2 - Step 1
- [ ] 2.3 - Step 2
- [ ] 2.4 - Step 3
- [ ] 2.5 - Step 4
- [ ] 2.6 - Step 5
- [ ] 2.7 - Project Detail View

### Sprint B Progress (Epic 3)

- [ ] 3.1 - Admin Dashboard Layout
- [ ] 3.2 - Project Listing
- [ ] 3.3 - Project Detail
- [ ] 3.4 - Folder Setup
- [ ] 3.5 - Status Updates
- [ ] 3.6 - Employee Management
- [ ] 3.7 - Project Types
- [ ] 3.8 - Quotation Templates
- [ ] 3.9 - Storage Tiers
- [ ] 3.10 - Folder Templates

---

## 🎯 Success Criteria

**Sprint A Complete When**:

- All 7 stories marked `done`
- Client can complete full project request flow
- All tests passing
- Code review complete

**Sprint B Complete When**:

- All 10 stories marked `done`
- Admin can manage all system entities
- All tests passing
- Code review complete

**Both Sprints Merged When**:

- No schema conflicts
- No route conflicts
- No function name conflicts
- Integration tests passing
- Final code review approved

---

## 📝 Notes

- **Schema is already complete**: Both epics can use existing schema without modifications
- **RBAC is done**: Both epics can use existing role-based access control
- **Auth is done**: Both epics can use existing authentication
- **Sidebar is done**: Both epics can add menu items independently

**This parallel strategy is LOW RISK and HIGH REWARD** 🚀
