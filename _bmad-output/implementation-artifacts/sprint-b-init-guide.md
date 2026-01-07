# Sprint B Initialization Guide (Epic 3)

**For**: Parallel PM session  
**Epic**: Epic 3 - Admin Portal — Project & System Management  
**Project**: primeeditz-webapp

---

## 🎯 Your Mission

Execute **Epic 3: Admin Portal — Project & System Management** in parallel with Epic 2 (Client Portal) being developed in another chat session.

---

## 📋 Context You Need

### Project Location

```
/home/life-design/Documents/Software/PrimeEditz/primeeditz-webapp
```

### What's Already Done ✅

- **Epic 0**: Project Foundation (Next.js 16, Convex, Better Auth, App Shell)
- **Epic 1**: Authentication & Onboarding (RBAC, Route Protection, Dynamic Sidebar)

### What's In Progress (Other Chat)

- **Epic 2**: Client Portal — Project Request (Stories 2.0 → 2.7)

---

## 📖 Required Reading

Before starting, load these files:

1. **Config**: `_bmad-output/planning-artifacts/config.yaml`
2. **PRD**: `_bmad-output/planning-artifacts/prd.md`
3. **Epic 3**: `_bmad-output/planning-artifacts/epics/03-admin-portal-management.md`
4. **Sprint Status**: `_bmad-output/implementation-artifacts/sprint-status.yaml`
5. **Parallel Strategy**: `_bmad-output/implementation-artifacts/parallel-sprint-strategy.md`
6. **Architecture**: `_bmad-output/planning-artifacts/architecture/03-core-decisions.md`

---

## 🎯 Your Stories (Epic 3)

| Story    | Title                               | Complexity |
| -------- | ----------------------------------- | ---------- |
| **3.1**  | Admin Dashboard Layout              | Medium     |
| **3.2**  | Admin Project Listing with Filters  | Medium     |
| **3.3**  | Admin Project Detail View           | Medium     |
| **3.4**  | Project Stage Folder Setup          | High       |
| **3.5**  | Update Project Status               | Low        |
| **3.6**  | Employee Management CRUD            | High       |
| **3.7**  | Project Types Management            | Medium     |
| **3.8**  | Quotation Templates Management      | Medium     |
| **3.9**  | Storage Pricing Tiers Configuration | Low        |
| **3.10** | Folder Templates Configuration      | Medium     |

---

## 🚦 Coordination Rules

### ✅ Safe to Modify

- `/src/routes/_authed/admin/*` (your routes)
- `/src/components/modules/admin/*` (your components)
- `/convex/functions/admin/*` (your queries/mutations)
- `/convex/functions/employees/*` (your employee functions)

### ⚠️ Coordinate Before Modifying

- `/convex/schema.ts` (check with other chat first)
- `/src/components/shared/*` (only if creating NEW shared components)

### ❌ Don't Touch

- `/src/routes/_authed/client/*` (Epic 2 territory)
- `/src/components/modules/projects/wizard/*` (Epic 2 territory)
- `/convex/functions/projects/*` (Epic 2 territory)

---

## 🎬 How to Start

### Step 1: Activate PM Agent

```
@[/bmad-bmm-agents-pm]
```

### Step 2: Tell PM Your Mission

```
I'm executing Epic 3 (Admin Portal) in parallel with Epic 2 (Client Portal)
being developed in another chat. Please help me start with Story 3.1.

Context:
- Epic 0 and Epic 1 are complete
- Epic 2 is in progress (separate chat)
- I've read the parallel-sprint-strategy.md
- Ready to start Story 3.1: Admin Dashboard Layout
```

### Step 3: Follow PM Workflow

The PM will likely:

1. Load config and epic files
2. Create Story 3.1 file (if not exists)
3. Hand off to Dev workflow to implement
4. Move through stories 3.1 → 3.10

---

## 📊 Progress Tracking

Update `sprint-status.yaml` as you complete stories:

```yaml
epic-3: in-progress
3-1-admin-dashboard-layout: in-progress # ← Start here
3-2-admin-project-listing-with-filters: backlog
# ... etc
```

---

## 🔗 Integration Points

When Epic 3 completes, coordinate with Epic 2 chat for:

1. **Schema Review**: Ensure no conflicts in `convex/schema.ts`
2. **Function Names**: Ensure no duplicate Convex function names
3. **Shared Components**: Merge any new shared components
4. **Final Testing**: Test admin + client flows together

---

## 🎯 Success Criteria

Epic 3 is complete when:

- [ ] All 10 stories marked `done` in sprint-status.yaml
- [ ] Admin can view all pending project requests
- [ ] Admin can manage employees, project types, templates
- [ ] Admin can configure system settings
- [ ] All tests passing
- [ ] Code review complete

---

## 📝 Notes

- **Schema is complete**: Use existing schema, minimal changes needed
- **RBAC is done**: Use existing role guards for admin routes
- **Sidebar is done**: Add admin menu items to existing sidebar config
- **Low conflict risk**: Epic 2 and Epic 3 work on different parts of the app

**Good luck! 🚀**
