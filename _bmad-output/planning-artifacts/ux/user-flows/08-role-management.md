# 8. Role Management

[← Back to Index](./README.md) | [← Previous: Permissions](./07-permissions.md) | [Next: Editing Workflow →](./09-editing-workflow.md)

---

## 8.1 Role Lifecycle Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ROLE LIFECYCLE                                            │
└─────────────────────────────────────────────────────────────────────────────┘

                         ┌── ADMIN ──────────── First Admin (setup)
                         │      ▲
                         │      │ (promote)
                         │      │
ACCOUNT CREATION ────────┼── EMPLOYEE ──────── Admin creates account
                         │      │
                         │      │ (cannot downgrade)
                         │      ▼
                         │   (deactivate only)
                         │
                         └── CLIENT ─────────── Self-registration
```

---

## 8.2 Global Roles vs Per-Project Roles

### Global Roles (Account Level)

| Role     | Who Assigns             | Purpose                  |
| -------- | ----------------------- | ------------------------ |
| Admin    | Other Admin (promotion) | Full system access       |
| Employee | Admin (creates account) | Limited to assigned work |
| Client   | Self (registration)     | Limited to own projects  |

### Per-Project Roles (Assignment Level)

| Role     | Assigned By | Purpose                          |
| -------- | ----------- | -------------------------------- |
| Editor   | Admin       | Can download assets, upload work |
| QC       | Admin       | Can approve/reject stages        |
| Designer | Admin       | Specialized for design tasks     |
| Lead     | Admin       | Project lead, can QC + manage    |

**Key Point:** An Employee's global role is "Employee". Their per-project role (Editor, QC, etc.) is assigned per project.

---

## 8.3 Employee Account Lifecycle

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EMPLOYEE ACCOUNT LIFECYCLE                                │
└─────────────────────────────────────────────────────────────────────────────┘

1. CREATED
   └── Admin creates account
   └── Status: Pending (awaiting first login)
   └── Temp password generated

2. ACTIVE
   └── Employee logs in, sets password
   └── Status: Active
   └── Can be assigned to projects

3. PROMOTED (optional)
   └── Admin promotes to Admin role
   └── Status: Active
   └── Global role changes: Employee → Admin

4. DEACTIVATED
   └── Admin deactivates account
   └── Status: Inactive
   └── Cannot login
   └── Removed from active assignments
   └── Historical data preserved

5. REACTIVATED (optional)
   └── Admin reactivates account
   └── Status: Active
   └── Can be assigned again
```

---

## 8.4 Promoting Employee to Admin

### Flow

```
Admin Dashboard → Team → Select Employee → [•••] → Promote to Admin
```

### Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ ⚠️ Promote to Admin?                    │
├─────────────────────────────────────────┤
│                                         │
│ Are you sure you want to promote        │
│ "Rahul" to Admin?                       │
│                                         │
│ This will give them:                    │
│ ✓ Full access to all projects           │
│ ✓ Ability to manage employees           │
│ ✓ Ability to configure system           │
│ ✓ Access to billing and quotations      │
│ ✓ Ability to create internal projects   │
│                                         │
│ This action cannot be undone (you can   │
│ only deactivate the account later).     │
│                                         │
│ [Cancel] [Promote to Admin]             │
└─────────────────────────────────────────┘
```

### Post-Promotion

- Employee becomes Admin immediately
- Retains existing project assignments
- Gains access to all projects
- Cannot be demoted (only deactivated)

---

## 8.5 Deactivating Accounts

### When to Deactivate

- Employee leaves the company
- Client relationship ends
- Security concern (compromised account)
- Temporary suspension

### Flow

```
Admin Dashboard → Team → Select User → [•••] → Deactivate
```

### Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ ⚠️ Deactivate Account?                  │
├─────────────────────────────────────────┤
│                                         │
│ Are you sure you want to deactivate     │
│ "Rahul"?                                │
│                                         │
│ This will:                              │
│ ✓ Prevent login                         │
│ ✓ Remove from active project assignments│
│ ✓ Preserve all historical data          │
│                                         │
│ Active assignments (3 projects)         │
│ will need to be reassigned:             │
│ • Priya's Wedding                       │
│ • Corp Event                            │
│ • Product Shoot                         │
│                                         │
│ [Cancel] [Deactivate]                   │
└─────────────────────────────────────────┘
```

### Post-Deactivation

- User cannot login
- Removed from active assignments
- Projects need reassignment
- Historical data preserved (for audit)

---

## 8.6 Reactivating Accounts

### Flow

```
Admin Dashboard → Team → Show Inactive → Select User → [•••] → Reactivate
```

### Confirmation Dialog

```
┌─────────────────────────────────────────┐
│ Reactivate Account?                     │
├─────────────────────────────────────────┤
│                                         │
│ Reactivate "Rahul"?                     │
│                                         │
│ This will:                              │
│ ✓ Allow login again                     │
│ ✓ Restore profile                       │
│ ✓ NOT restore project assignments       │
│                                         │
│ You will need to manually assign        │
│ them to projects after reactivation.    │
│                                         │
│ [Cancel] [Reactivate]                   │
└─────────────────────────────────────────┘
```

---

## 8.7 Per-Project Role Assignment

### Assigning Team to Project

```
Project Detail → Team → [+ Assign Team Member]
```

### Assignment Dialog

```
┌─────────────────────────────────────────┐
│ Assign Team Member                      │
├─────────────────────────────────────────┤
│                                         │
│ Project: Priya's Wedding Photos         │
│                                         │
│ Employee*: [Rahul ▼]                    │
│                                         │
│ Roles (select all that apply):          │
│ ☑️ Editor                               │
│ ☑️ QC                                   │
│ ☐ Designer                              │
│ ☐ Lead                                  │
│                                         │
│ Scope:                                  │
│ ◉ All stages                            │
│ ○ Specific stages only                  │
│                                         │
│ [Cancel] [Assign]                       │
└─────────────────────────────────────────┘
```

### Stage-Specific Assignment

```
┌─────────────────────────────────────────┐
│ Assign Team Member                      │
├─────────────────────────────────────────┤
│                                         │
│ Project: Priya's Wedding Photos         │
│                                         │
│ Employee*: [Anil ▼]                     │
│                                         │
│ Roles: ☑️ Editor                        │
│                                         │
│ Scope:                                  │
│ ○ All stages                            │
│ ◉ Specific stages only                  │
│                                         │
│ Select stages:                          │
│ ☑️ Color Grading                        │
│ ☐ Album Design                          │
│ ☐ QC Review                             │
│                                         │
│ [Cancel] [Assign]                       │
└─────────────────────────────────────────┘
```

---

## 8.8 Viewing Project Assignments

### Admin View

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 👥 Team - Priya's Wedding Photos                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────┬─────────────────┬─────────────────┬────────────────────────┐ │
│ │ Employee   │ Roles           │ Scope           │ Actions                │ │
│ ├────────────┼─────────────────┼─────────────────┼────────────────────────┤ │
│ │ Rahul      │ Editor, QC      │ All stages      │ [Edit] [Remove]        │ │
│ │ Priya      │ QC              │ All stages      │ [Edit] [Remove]        │ │
│ │ Anil       │ Editor          │ Color Grading   │ [Edit] [Remove]        │ │
│ └────────────┴─────────────────┴─────────────────┴────────────────────────┘ │
│                                                                              │
│ [+ Assign Team Member]                                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Employee View (Their Own Assignments)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📦 My Projects                                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌────────────────────────┬─────────────────┬─────────────────┬────────────┐ │
│ │ Project                │ My Roles        │ My Stages       │ Status     │ │
│ ├────────────────────────┼─────────────────┼─────────────────┼────────────┤ │
│ │ Priya's Wedding        │ Editor, QC      │ All             │ In Progress│ │
│ │ Corp Event             │ Editor          │ All             │ Culling    │ │
│ │ Product Shoot          │ QC              │ QC Review only  │ Pending QC │ │
│ └────────────────────────┴─────────────────┴─────────────────┴────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8.9 Summary Table

| Action              | Who Can Do | To Whom           | Result                       |
| ------------------- | ---------- | ----------------- | ---------------------------- |
| Create Employee     | Admin      | New user          | Employee account created     |
| Promote to Admin    | Admin      | Employee          | Global role → Admin          |
| Deactivate          | Admin      | Employee/Client   | Cannot login, preserved data |
| Reactivate          | Admin      | Inactive user     | Can login again              |
| Assign to Project   | Admin      | Employee          | Per-project role assignment  |
| Remove from Project | Admin      | Assigned Employee | Unassigned from project      |

---

[Next: Editing Workflow →](./09-editing-workflow.md)
