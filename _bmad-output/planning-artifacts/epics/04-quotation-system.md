# Epic 4: Quotation System (Revised)

**Epic Owner**: Admin/CEO  
**Status**: Planning  
**Created**: 2026-01-13  
**Complexity**: High (Multi-phase implementation)  
**Context**: Brainstorming session 2026-01-12

---

## 📋 Epic Summary

A **standalone, modular quotation system** designed for post-production teams that:

- Creates quotations independently OR linked to projects
- Supports reusable templates and item libraries
- Enables client approval workflow with versioning
- Is architecturally portable as a Convex Component

**Key Insight from Brainstorming**: Quotation is a **first-class entity**, not a child of Project. This enables internal estimates, multi-project quotes, and future ERP capabilities.

---

## 🎯 User Outcomes

| Role          | Outcome                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| **Admin/CEO** | Create and manage quotations for any service, with or without a project |
| **Admin/CEO** | Reuse templates and library items for consistent, fast quoting          |
| **Admin/CEO** | Track quotation versions and revision history                           |
| **Client**    | View, approve, or request changes to quotations                         |
| **Client**    | See quotation status without calling the studio                         |

---

## 🗂️ Phased Implementation

### Phase A: Foundation (MVP)

**Goal**: Basic quotation CRUD with sections and line items

| Story | Description                                  | Points |
| ----- | -------------------------------------------- | ------ |
| 4.1   | Quotation Sections Configuration             | 3      |
| 4.2   | Quotation Templates CRUD                     | 5      |
| 4.3   | Create Quotation (Standalone)                | 8      |
| 4.4   | Quotation Line Items (with nested hierarchy) | 8      |
| 4.5   | Quotation Preview & Print                    | 3      |

### Phase B: Client Workflow

**Goal**: Enable client-facing quotation flow

| Story | Description                             | Points |
| ----- | --------------------------------------- | ------ |
| 4.6   | Send Quotation to Client                | 3      |
| 4.7   | Client View Quotation                   | 5      |
| 4.8   | Client Approve Quotation                | 3      |
| 4.9   | Client Request Changes (with notes)     | 5      |
| 4.10  | Quotation Versioning & Revision History | 8      |

### Phase C: Integration & Library

**Goal**: Connect quotations to projects, enable reuse

| Story | Description                         | Points |
| ----- | ----------------------------------- | ------ |
| 4.11  | Link Quotation to Project(s)        | 5      |
| 4.12  | Item Library CRUD                   | 8      |
| 4.13  | Add Items from Library to Quotation | 5      |
| 4.14  | Project Type Hints for Templates    | 3      |

### Phase D: ERP Extensions (Future)

**Goal**: Enterprise-level capabilities

| Story | Description                  | Points |
| ----- | ---------------------------- | ------ |
| 4.15  | Recurring Client Tracking    | 8      |
| 4.16  | Multi-Currency Support       | 5      |
| 4.17  | Payment Tracking & Invoicing | 13     |
| 4.18  | Quotation Expiry & Reminders | 5      |

---

## 📊 Data Architecture

### Core Tables (Phase A)

```typescript
// User-configurable sections (not hardcoded)
quotationSections: defineTable({
  name: v.string(), // "Design Services", "Post-Production"
  displayOrder: v.number(),
  icon: v.optional(v.string()), // Lucide icon name
  color: v.optional(v.string()), // Accent color
  isActive: v.boolean(),
}).index("by_isActive", ["isActive"]);

// Reusable templates (independent of project types)
quotationTemplates: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  lineItems: v.array(
    v.object({
      sectionId: v.id("quotationSections"),
      description: v.string(),
      unit: v.string(),
      unitPrice: v.number(),
      defaultQuantity: v.number(),
      subItems: v.optional(
        v.array(
          v.object({
            description: v.string(),
            unit: v.string(),
            unitPrice: v.number(),
            defaultQuantity: v.number(),
          })
        )
      ),
    })
  ),
  terms: v.optional(v.string()),
  projectTypeHint: v.optional(v.id("projectTypes")), // Soft filter
  isActive: v.boolean(),
  createdBy: v.id("profiles"),
  updatedAt: v.number(),
}).index("by_isActive", ["isActive"]);

// Main quotation entity (standalone, first-class)
quotations: defineTable({
  code: v.string(), // "QT-000001"
  version: v.number(), // 1, 2, 3... for revisions
  parentQuotationId: v.optional(v.id("quotations")), // Link to previous version

  // Client linking (optional for internal estimates)
  clientId: v.optional(v.id("profiles")),

  // Project linking (optional, can be 0, 1, or many)
  projectIds: v.optional(v.array(v.id("projects"))),

  // Template reference (if created from template)
  templateId: v.optional(v.id("quotationTemplates")),

  // Status workflow
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("viewed"),
    v.literal("approved"),
    v.literal("changes_requested"),
    v.literal("rejected"),
    v.literal("expired"),
    v.literal("superseded") // When a new version is created
  ),

  // Line items (with nested hierarchy)
  lineItems: v.array(
    v.object({
      id: v.string(), // Client-generated UUID for drag/drop
      sectionId: v.id("quotationSections"),
      description: v.string(),
      unit: v.string(),
      rate: v.number(),
      quantity: v.number(),
      length: v.optional(v.string()),
      width: v.optional(v.string()),
      image: v.optional(v.string()), // MinIO storage key
      subItems: v.optional(
        v.array(
          v.object({
            id: v.string(),
            description: v.string(),
            unit: v.string(),
            rate: v.number(),
            quantity: v.number(),
          })
        )
      ),
    })
  ),

  // Calculated totals
  subtotal: v.number(),
  taxRate: v.number(), // Configurable (0.18 for 18% GST)
  taxAmount: v.number(),
  total: v.number(),

  // Terms & validity
  terms: v.optional(v.string()),
  validUntil: v.optional(v.number()), // Timestamp

  // Client feedback (for changes_requested / rejected)
  clientNotes: v.optional(v.string()),

  // Audit
  createdBy: v.id("profiles"),
  sentAt: v.optional(v.number()),
  viewedAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  updatedAt: v.number(),
})
  .index("by_clientId", ["clientId"])
  .index("by_status", ["status"])
  .index("by_code", ["code"])
  .index("by_parentQuotationId", ["parentQuotationId"]);
```

### Extension Tables (Phase C)

```typescript
// Item Library for reuse
libraryItems: defineTable({
  sectionId: v.id("quotationSections"),
  category: v.string(), // Sub-category within section
  name: v.string(),
  description: v.optional(v.string()),
  unit: v.string(),
  defaultRate: v.number(),
  image: v.optional(v.string()),
  displayOrder: v.number(),
  isActive: v.boolean(),
})
  .index("by_sectionId", ["sectionId"])
  .index("by_isActive", ["isActive"]);
```

---

## 🔄 Status Workflow

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
┌───────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐│
│ draft │───▶│   sent   │───▶│  viewed  │───▶│ approved ││
└───────┘    └──────────┘    └──────────┘    └──────────┘│
                    │              │                      │
                    │              │         (revision)   │
                    │              ▼                      │
                    │       ┌──────────────────┐          │
                    │       │ changes_requested │──────────┘
                    │       └──────────────────┘
                    │              │
                    │              │
                    ▼              ▼
              ┌──────────┐  ┌──────────┐
              │ expired  │  │ rejected │
              └──────────┘  └──────────┘
```

**Versioning Flow:**

1. Client requests changes → Admin creates new version
2. Previous version marked as `superseded`
3. New version starts as `draft`, linked via `parentQuotationId`
4. Version number increments

---

## 🧩 Convex Component Structure (Modularity)

For maximum portability, structure as a local Convex Component:

```
convex/
├── components/
│   └── quotation/
│       ├── convex.config.ts      # Component definition
│       ├── _generated/           # Auto-generated
│       ├── schema.ts             # Quotation-specific tables
│       ├── quotations/
│       │   ├── queries.ts
│       │   ├── mutations.ts
│       │   └── internal.ts
│       ├── templates/
│       │   ├── queries.ts
│       │   └── mutations.ts
│       ├── sections/
│       │   ├── queries.ts
│       │   └── mutations.ts
│       └── library/              # Phase C
│           ├── queries.ts
│           └── mutations.ts
```

---

## 🎨 UI Component Structure

```
src/components/modules/quotation/
├── index.ts                      # Barrel exports
├── builder/
│   ├── quotation-builder.tsx     # Main editor
│   ├── line-item-row.tsx         # Single line item
│   ├── line-items-section.tsx    # Section container
│   ├── section-header.tsx
│   └── totals-footer.tsx
├── preview/
│   ├── quotation-preview.tsx
│   └── printable-quotation.tsx
├── list/
│   ├── quotation-list.tsx
│   ├── quotation-card.tsx
│   └── quotation-filters.tsx
├── templates/
│   ├── template-list.tsx
│   ├── template-drawer.tsx
│   └── template-card.tsx
├── library/                      # Phase C
│   ├── library-drawer.tsx
│   └── library-category-list.tsx
└── client-view/                  # Phase B
    ├── client-quotation-view.tsx
    ├── approval-buttons.tsx
    └── changes-requested-form.tsx
```

---

## ✅ Acceptance Criteria Summary

### Phase A MVP Success

- [ ] Admin can create quotation sections
- [ ] Admin can create/edit quotation templates
- [ ] Admin can create standalone quotation (no client/project required)
- [ ] Admin can add nested line items with sections
- [ ] Quotation calculates totals with configurable tax rate
- [ ] Preview and print modes work

### Phase B Client Workflow Success

- [ ] Admin can send quotation to client
- [ ] Client receives link and can view quotation
- [ ] Client can approve quotation
- [ ] Client can request changes with notes
- [ ] Versions are tracked with history

---

## 🔗 Dependencies

| This Epic | Depends On        | Notes                                 |
| --------- | ----------------- | ------------------------------------- |
| 4.x       | Epic 1 (Auth)     | User profiles for createdBy, clientId |
| 4.6+      | Epic 2 (optional) | Link to projects if desired           |
| Phase C   | Story 3.7         | Project types for filtering hints     |

---

## 📝 Brainstorming Session Notes

**Date**: 2026-01-12 to 2026-01-13  
**Techniques Used**: System Decomposition, Constraint Analysis  
**Key Decisions**:

1. Quotation is first-class, not child of Project
2. Templates independent of project types (optional hint only)
3. Sections are user-configurable, not hardcoded
4. Client linking is optional (internal estimates allowed)
5. Versioning with parentQuotationId link
6. Phased approach: MVP → Client Flow → Integration → ERP

---

## 🔄 Status Updates

| Date       | Status   | Notes                                   |
| ---------- | -------- | --------------------------------------- |
| 2026-01-13 | planning | Epic created from brainstorming session |

---

**Previous Epic**: Epic 3 - Admin Portal  
**Next Epic**: Epic 5 - Asset Upload & Folder Management
