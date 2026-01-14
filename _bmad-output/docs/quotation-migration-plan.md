# Quotation System Migration Plan

## Overview

This document outlines the migration from the Convex Components architecture to standard Convex tables for the Quotation system. The components approach was initially chosen for modularity, but has proven problematic due to:

1. **Type isolation** - Component tables don't export types to the main application
2. **Manual type maintenance** - We must manually define and maintain TypeScript interfaces that mirror component schemas
3. **API bridging overhead** - Every query/mutation needs to be re-exported through a bridge file
4. **Linting issues** - Continuous type mismatches between expected and actual types

## Current Architecture (Components)

```
convex/
├── components/
│   └── quotation/
│       ├── component.config.ts      # Component configuration
│       ├── schema.ts                # Isolated schema (not in main schema)
│       ├── _generated/              # Component-specific generated types
│       ├── sections/
│       │   ├── mutations.ts
│       │   └── queries.ts
│       ├── templates/
│       │   ├── mutations.ts
│       │   └── queries.ts
│       └── quotations/
│           ├── mutations.ts
│           └── queries.ts
├── quotation.ts                     # Bridge file (re-exports)
└── convex.config.ts                 # Mounts the component
```

**Problems:**

- Types like `Id<"quotationSections">` are NOT available in main app
- Must cast to `any` or manually define types
- Changes to component schema require updating manual type definitions
- No IDE autocomplete for component types in main app

## Target Architecture (Standard Tables)

```
convex/
├── schema.ts                        # All tables including quotation tables
├── functions/
│   └── quotations/
│       ├── mutations.ts
│       ├── queries.ts
│       └── index.ts
└── _generated/
    └── dataModel.d.ts               # All types including quotation types
```

**Benefits:**

- Full type inference with `Doc<"quotations">`, `Id<"quotations">`
- Single source of truth for schema
- No bridge files needed
- IDE autocomplete works perfectly

## Migration Steps

### Phase 1: Schema Migration

1. **Add tables to main schema** (`convex/schema.ts`):

```typescript
// Quotation Sections
quotationSections: defineTable({
  name: v.string(),
  icon: v.optional(v.string()),
  color: v.optional(v.string()),
  displayOrder: v.optional(v.number()),
  isActive: v.boolean(),
})
  .index("by_isActive", ["isActive"])
  .index("by_displayOrder", ["displayOrder"]),

// Quotation Templates
quotationTemplates: defineTable({
  name: v.string(),
  description: v.optional(v.string()),
  projectTypeHint: v.optional(v.string()),
  terms: v.optional(v.string()),
  isActive: v.boolean(),
  lineItems: v.array(v.object({
    sectionId: v.id("quotationSections"),
    description: v.string(),
    unit: v.string(),
    unitPrice: v.number(),
    defaultQuantity: v.number(),
    subItems: v.optional(v.array(v.object({
      description: v.string(),
      unit: v.string(),
      unitPrice: v.number(),
      defaultQuantity: v.number(),
    }))),
  })),
  createdBy: v.optional(v.string()),
})
  .index("by_isActive", ["isActive"]),

// Quotations
quotations: defineTable({
  code: v.string(),
  version: v.number(),
  parentQuotationId: v.optional(v.id("quotations")),
  clientId: v.optional(v.string()),
  projectId: v.optional(v.string()),
  projectIds: v.optional(v.array(v.string())),
  templateId: v.optional(v.id("quotationTemplates")),
  status: v.union(
    v.literal("draft"),
    v.literal("sent"),
    v.literal("viewed"),
    v.literal("approved"),
    v.literal("changes_requested"),
    v.literal("rejected"),
    v.literal("expired"),
    v.literal("superseded")
  ),
  lineItems: v.array(v.object({
    id: v.string(),
    sectionId: v.id("quotationSections"),
    description: v.string(),
    unit: v.string(),
    rate: v.number(),
    quantity: v.number(),
    length: v.optional(v.string()),
    width: v.optional(v.string()),
    image: v.optional(v.string()),
    subItems: v.optional(v.array(v.object({
      id: v.string(),
      description: v.string(),
      unit: v.string(),
      rate: v.number(),
      quantity: v.number(),
    }))),
  })),
  subtotal: v.number(),
  taxRate: v.number(),
  taxAmount: v.number(),
  discountAmount: v.optional(v.number()),
  total: v.number(),
  terms: v.optional(v.string()),
  validUntil: v.optional(v.number()),
  clientNotes: v.optional(v.string()),
  createdBy: v.string(),
  sentAt: v.optional(v.number()),
  viewedAt: v.optional(v.number()),
  approvedAt: v.optional(v.number()),
  rejectedAt: v.optional(v.number()),
  updatedAt: v.number(),
})
  .index("by_code", ["code"])
  .index("by_clientId", ["clientId"])
  .index("by_status", ["status"])
  .index("by_templateId", ["templateId"]),
```

### Phase 2: Function Migration

2. **Create new functions in standard location**:

```
convex/functions/quotations/
├── sections/
│   ├── mutations.ts
│   └── queries.ts
├── templates/
│   ├── mutations.ts
│   └── queries.ts
├── mutations.ts
├── queries.ts
└── index.ts
```

3. **Update functions to use main schema types**:
   - Replace component imports with standard Convex imports
   - Use `Id<"quotationSections">` instead of component-isolated types
   - Use `Doc<"quotations">` for return types

### Phase 3: Data Migration

4. **Create migration script**:

```typescript
// convex/migrations/migrateQuotations.ts
import { internalMutation } from "../_generated/server";

export const migrateFromComponent = internalMutation({
  handler: async (ctx) => {
    // 1. Read all data from component tables
    // 2. Insert into new main schema tables
    // 3. Return migration stats
  },
});
```

### Phase 4: Frontend Updates

5. **Update type imports**:

```typescript
// Before (manual types)
import type { Template, Section } from "./types";

// After (auto-generated)
import type { Doc, Id } from "@convex/_generated/dataModel";
type Template = Doc<"quotationTemplates">;
type Section = Doc<"quotationSections">;
```

6. **Update API imports**:

```typescript
// Before
api.quotation.getTemplates;

// After
api.functions.quotations.templates.queries.getActive;
```

### Phase 5: Cleanup

7. **Remove component infrastructure**:
   - Delete `convex/components/quotation/` directory
   - Remove component from `convex.config.ts`
   - Delete bridge file `convex/quotation.ts`
   - Delete manual type definitions in frontend

## Files to Modify

### Add to `convex/schema.ts`:

- `quotationSections` table
- `quotationTemplates` table
- `quotations` table

### Create:

- `convex/functions/quotations/sections/mutations.ts`
- `convex/functions/quotations/sections/queries.ts`
- `convex/functions/quotations/templates/mutations.ts`
- `convex/functions/quotations/templates/queries.ts`
- `convex/functions/quotations/mutations.ts`
- `convex/functions/quotations/queries.ts`
- `convex/functions/quotations/index.ts`

### Delete:

- `convex/components/quotation/` (entire directory)
- `convex/quotation.ts` (bridge file)

### Update:

- `convex/convex.config.ts` - Remove component mount
- `src/components/modules/admin/quotations/builder/types.ts` - Use `Doc<>` types
- `src/components/modules/admin/quotations/builder/quotation-builder-context.tsx` - Update imports
- `src/components/modules/admin/quotation-templates/*.tsx` - Update API paths

## Rollback Plan

If issues arise during migration:

1. Keep component code in separate branch
2. Data remains in component tables until verified
3. Can revert to bridge pattern if needed

## Timeline

| Phase                 | Duration | Dependencies     |
| --------------------- | -------- | ---------------- |
| 1. Schema Migration   | 30 min   | None             |
| 2. Function Migration | 2 hours  | Phase 1          |
| 3. Data Migration     | 30 min   | Phase 2          |
| 4. Frontend Updates   | 1 hour   | Phase 3          |
| 5. Cleanup            | 30 min   | Phase 4 verified |

**Total Estimated Time: ~5 hours**

## Success Criteria

- [ ] All quotation tables in main `schema.ts`
- [ ] Types auto-generated and available via `Doc<>` and `Id<>`
- [ ] No `any` type casts in quotation builder
- [ ] All existing data migrated successfully
- [ ] Component directory deleted
- [ ] All linting errors resolved
- [ ] Quotation CRUD operations working
