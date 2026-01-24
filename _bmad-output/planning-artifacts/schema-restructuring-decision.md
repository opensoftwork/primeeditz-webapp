# PrimeEditz Schema Restructuring Decision Document

**Date:** 2026-01-23  
**Status:** ✅ Epic Breakdown Complete — [View Epics](./epics/11-system-restructuring-revamp.md)  
**Session:** Brainstorming with PM/Architect perspectives

---

## Executive Summary

This document captures architectural decisions for restructuring the PrimeEditz platform to better support:

1. Clear terminology (Client → Studio)
2. End clients as metadata labels on projects
3. Quotation-driven project initialization
4. Flexible folder templates for event segregation (not workflow management)
5. Future extensibility for physical services (camera setups, equipment rental)

---

## 1. Key Decisions

### 1.1 Terminology: Client → Studio

| Current  | New      | Rationale                                                                                     |
| -------- | -------- | --------------------------------------------------------------------------------------------- |
| `client` | `studio` | Studios are B2B partners who outsource work to PrimeEditz. Their customers are "end clients". |

**What This Means:**

- A **Studio** is a photography/videography business that sends projects to PrimeEditz
- An **End Client** is the studio's customer (e.g., "Ram & Priya Wedding")
- End clients are **metadata only** (a label on projects) — they do NOT have user accounts

**Current Implementation:**

- Role validator includes `client`
- Routes use `@client`
- Queries filter by `role: 'client'`

**Impact Assessment:**

- Schema change: 1 line (`roleValidator`)
- Route rename: `@client` folder → `@studio`
- Query updates: ~30 files reference role='client'
- UI label updates: ~50+ string occurrences

**Decision:** ✅ **DEFERRED TO PHASE 2**

- Will implement after core flow is validated
- Current system works; this is terminology cleanup

---

### 1.2 End Client as Metadata

**Current State:**

```typescript
projects: defineTable({
  // ...
  endClientName: v.optional(v.string()), // Already exists!
  // ...
});
```

**Decision:** ✅ **KEEP AS-IS (Already Implemented)**

- `endClientName` field already exists on projects
- This is sufficient for Phase 1
- No new table needed for end clients

**Future Consideration:** If end clients ever need:

- Their own login access
- Direct file download links
- Feedback submission

Then we would add an `endClients` table. Not needed now.

---

### 1.3 Folder Templates: Purpose Clarification

**Current Misunderstanding:** Folder templates were structured for workflow (Raw → WIP → Draft → Final)

**Corrected Understanding:** Folder templates are for **event segregation** (organizing raw materials by ceremony/day/event)

**Examples of Event-Based Folders:**

| Wedding Type  | Folder Structure                                                                  |
| ------------- | --------------------------------------------------------------------------------- |
| Hindu/Brahmin | Day 1 - Naandi, Day 2 - Muhurtham, Day 3 - Grihapravesham, Reception, Pre-Wedding |
| Christian     | Pre-Wedding Shoot, Church Ceremony, Reception, Couple Portraits                   |
| Muslim        | Mehndi, Nikkah, Walima, Reception                                                 |
| South Indian  | Vratham, Muhurtham, Reception, Games & Rituals                                    |

**Schema Enhancement (Optional - for future):**

```typescript
folderTemplates: defineTable({
  name: v.string(),
  folders: v.array(v.string()),
  projectTypeId: v.optional(v.id("projectTypes")),
  isDefault: v.optional(v.boolean()),
  isActive: v.boolean(),
  // NEW (Future)
  variant: v.optional(v.string()), // e.g., "Hindu", "Christian"
  description: v.optional(v.string()), // For admin selection UI
});
```

**Decision:** ✅ **ENHANCE SEEDING ONLY (Phase 1)**

- Keep schema as-is
- Update seed data to reflect event-based folder naming
- Add more folder template variants in seeding

---

### 1.4 Quotation Templates: Line Item Configuration

**Current State:**

```typescript
quotationTemplates.lineItems: [
  {
    sectionId: Id<"quotationSections">,
    description: string,
    unit: string,
    unitPrice: number,
    defaultQuantity: number,
    subItems?: [...],
  }
]
```

**Library Items Already Have:**

```typescript
quotationLibraryItems: {
  projectTypeHint: v.optional(v.id('projectTypes')), // Already exists!
}
```

**Proposed Enhancement for Future:**

```typescript
quotationTemplates.lineItems: [
  {
    // Existing fields...
    sectionId, description, unit, unitPrice, defaultQuantity, subItems,

    // NEW: Project Creation Configuration
    spawnsProject: v.optional(v.boolean()),       // Should this create a project?
    projectTypeId: v.optional(v.id('projectTypes')), // Which type?
    folderTemplateOptions: v.optional(
      v.array(v.id('folderTemplates'))            // Allowed folder template variants
    ),

    // NEW: For physical/equipment items
    isPhysicalItem: v.optional(v.boolean()),      // Camera setup, prints, etc.
    requiresScheduling: v.optional(v.boolean()),  // Needs date/time booking?
  }
]
```

**Decision:** ✅ **PARTIAL IMPLEMENTATION (Phase 1)**

- Phase 1: Add `spawnsProject` and `projectTypeId` only
- Phase 2: Add `folderTemplateOptions` and physical item flags

---

### 1.5 Quotation Sections: Keep As-Is

**Current Sections:**

1. Photo Color Correction
2. Album Design
3. Video Editing
4. Teasers & Highlights
5. VFX & Effects
6. Deliverables
7. Add-ons & Rush

**Purpose:** UI grouping for quotation builder (not project creation logic)

**Decision:** ✅ **KEEP AS-IS**

- Sections serve their purpose well
- Project type linkage is handled by `projectTypeId` on line items
- No changes needed

---

### 1.6 Project Creation Flow

**Current Flow:**

```
Admin creates project → Admin creates quotation → Links to project → Sends to client
```

**Proposed New Flow (Phase 2):**

```
Studio selects package → Quote Request created → Admin configures & sends quotation
  → Studio approves → Projects auto-created from line items → Studio uploads files
```

**Key Changes:**

1. Studio initiates by selecting a quotation template
2. Admin configures (selects folder template variants, allocates storage)
3. Quotation approval triggers project creation (for items with `spawnsProject: true`)

**Decision:** ✅ **IMPLEMENT IN PHASE 2**

- Current flow works for now
- This is the target architecture

---

## 2. What Stays Unchanged

| Component                                       | Status  | Reason                        |
| ----------------------------------------------- | ------- | ----------------------------- |
| Project lifecycle phases                        | ✅ Keep | Already well-designed         |
| Action states (draft, awaiting_quotation, etc.) | ✅ Keep | Already well-designed         |
| Status machine                                  | ✅ Keep | Already well-designed         |
| Employee assignment flow                        | ✅ Keep | Works correctly               |
| Asset upload flow                               | ✅ Keep | Works correctly               |
| Deliverables table                              | ✅ Keep | Works correctly               |
| Storage tiers                                   | ✅ Keep | Works correctly               |
| Profile system                                  | ✅ Keep | Only role rename needed later |

---

## 3. Implementation Plan

### Phase 1: Immediate (Seeding & Minor Schema)

**Goal:** Make current system more accurate without breaking changes

| Task                                                       | Type       | Impact               |
| ---------------------------------------------------------- | ---------- | -------------------- |
| Update folder template seeds with event-based naming       | Seed       | None                 |
| Add more folder template variants (Hindu, Christian, etc.) | Seed       | None                 |
| Add `variant` and `description` fields to folderTemplates  | Schema     | Backwards compatible |
| Verify quotation → project linkage works                   | Validation | None                 |

**Timeline:** 1-2 hours

### Phase 2: Flow Restructuring

**Goal:** Implement studio-initiated quote flow

| Task                                                                     | Type        | Impact               |
| ------------------------------------------------------------------------ | ----------- | -------------------- |
| Add `spawnsProject` and `projectTypeId` to quotation template line items | Schema      | Backwards compatible |
| Create quote request flow (studio selects template)                      | New feature | New code             |
| Implement auto project creation on quote approval                        | Logic       | New code             |
| Update folder template selection UI for admin                            | UI          | New code             |

**Timeline:** 4-6 hours

### Phase 3: Terminology & Polish

**Goal:** Clean up naming

| Task                                 | Type         | Impact          |
| ------------------------------------ | ------------ | --------------- |
| Rename `client` → `studio` in schema | Breaking     | Needs migration |
| Rename `@client` route → `@studio`   | Breaking     | Route changes   |
| Update all UI labels                 | Non-breaking | UI text only    |

**Timeline:** 2-3 hours

---

## 4. Future Extensibility: Physical Services

The system should support:

- Camera equipment rental
- Printing services
- Physical album production
- On-site setup services

**Proposed Line Item Enhancements (Future):**

```typescript
{
  // ... existing fields

  // Physical Item Configuration
  isPhysicalItem: v.optional(v.boolean()),
  requiresScheduling: v.optional(v.boolean()),
  schedulingConfig: v.optional(v.object({
    minLeadTimeDays: v.number(),
    requiresLocation: v.boolean(),
    requiresDuration: v.boolean(),
  })),

  // Inventory Tracking (if needed)
  inventoryItemId: v.optional(v.id('inventoryItems')), // Future table

  // Delivery Configuration
  deliveryType: v.optional(v.union(
    v.literal('digital'),
    v.literal('physical'),
    v.literal('service'),
  )),
}
```

**Decision:** ✅ **NOTED FOR FUTURE** - Not implementing now

---

## 5. Questions Resolved

| Question                                        | Answer                                                                        |
| ----------------------------------------------- | ----------------------------------------------------------------------------- |
| Does end client need login?                     | No - metadata only                                                            |
| Should all line items create projects?          | No - only those with `spawnsProject: true`                                    |
| Are folder templates for workflow?              | No - for event segregation                                                    |
| Do quotation sections map 1:1 to project types? | No - sections are UI grouping only                                            |
| Will this break current project flow?           | No - project flow stays as-is                                                 |
| **Multi-project quotations?**                   | **YES.** UI will show linked projects in both template and instance.          |
| **Partial delivery?**                           | **YES.** Handled via project-specific delivery times within the master quote. |
| **Physical-only templates?**                    | **YES.** Templates can have items (e.g., Camera Setup) with no projects.      |
| **Employee assignment?**                        | **Per-Project.** Employees are assigned to specific projects, not the quote.  |

---

## 6. Open Questions (Parking Lot)

_All critical architectural questions from the initial sessions have been resolved. Implementation details will be captured in User Stories._

---

## 7. Appendix: Current Schema Reference

### Key Tables Involved

```typescript
// Profiles (has role: client | employee | admin)
profiles.role → Will become: studio | employee | admin

// Projects (links to client profile and project type)
projects.clientId → Links to studio profile
projects.endClientName → String label for studio's customer
projects.projectTypeId → Determines folder template suggestion

// Quotations (links to client, projects, template)
quotations.clientId → Studio profile ID
quotations.projectId / projectIds → Linked project(s)
quotations.templateId → Source template

// Quotation Templates (package definitions)
quotationTemplates.lineItems[] → Line items with pricing
  → Will add: spawnsProject, projectTypeId

// Folder Templates (event organization)
folderTemplates.folders[] → Array of folder names
folderTemplates.projectTypeId → Optional type hint
  → Will add: variant, description
```

---

## 8. Sign-off

This document represents the understanding from the 2026-01-23 brainstorming session.

**Next Action:** Implement Phase 1 (seeding updates + minor schema additions)

---

## 9. Detailed Impact Assessment: client → studio Rename

### 9.1 Schema Changes Required

**File: `convex/schema.ts`**

| Line    | Current                                      | Change To                              | Notes            |
| ------- | -------------------------------------------- | -------------------------------------- | ---------------- |
| 17      | `v.literal('client')`                        | `v.literal('studio')`                  | Role validator   |
| 71      | `v.literal('client_request')`                | Keep or rename to `studio_request`     | Project source   |
| 195     | Comment: "No Client"                         | Comment update only                    | Documentation    |
| 200     | Comment: "client \| admin \| employee"       | Update comment                         | Documentation    |
| 247     | `index('by_clientId', ...)`                  | Keep (index name, not role)            | No change needed |
| 392-445 | `clientId`, `clientNotes`, `clientSignature` | Keep (field names referring to studio) | Optional rename  |

**Verdict:** Only line 17 is a **functional change**. The rest are comments/fields that can stay as-is.

### 9.2 Route Changes Required

**Current Structure:**

```
src/app/(protected)/
├── @admin/        (30 files)
├── @client/       (9 files) ← RENAME TO @studio
├── @employee/     (2 files)
└── layout.tsx     (references client slot)
```

**Changes Required:**

1. Rename folder: `@client` → `@studio`
2. Update `layout.tsx`:
   - Line 30: `client: React.ReactNode` → `studio: React.ReactNode`
   - Line 37: `client` prop → `studio` prop
   - Line 127-128: `case "client": return client;` → `case "studio": return studio;`

### 9.3 Query/Mutation Changes

**Files Referencing `role: 'client'` or `'client'` in role context:**

| File                                 | Type    | Change Required                     |
| ------------------------------------ | ------- | ----------------------------------- |
| `convex/profiles.ts`                 | Backend | Update role checks                  |
| `convex/functions/admin/clients.ts`  | Backend | Update queries                      |
| `convex/functions/admin/projects.ts` | Backend | Line 43: query by role='client'     |
| `convex/lib/customFunctions.ts`      | Backend | `clientMutation` → `studioMutation` |

**Estimated: ~10-15 backend files**

### 9.4 Frontend Component Changes

**Sidebar Navigation:**

- `src/components/modules/sidebar/app-sidebar.tsx` - Role-based nav items

**Labels & Display Text:**

- Various components display "Client" in UI text
- Search: ~50+ occurrences of "client" (many unrelated to role)

### 9.5 Safe vs Breaking Classification

| Change Type                        | Breaking? | Needs Migration?        |
| ---------------------------------- | --------- | ----------------------- |
| Role validator `client` → `studio` | YES       | Yes - existing profiles |
| Route folder rename                | NO        | No - just file rename   |
| Field names (`clientId`)           | NO        | Optional - can keep     |
| UI labels                          | NO        | Just text changes       |

### 9.6 Migration Script Required

```typescript
// Migration: Update existing profiles with role='client' to role='studio'
export const migrateClientToStudio = internalMutation({
  handler: async (ctx) => {
    const clients = await ctx.db
      .query("profiles")
      .withIndex("by_role", (q) => q.eq("role", "client"))
      .collect();

    for (const profile of clients) {
      await ctx.db.patch(profile._id, { role: "studio" as any });
    }

    return { migrated: clients.length };
  },
});
```

---

## 10. What Stays Unchanged (Confirmed)

After detailed analysis, these components are **NOT affected** by the restructuring:

| Component               | Why Unchanged                  |
| ----------------------- | ------------------------------ |
| Project phases & states | No dependency on role naming   |
| Status machine logic    | Uses state names, not roles    |
| Folder initialization   | Triggered by project, not role |
| Asset upload flow       | Uses profile ID, not role      |
| Quotation mutations     | Uses profile ID, not role      |
| Employee assignment     | Separate from client/studio    |
| Storage tier logic      | No role dependency             |

---

## 11. Recommended Implementation Order

### Order 1: Non-Breaking Enhancements (Do First)

1. ✅ Update folder template seeding with event-based names
2. ✅ Add `variant` and `description` fields to `folderTemplates` schema
3. ✅ Add more folder template variants in seeds

### Order 2: Quote Flow Enhancement (After Order 1)

4. Add `spawnsProject` and `projectTypeId` to quotation template line items
5. Build quote request UI for studios
6. Implement auto-project creation logic

### Order 3: Terminology Cleanup (After Order 2)

7. Add `studio` to role validator (alongside `client`)
8. Run migration to convert existing `client` → `studio`
9. Remove `client` from role validator
10. Rename `@client` folder to `@studio`
11. Update layout.tsx slot references
12. Update UI labels

---

## 12. Quick Reference: Current vs Future State

### Quotation Template Line Item (Current)

```typescript
{
  sectionId: Id<"quotationSections">,
  description: string,
  unit: string,
  unitPrice: number,
  defaultQuantity: number,
  subItems?: Array<...>,
}
```

### Quotation Template Line Item (Future)

```typescript
{
  // Existing
  sectionId: Id<"quotationSections">,
  description: string,
  unit: string,
  unitPrice: number,
  defaultQuantity: number,
  subItems?: Array<...>,

  // NEW (Phase 2)
  spawnsProject?: boolean,
  projectTypeId?: Id<"projectTypes">,
  folderTemplateOptions?: Array<Id<"folderTemplates">>,

  // NEW (Future - Physical Items)
  isPhysicalItem?: boolean,
  requiresScheduling?: boolean,
}
```

### Folder Template (Current)

```typescript
{
  name: string,
  folders: string[],
  projectTypeId?: Id<"projectTypes">,
  isDefault?: boolean,
  isActive: boolean,
}
```

### Folder Template (Future)

```typescript
{
  name: string,
  folders: string[],
  projectTypeId?: Id<"projectTypes">,
  isDefault?: boolean,
  isActive: boolean,

  // NEW (Phase 1)
  variant?: string,      // "Hindu", "Christian", "Muslim", etc.
  description?: string,  // For admin selection UI
}
```

---

_Document Version: 1.1_  
_Last Updated: 2026-01-23 22:15 IST_
