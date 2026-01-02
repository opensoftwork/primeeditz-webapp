# 2. The Three Roles

[← Back to Index](./README.md) | [← Previous: Business Model](./01-business-model.md) | [Next: Account Creation →](./03-account-creation.md)

---

## 2.1 Role Overview

PrimeEditz has exactly **three roles**:

```
        ADMIN
          │
          │ (Admin creates)
          │
    ┌─────┴─────┐
    │           │
EMPLOYEE     CLIENT
    │           │
Internal    External
  Team      Partners
```

| Role         | Who                 | Access Level                 |
| ------------ | ------------------- | ---------------------------- |
| **Admin**    | You + Your Managers | Full access, create projects |
| **Employee** | Your editing team   | Assigned projects only       |
| **Client**   | Studios/Agencies    | Their own projects only      |

---

## 2.2 Admin (You + Your Managers)

### Who is an Admin?

- You (the owner)
- Studio managers
- Senior staff with full access

### What can Admin do?

```yaml
Account Management:
  - Create employee accounts
  - Promote employees to Admin
  - Deactivate accounts

Project Management:
  - View ALL projects (from all clients)
  - Create projects (both client-assigned and internal)
  - Create and send quotations
  - Assign team to projects (per-project roles)
  - Update project status

Configuration:
  - Manage project types
  - Configure stage definitions
  - Create/edit quotation templates
  - Set storage pricing tiers
  - Create folder templates

Internal Projects:
  - Create R&D projects
  - Create training projects
  - Create portfolio updates

Everything:
  - Admin has FULL system access
```

### Account Creation

Admin accounts are created by:

1. Initial setup (first admin)
2. Another admin promoting an employee

---

## 2.3 Employee (Your Editing Team)

### Who is an Employee?

- Editors (color grading, retouching)
- Video editors
- Designers (album, poster)
- QC team members
- Any internal staff

### What can Employee do?

```yaml
Project Access:
  - View projects ASSIGNED to them only
  - Download raw assets for assigned projects
  - Upload edited assets
  - Update stage progress
  - Add internal notes

Per-Project Roles:
  - Can be assigned as Editor, QC, or Designer per project
  - Same person can be Editor AND QC on same project
  - Different roles on different projects
```

### What can Employee NOT do?

```yaml
Cannot:
  - View projects not assigned to them
  - View client business details (phone, address)
  - Assign work to others
  - Create projects or quotations
  - Modify system settings
  - Access other employees' work
```

### Account Creation

Employee accounts are created by Admin only. No self-registration.

---

## 2.4 Client (Studios/Agencies)

### Who is a Client?

- Photography studios (B2B customer)
- Video production agencies
- Event management companies
- Any business that sends you work

### What can Client do?

```yaml
Project Management:
  - Request new projects (select project type)
  - Upload reference files during request
  - View and approve quotations
  - Upload bulk assets AFTER quotation approved
  - Track project progress

Deliverables:
  - Review final deliverables
  - Request revisions (within limits)
  - Approve finals
  - Download approved deliverables
```

### What can Client NOT do?

```yaml
Cannot:
  - View other clients' projects
  - Upload bulk assets before quotation approval
  - Access admin/employee features
  - See internal notes or employee info
  - Modify pricing or templates
  - Skip quotation approval step
```

### Account Creation

Clients self-register and are immediately active.

---

## 2.5 Per-Project Role Assignment (NEW in v3.0)

### The Old Way (v2.0)

```
Employee = Editor (global role)
If you're an Editor, you're always an Editor on every project.
```

### The New Way (v3.0)

```
Roles are assigned PER PROJECT:

PROJECT: "Priya's Wedding Photos"
└── Team Assignments
    ├── Rahul → [Editor, QC]      ← Same person, both roles
    ├── Anil  → [Editor]          ← Editor only
    └── Priya → [QC]              ← QC only

PROJECT: "YouTube Tutorial Edit"
└── Team Assignments
    ├── Rahul → [Editor]          ← Just editor here
    └── Priya → [QC, Lead]        ← QC and project lead
```

### Benefits

- Same person can be Editor AND QC on same project
- Different team composition for different project types
- Flexible assignment based on workload
- Stage-specific assignments possible

---

## 2.6 Role Comparison Matrix

| Capability                      | Admin |   Employee   |    Client    |
| ------------------------------- | :---: | :----------: | :----------: |
| **View all projects**           |  ✅   |      ❌      |      ❌      |
| **View assigned projects**      |  ✅   |      ✅      |      —       |
| **View own projects**           |   —   |      —       |      ✅      |
| **Create projects**             |  ✅   |      ❌      | Request only |
| **Create internal projects**    |  ✅   |      ❌      |      ❌      |
| **Create quotations**           |  ✅   |      ❌      |      ❌      |
| **Approve quotations**          |  ❌   |      ❌      |      ✅      |
| **Upload reference files**      |  ✅   |      ❌      |      ✅      |
| **Upload bulk assets**          |  ✅   |      ❌      |  ✅ (gated)  |
| **Download raw assets**         |  ✅   |      ✅      |      ❌      |
| **Upload edited work**          |  ✅   |      ✅      |      ❌      |
| **Assign team to projects**     |  ✅   |      ❌      |      ❌      |
| **Update project status**       |  ✅   | ✅ (limited) |      ❌      |
| **Review deliverables**         |  ✅   |      ❌      |      ✅      |
| **Request revisions**           |  ✅   |      ❌      |      ✅      |
| **Download final deliverables** |  ✅   |      ❌      |      ✅      |
| **Configure system**            |  ✅   |      ❌      |      ❌      |
| **Manage employees**            |  ✅   |      ❌      |      ❌      |

---

## 2.7 Why Only Three Roles?

### We Merged Superadmin into Admin

**Before (v1.0):** 4 roles — Admin, Superadmin, Employee, Client  
**After (v2.0+):** 3 roles — Admin, Employee, Client

**Reason:** In a small-to-medium post-production house, having separate Admin and Superadmin creates unnecessary complexity. If you later need to restrict certain settings to "owner only", add a permission flag, not a separate role.

### We Made Roles Per-Project

**Before:** Employee = Editor (global)  
**After:** Roles assigned per project

**Reason:** In real workflows, the same person might:

- Be an Editor on one project
- Be QC on another project
- Be both Editor and QC on a third project

---

[Next: Account Creation →](./03-account-creation.md)
