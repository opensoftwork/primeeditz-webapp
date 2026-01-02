# User Flows & Role-Based Permissions

## PrimeEditz v3.0 — Project-Centric Workflow Platform

**Created**: 2025-12-27  
**Updated**: 2025-12-28  
**Version**: 3.0 (Project-Centric Model)  
**Author**: Mary (Business Analyst) + Team  
**Status**: ✅ Complete — Ready for implementation

---

## 📁 Document Structure

This folder contains the complete user flows and permissions documentation for the **Project-centric model** (v3.0).

### Files

| File                                               | Description                              |
| -------------------------------------------------- | ---------------------------------------- |
| [01-business-model.md](./01-business-model.md)     | B2B post-production model, terminology   |
| [02-roles.md](./02-roles.md)                       | Three roles + per-project assignment     |
| [03-account-creation.md](./03-account-creation.md) | Registration and account creation flows  |
| [04-dashboards.md](./04-dashboards.md)             | What each role sees (UI mockups)         |
| [05-user-journeys.md](./05-user-journeys.md)       | Complete end-to-end user journeys        |
| [06-gated-upload.md](./06-gated-upload.md)         | Quotation approval gate for uploads      |
| [07-permissions.md](./07-permissions.md)           | Permission matrix and status transitions |
| [08-role-management.md](./08-role-management.md)   | Role promotion, deactivation, recovery   |
| [09-editing-workflow.md](./09-editing-workflow.md) | QC gate, versioning, revision process    |

---

## 🎯 Quick Summary

### Business Model

- **PrimeEditz** = B2B Post-Production House
- **Clients** = Photography Studios/Agencies (not individuals)
- **Projects** = Work units (wedding photos, YouTube videos, posters, etc.)

### Key v3.0 Changes

| Aspect       | v2.0 (Old)                | v3.0 (New)                    |
| ------------ | ------------------------- | ----------------------------- |
| Entity Model | Event → Session → Project | **Project (central entity)**  |
| Creation     | Client-only               | **Client OR Admin**           |
| Roles        | Global                    | **Per-project assignment**    |
| Workflow     | Fixed                     | **Configurable stages**       |
| Versioning   | None                      | **Deliverables + Quotations** |

### Roles (3 total)

| Role         | Who               | Access                                 |
| ------------ | ----------------- | -------------------------------------- |
| **Admin**    | You + Managers    | Full access + create internal projects |
| **Employee** | Your editing team | Assigned projects only                 |
| **Client**   | Studios/Agencies  | Their own projects only                |

### Core Workflow

```
Client Request → Quotation → Approval → Upload → Work Stages → QC → Client Review → Delivery
      OR
Admin Creates → Storage Selected → Assign Team → Work Stages → QC → Complete
```

### Key Gates

1. **Quotation Gate** — No bulk upload before approval (client projects)
2. **Storage Gate** — Storage tier must be selected (all projects)
3. **QC Gate** — Client never sees un-QC'd work

---

## 📊 Document Changelog

| Version | Date           | Changes                                                          |
| ------- | -------------- | ---------------------------------------------------------------- |
| 1.0     | 2025-12-27     | Initial user flows                                               |
| 2.0     | 2025-12-27     | B2B model, 3 roles, gated upload                                 |
| 2.1     | 2025-12-28     | Editing workflow, QC gate                                        |
| **3.0** | **2025-12-28** | **Project-centric model, per-project roles, configurable types** |

---

_This documentation was created by Mary (Business Analyst) with input from the BMAD team._
