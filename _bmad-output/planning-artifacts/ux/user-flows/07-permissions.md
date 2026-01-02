# 7. Permission Matrix

[← Back to Index](./README.md) | [← Previous: Gated Upload](./06-gated-upload.md) | [Next: Role Management →](./08-role-management.md)

---

## 7.1 Core Permission Matrix

### Project Operations

| Permission                        | Admin |   Employee   | Client |
| --------------------------------- | :---: | :----------: | :----: |
| **View all projects**             |  ✅   |      ❌      |   ❌   |
| **View assigned projects**        |  ✅   |      ✅      |   —    |
| **View own projects**             |   —   |      —       |   ✅   |
| **Create client project request** |  ✅   |      ❌      |   ✅   |
| **Create internal project**       |  ✅   |      ❌      |   ❌   |
| **Edit project details**          |  ✅   |      ❌      |   ❌   |
| **Delete project**                |  ✅   |      ❌      |   ❌   |
| **Assign team**                   |  ✅   |      ❌      |   ❌   |
| **Update project status**         |  ✅   | ✅ (limited) |   ❌   |

### Quotation Operations

| Permission                    | Admin | Employee |  Client  |
| ----------------------------- | :---: | :------: | :------: |
| **Create quotation**          |  ✅   |    ❌    |    ❌    |
| **Edit quotation**            |  ✅   |    ❌    |    ❌    |
| **Send quotation**            |  ✅   |    ❌    |    ❌    |
| **View quotation**            |  ✅   |    ❌    | ✅ (own) |
| **Approve quotation**         |  ❌   |    ❌    |    ✅    |
| **Request quotation changes** |  ❌   |    ❌    |    ✅    |

### Asset Operations

| Permission                 | Admin |   Employee    |   Client   |
| -------------------------- | :---: | :-----------: | :--------: |
| **Upload reference files** |  ✅   |      ❌       |     ✅     |
| **Upload bulk assets**     |  ✅   |      ❌       | ✅ (gated) |
| **Download raw assets**    |  ✅   | ✅ (assigned) |     ❌     |
| **Upload edited work**     |  ✅   | ✅ (assigned) |     ❌     |
| **Delete assets**          |  ✅   |      ❌       |     ❌     |

### Deliverable Operations

| Permission                     | Admin |   Employee    |       Client       |
| ------------------------------ | :---: | :-----------: | :----------------: |
| **Create deliverable**         |  ✅   | ✅ (assigned) |         ❌         |
| **Upload deliverable version** |  ✅   | ✅ (assigned) |         ❌         |
| **View deliverable**           |  ✅   | ✅ (assigned) | ✅ (own, after QC) |
| **Review deliverable**         |  ✅   |      ❌       |         ✅         |
| **Approve deliverable**        |  ❌   |      ❌       |         ✅         |
| **Request revision**           |  ✅   |      ❌       |         ✅         |
| **Download deliverable**       |  ✅   |      ❌       | ✅ (approved only) |

### Configuration Operations

| Permission                     | Admin | Employee | Client |
| ------------------------------ | :---: | :------: | :----: |
| **Manage project types**       |  ✅   |    ❌    |   ❌   |
| **Manage stage definitions**   |  ✅   |    ❌    |   ❌   |
| **Manage storage tiers**       |  ✅   |    ❌    |   ❌   |
| **Manage quotation templates** |  ✅   |    ❌    |   ❌   |
| **View business settings**     |  ✅   |    ❌    |   ❌   |
| **Edit business settings**     |  ✅   |    ❌    |   ❌   |

### Team Operations

| Permission                  | Admin | Employee | Client |
| --------------------------- | :---: | :------: | :----: |
| **View all employees**      |  ✅   |    ❌    |   ❌   |
| **Create employee account** |  ✅   |    ❌    |   ❌   |
| **Edit employee profile**   |  ✅   |    ❌    |   ❌   |
| **Deactivate employee**     |  ✅   |    ❌    |   ❌   |
| **Promote to admin**        |  ✅   |    ❌    |   ❌   |
| **View clients**            |  ✅   |    ❌    |   ❌   |

---

## 7.2 Project Status Transitions

### Client-Initiated Project Status Flow

```
draft → pending_quotation → quotation_sent → quotation_approved
    → pending_upload → in_progress → qc_review → client_review
    → [revision_requested ↔ in_progress] → completed → archived
```

### Admin-Initiated Project Status Flow

```
draft → in_progress → qc_review → completed → archived
```

### Who Can Trigger Status Changes

| From Status        | To Status          | Who Can Trigger           |
| ------------------ | ------------------ | ------------------------- |
| draft              | pending_quotation  | Admin                     |
| pending_quotation  | quotation_sent     | Admin                     |
| quotation_sent     | quotation_approved | Client (approve)          |
| quotation_sent     | quotation_sent     | Client (request changes)  |
| quotation_approved | pending_upload     | System (auto)             |
| pending_upload     | in_progress        | Client (marks complete)   |
| in_progress        | qc_review          | Employee (submits for QC) |
| qc_review          | in_progress        | Admin/QC (rejects)        |
| qc_review          | client_review      | Admin/QC (approves)       |
| client_review      | revision_requested | Client                    |
| revision_requested | in_progress        | Admin                     |
| client_review      | completed          | Client (approves)         |
| completed          | archived           | Admin/System              |

---

## 7.3 Stage-Level Permissions

### Stage Status Transitions

| From        | To          | Who Can Trigger       |
| ----------- | ----------- | --------------------- |
| pending     | in_progress | Assigned Editor       |
| in_progress | pending_qc  | Assigned Editor       |
| pending_qc  | in_progress | Assigned QC (reject)  |
| pending_qc  | completed   | Assigned QC (approve) |
| -           | skipped     | Admin                 |

### Per-Project Role Permissions

| Action                | Editor | QC  | Designer | Lead |
| --------------------- | :----: | :-: | :------: | :--: |
| Download assets       |   ✅   | ✅  |    ✅    |  ✅  |
| Upload work           |   ✅   | ❌  |    ✅    |  ✅  |
| Update stage progress |   ✅   | ❌  |    ✅    |  ✅  |
| Submit for QC         |   ✅   | ❌  |    ✅    |  ✅  |
| Approve stage (QC)    |   ❌   | ✅  |    ❌    |  ✅  |
| Reject stage (QC)     |   ❌   | ✅  |    ❌    |  ✅  |
| Add internal notes    |   ✅   | ✅  |    ✅    |  ✅  |

---

## 7.4 Deliverable Version Permissions

### Version Status Flow

```
draft → pending_qc → [qc_approved | rejected]
          │
          ▼ (if approved)
    pending_client → [approved | revision_requested]
          │               │
          │               ▼ (revision cycle)
          │          new version uploaded
          │               │
          ▼               ▼
     current ← ← ← approved
```

### Who Can Do What

| Action                   | Admin | Editor (assigned) | QC (assigned) | Client |
| ------------------------ | :---: | :---------------: | :-----------: | :----: |
| Create version           |  ✅   |        ✅         |      ❌       |   ❌   |
| Submit for QC            |  ✅   |        ✅         |      ❌       |   ❌   |
| Approve (QC)             |  ✅   |        ❌         |      ✅       |   ❌   |
| Reject (QC)              |  ✅   |        ❌         |      ✅       |   ❌   |
| View (before QC)         |  ✅   |        ✅         |      ✅       |   ❌   |
| View (after QC approved) |  ✅   |        ✅         |      ✅       |   ✅   |
| Approve (final)          |  ❌   |        ❌         |      ❌       |   ✅   |
| Request revision         |  ✅   |        ❌         |      ❌       |   ✅   |
| Download (approved)      |  ✅   |        ❌         |      ❌       |   ✅   |

---

## 7.5 Quotation Version Permissions

### Version Status Flow

```
draft → sent → [approved | rejected | changes_requested]
                          │
                          ▼ (if changes requested)
                     new version created
                          │
                          ▼
                     draft → sent → ...
```

### Who Can Do What

| Action               | Admin |  Client  |
| -------------------- | :---: | :------: |
| Create version       |  ✅   |    ❌    |
| Edit version         |  ✅   |    ❌    |
| Send to client       |  ✅   |    ❌    |
| View                 |  ✅   | ✅ (own) |
| Approve              |  ❌   |    ✅    |
| Reject               |  ❌   |    ✅    |
| Request changes      |  ❌   |    ✅    |
| View version history |  ✅   |    ✅    |

---

## 7.6 Data Visibility Rules

### What Each Role Can See

| Data                          | Admin |   Employee    |  Client  |
| ----------------------------- | :---: | :-----------: | :------: |
| All projects                  |  ✅   |      ❌       |    ❌    |
| Assigned projects             |  ✅   |      ✅       |    —     |
| Own projects                  |   —   |       —       |    ✅    |
| Client business details       |  ✅   |      ❌       | ✅ (own) |
| Team member list              |  ✅   |      ❌       |    ❌    |
| Internal notes                |  ✅   | ✅ (assigned) |    ❌    |
| Project stages (internal)     |  ✅   | ✅ (assigned) |    ❌    |
| Project progress (simplified) |  ✅   |      ✅       |    ✅    |
| Deliverables (before QC)      |  ✅   | ✅ (assigned) |    ❌    |
| Deliverables (after QC)       |  ✅   |      ✅       |    ✅    |
| Quotation details             |  ✅   |      ❌       | ✅ (own) |
| Storage usage                 |  ✅   |      ❌       | ✅ (own) |

---

## 7.7 API Enforcement Summary

```typescript
// Permission checks at API level

// Admin-only operations
adminQuery / adminMutation

// Client-only operations (filtered by clientId)
clientQuery / clientMutation

// Employee-only operations (filtered by assignment)
employeeQuery / employeeMutation

// Mixed access with ownership checks
authenticatedQuery + ownership validation
```

---

[Next: Role Management →](./08-role-management.md)
