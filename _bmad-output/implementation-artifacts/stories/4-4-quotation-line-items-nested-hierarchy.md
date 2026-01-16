# Story 4-4: Quotation Line Items Nested Hierarchy

**Epic**: Epic 4 - Quotation System  
**Status**: backlog  
**Complexity**: Medium (5 points)  
**Created**: 2026-01-16  
**Updated**: 2026-01-16  
**Priority**: LOW — Enhancement feature, not blocking client workflow

---

## 📋 User Story

**As an** Admin,  
**I want** to add, edit, and manage nested sub-items within quotation line items,  
**So that** I can create detailed hierarchical breakdowns for complex services.

---

## 🔗 Dependencies & Context

### Implementation Order

```
┌─────────────────────────────────────────────────────────────┐
│                 IMPLEMENTATION FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  4.3 Create Quotation ───────┤ (DONE - basic items)          │
│                              ▼                               │
│  4.4 Line Items Nested ──────┤ ← PARTIAL (display only)      │
│                              ▼                               │
│  4.5 Preview & Print ────────┘ (DONE - uses nested display)  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Current Implementation Status

### ✅ What IS Implemented (Display Only)

The following display functionality exists and works:

1. **Template Line Items Table** - Displays sub-items if they exist in data
2. **Quotation Builder** - Shows sub-items in read-only nested rows
3. **Quotation Detail** - Displays sub-items with indentation
4. **Preview/Print** - Renders sub-items with parent.child numbering (1.1, 1.2)
5. **Section-wise Breakdown** - "All Items" view groups by sections

### ❌ What is NOT Implemented (CRUD)

The following functionality is **pending**:

1. **Add Sub-Item** - No UI to add a sub-item under a parent item
2. **Edit Sub-Item** - No drawer/form to edit sub-item details
3. **Delete Sub-Item** - No ability to remove individual sub-items
4. **Reorder Sub-Items** - No drag-drop for sub-item ordering
5. **Convert to Sub-Item** - No ability to demote an item to sub-item
6. **Promote Sub-Item** - No ability to promote sub-item to parent

---

## ✅ Acceptance Criteria (Full Implementation)

### Sub-Items CRUD

- [ ] **Given** I am editing a line item
- [ ] **When** I click "Add Sub-Item"
- [ ] **Then** a drawer opens to add a new sub-item
- [ ] **And** the sub-item is nested under the parent

### Sub-Item Management

- [ ] **Given** a line item has sub-items
- [ ] **When** I view the items table
- [ ] **Then** I see expand/collapse for parent items
- [ ] **And** sub-items show edit/delete actions on hover

### Sub-Item in Drawer

- [ ] **Given** I am in the line item drawer
- [ ] **When** the item is a sub-item
- [ ] **Then** I see indication of parent item
- [ ] **And** I can edit sub-item independently

### Reordering

- [ ] **Given** I have multiple sub-items
- [ ] **When** I drag to reorder
- [ ] **Then** sub-items reorder within their parent

---

## 📁 Components Needing Updates

### For Full CRUD Implementation

| Component                | Current                   | Needed                                   |
| ------------------------ | ------------------------- | ---------------------------------------- |
| `LineItemDrawer`         | Creates parent items only | Add "parent item" selector for sub-items |
| `LineItemsTable`         | Display sub-items only    | Add expand/collapse, sub-item actions    |
| `TemplateLineItemsTable` | Display only              | Add sub-item action buttons              |
| Schema/Mutations         | Sub-items in array        | Possibly separate table for better CRUD  |

---

## 🛠 Technical Considerations

### Current Data Structure (Embedded)

```typescript
// Current: Sub-items embedded in parent
interface LineItem {
  id: string;
  description: string;
  subItems?: {
    description: string;
    unit: string;
    quantity: number;
    rate: number;
  }[];
}
```

### Alternative: Separate Table (For Full CRUD)

```typescript
// Alternative: Sub-items as separate documents
interface SubItem {
  _id: Id<"quotationSubItems">;
  parentItemId: Id<"quotationLineItems">;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  displayOrder: number;
}
```

---

## 🚀 Definition of Done

- [ ] Add Sub-Item button in line items table
- [ ] Sub-item drawer/form
- [ ] Edit sub-item functionality
- [ ] Delete sub-item functionality
- [ ] Expand/collapse parent items
- [ ] Sub-item reordering
- [ ] Story marked as `done` in `sprint-status.yaml`

---

## 🔄 Status Updates

| Date       | Status  | Notes                                              |
| ---------- | ------- | -------------------------------------------------- |
| 2026-01-16 | backlog | Display implemented, CRUD deferred for later phase |

---

**Previous Story**: 4-3 - Create Quotation Standalone  
**Next Story**: 4-5 - Quotation Preview & Print
