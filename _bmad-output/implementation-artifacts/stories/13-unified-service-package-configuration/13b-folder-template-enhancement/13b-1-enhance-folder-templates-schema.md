# Story 13B.1: Enhance `folderTemplates` Schema

**Status**: backlog  
**Points**: 3  
**Epic**: [13B: Folder Template Enhancement](../../../../planning-artifacts/epics/13b-folder-template-enhancement.md)  
**Depends On**: Epic 13A complete

---

## User Story

**As a** Developer,  
**I want** folder templates to support 3-level hierarchical structures,  
**So that** we can create organized folder layouts like `/Photos/Family/Close-ups`.

---

## Acceptance Criteria

### AC1: Depth-Limited Validators (NO RECURSION!)

**Given** Convex does NOT support `v.lazy()` or recursive validators  
**When** I create the folder structure validators  
**Then** I define 3 explicit level validators:

- `folderLevel3Validator` (leaf node - NO children)
- `folderLevel2Validator` (can have Level 3 children)
- `folderLevel1Validator` (root level - can have Level 2 children)

### AC2: Folder Validator Structure

**Given** each folder level validator  
**When** defined  
**Then** each includes:

- `name: v.string()` - Folder display name
- `path: v.string()` - Full path (e.g., "/Photos/Family")
- `description: v.optional(v.string())` - Help text
- `isRequired: v.optional(v.boolean())` - Is upload required?

**And** Level 1 and Level 2 have `children: v.optional(v.array(nextLevelValidator))`

**And** Level 3 has NO children field (leaf nodes)

### AC3: Updated Table Definition

**Given** the new validators  
**When** I update the `folderTemplates` table  
**Then** it includes:

- `name: v.string()` - Template name
- `projectTypeId: v.id("projectTypes")` - Required link
- `variant: v.optional(v.string())` - E.g., "South Indian", "Christian"
- `description: v.optional(v.string())` - Template description
- `folders: v.array(folderLevel1Validator)` - Root folders
- `isDefault: v.optional(v.boolean())` - Default for project type
- `isActive: v.boolean()` - Active status

### AC4: Indexes

**Given** the table definition  
**When** adding indexes  
**Then** create:

- `by_projectTypeId` on `["projectTypeId"]`
- `by_isActive` on `["isActive"]`

### AC5: Schema Compilation

**Given** all changes are complete  
**When** I run `pnpm convex dev --once`  
**Then** the schema compiles without errors

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/schema.ts
  - Add folderLevel3Validator
  - Add folderLevel2Validator
  - Add folderLevel1Validator
  - Update folderTemplates table definition
```

### Code Example

```typescript
// convex/schema.ts

// ⚠️ CRITICAL: Define validators BOTTOM-UP (Level 3 first!)
// Convex does NOT support v.lazy() - no recursion!

// Level 3: Leaf nodes (no children allowed)
const folderLevel3Validator = v.object({
  name: v.string(),
  path: v.string(),
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  // NO children field - this is a leaf node
});

// Level 2: Can have Level 3 children
const folderLevel2Validator = v.object({
  name: v.string(),
  path: v.string(),
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  children: v.optional(v.array(folderLevel3Validator)),
});

// Level 1: Root folders, can have Level 2 children
const folderLevel1Validator = v.object({
  name: v.string(),
  path: v.string(),
  description: v.optional(v.string()),
  isRequired: v.optional(v.boolean()),
  children: v.optional(v.array(folderLevel2Validator)),
});

// Folder Templates table
folderTemplates: defineTable({
  // Identity
  name: v.string(),
  description: v.optional(v.string()),

  // Project Type Link (required)
  projectTypeId: v.id("projectTypes"),

  // Cultural/Style Variant (optional)
  variant: v.optional(v.string()),

  // Hierarchical Folder Structure (max 3 levels)
  folders: v.array(folderLevel1Validator),

  // Defaults
  isDefault: v.optional(v.boolean()),
  isActive: v.boolean(),
})
  .index("by_projectTypeId", ["projectTypeId"])
  .index("by_isActive", ["isActive"]),
```

### Example Folder Data Structure

```typescript
// Example folder structure for Wedding Photography
{
  name: "South Indian Wedding",
  projectTypeId: "...",
  variant: "South Indian",
  folders: [
    {
      name: "Photos",                    // Level 1
      path: "/Photos",
      description: "All photography assets",
      children: [
        {
          name: "Muhurtham",             // Level 2
          path: "/Photos/Muhurtham",
          isRequired: true,
          children: [
            {
              name: "Close-ups",         // Level 3 (leaf)
              path: "/Photos/Muhurtham/Close-ups",
            },
          ],
        },
      ],
    },
  ],
  isActive: true,
}
```

---

## ❌ DO NOT

- ❌ Do NOT use `v.lazy()` - Convex doesn't support it!
- ❌ Do NOT add `children` to Level 3 validator - it must be a leaf
- ❌ Do NOT exceed 3 nesting levels
- ❌ Do NOT make `projectTypeId` optional
- ❌ Do NOT define validators top-down (Level 1 first) - it won't compile

### ❌ WRONG (Will NOT compile!)

```typescript
// ❌ THIS WILL FAIL - Convex doesn't support recursion
const folderValidator = v.object({
  name: v.string(),
  children: v.optional(v.array(v.lazy(() => folderValidator))),
});

// ❌ THIS WILL ALSO FAIL - referencing before definition
const folderLevel1Validator = v.object({
  children: v.optional(v.array(folderLevel2Validator)), // Error!
});
const folderLevel2Validator = v.object({...});
```

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - schema compiles
- [ ] Run `pnpm tsc --noEmit` - no TypeScript errors
- [ ] Verify `folderTemplates` type includes `projectTypeId` as required
- [ ] Verify folder structure allows 3 levels max

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
