# Story 13B.2: Create Wedding Folder Template Seeds

**Status**: backlog  
**Points**: 3  
**Epic**: [13B: Folder Template Enhancement](../../../../planning-artifacts/epics/13b-folder-template-enhancement.md)  
**Depends On**: Story 13B.1

---

## User Story

**As a** Developer,  
**I want** pre-built wedding folder templates for different traditions,  
**So that** admins have useful starting points for folder structures.

---

## Acceptance Criteria

### AC1: South Indian Traditional Wedding Template

**Given** a wedding photography project type  
**When** I create the South Indian template  
**Then** it includes this folder structure:

```
/Photos
  /Muhurtham (Required)
  /Vardhaani
  /Reception
  /Family
  /Couple
/Video
  /Ceremony
  /Drone
/Audio
  /Songs
/Album
  /References
```

### AC2: Christian Wedding Template

**Given** a wedding photography project type  
**When** I create the Christian template  
**Then** it includes this folder structure:

```
/Photos
  /Church Ceremony (Required)
  /Reception
  /Couple
  /Bridal Party
  /Family
/Video
  /Ceremony
  /Reception
```

### AC3: North Indian Wedding Template

**Given** a wedding photography project type  
**When** I create the North Indian template  
**Then** it includes this folder structure:

```
/Photos
  /Haldi
  /Mehendi
  /Sangeet
  /Baraat
  /Pheras (Required)
  /Reception
/Video
  /Events
```

### AC4: Seed Integration

**Given** the folder template seeds  
**When** the main seed function runs  
**Then** all 3 wedding templates are created  
**And** each links to the appropriate wedding project type

### AC5: One Default Per Project Type

**Given** multiple variants exist  
**When** seeding  
**Then** only ONE template has `isDefault: true` per project type

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/seeds/folderTemplates.ts
  - Replace flat array seeds with hierarchical structure
  - Add 3 wedding variants

MODIFY: convex/functions/seed.ts
  - Ensure seedFolderTemplates is called
```

### Seed Data Example

```typescript
// convex/seeds/folderTemplates.ts

import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

interface FolderTemplateSeed {
  name: string;
  description: string;
  projectTypeSlug: string;
  variant?: string;
  folders: FolderLevel1[];
  isDefault?: boolean;
  isActive: boolean;
}

interface FolderLevel3 {
  name: string;
  path: string;
  description?: string;
  isRequired?: boolean;
}

interface FolderLevel2 {
  name: string;
  path: string;
  description?: string;
  isRequired?: boolean;
  children?: FolderLevel3[];
}

interface FolderLevel1 {
  name: string;
  path: string;
  description?: string;
  isRequired?: boolean;
  children?: FolderLevel2[];
}

const WEDDING_TEMPLATES: FolderTemplateSeed[] = [
  {
    name: "South Indian Traditional Wedding",
    description:
      "Traditional South Indian wedding folder structure with Muhurtham and Vardhaani events",
    projectTypeSlug: "wedding-photo",
    variant: "South Indian",
    isDefault: true, // Default for wedding-photo
    isActive: true,
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        description: "All photography assets",
        children: [
          {
            name: "Muhurtham",
            path: "/Photos/Muhurtham",
            isRequired: true,
            description: "Main wedding ceremony photos",
          },
          { name: "Vardhaani", path: "/Photos/Vardhaani" },
          { name: "Reception", path: "/Photos/Reception" },
          { name: "Family", path: "/Photos/Family" },
          { name: "Couple", path: "/Photos/Couple" },
        ],
      },
      {
        name: "Video",
        path: "/Video",
        children: [
          { name: "Ceremony", path: "/Video/Ceremony" },
          { name: "Drone", path: "/Video/Drone" },
        ],
      },
      {
        name: "Audio",
        path: "/Audio",
        children: [{ name: "Songs", path: "/Audio/Songs" }],
      },
      {
        name: "Album",
        path: "/Album",
        children: [{ name: "References", path: "/Album/References" }],
      },
    ],
  },
  {
    name: "Christian Wedding",
    description:
      "Christian wedding structure with church ceremony and reception",
    projectTypeSlug: "wedding-photo",
    variant: "Christian",
    isActive: true,
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        children: [
          {
            name: "Church Ceremony",
            path: "/Photos/Church Ceremony",
            isRequired: true,
          },
          { name: "Reception", path: "/Photos/Reception" },
          { name: "Couple", path: "/Photos/Couple" },
          { name: "Bridal Party", path: "/Photos/Bridal Party" },
          { name: "Family", path: "/Photos/Family" },
        ],
      },
      {
        name: "Video",
        path: "/Video",
        children: [
          { name: "Ceremony", path: "/Video/Ceremony" },
          { name: "Reception", path: "/Video/Reception" },
        ],
      },
    ],
  },
  {
    name: "North Indian Wedding",
    description:
      "North Indian wedding with Haldi, Mehendi, Sangeet, and Baraat",
    projectTypeSlug: "wedding-photo",
    variant: "North Indian",
    isActive: true,
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        children: [
          { name: "Haldi", path: "/Photos/Haldi" },
          { name: "Mehendi", path: "/Photos/Mehendi" },
          { name: "Sangeet", path: "/Photos/Sangeet" },
          { name: "Baraat", path: "/Photos/Baraat" },
          {
            name: "Pheras",
            path: "/Photos/Pheras",
            isRequired: true,
          },
          { name: "Reception", path: "/Photos/Reception" },
        ],
      },
      {
        name: "Video",
        path: "/Video",
        children: [{ name: "Events", path: "/Video/Events" }],
      },
    ],
  },
];

export async function seedWeddingFolderTemplates(
  ctx: MutationCtx,
): Promise<void> {
  console.log("🌱 Seeding wedding folder templates...");

  for (const template of WEDDING_TEMPLATES) {
    // Look up project type
    const projectType = await ctx.db
      .query("projectTypes")
      .filter((q) => q.eq(q.field("slug"), template.projectTypeSlug))
      .first();

    if (!projectType) {
      console.warn(`⚠️ Project type not found: ${template.projectTypeSlug}`);
      continue;
    }

    // Check if already exists
    const existing = await ctx.db
      .query("folderTemplates")
      .filter((q) => q.eq(q.field("name"), template.name))
      .first();

    if (existing) {
      console.log(`  ✓ ${template.name} (exists)`);
      continue;
    }

    // Insert template
    await ctx.db.insert("folderTemplates", {
      name: template.name,
      description: template.description,
      projectTypeId: projectType._id,
      variant: template.variant,
      folders: template.folders,
      isDefault: template.isDefault ?? false,
      isActive: template.isActive,
    });

    console.log(`  ✓ ${template.name}`);
  }

  console.log("✅ Wedding folder templates seeded");
}
```

---

## ❌ DO NOT

- ❌ Do NOT use more than 3 folder levels
- ❌ Do NOT set multiple templates as `isDefault: true` for same project type
- ❌ Do NOT skip the project type lookup
- ❌ Do NOT forget to mark required folders with `isRequired: true`

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run seed function
- [ ] Verify 3 wedding templates exist in database
- [ ] Verify each has correct folder hierarchy
- [ ] Verify only 1 template is marked as default

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
