# Story 13B.3: Create Content Creator Folder Template Seeds

**Status**: backlog  
**Points**: 2  
**Epic**: [13B: Folder Template Enhancement](../../../../planning-artifacts/epics/13b-folder-template-enhancement.md)  
**Depends On**: Story 13B.1

---

## User Story

**As a** Developer,  
**I want** folder templates for content creation projects,  
**So that** YouTube and album editors have organized structures.

---

## Acceptance Criteria

### AC1: YouTube Long-Form Video Template

**Given** a YouTube video project type  
**When** I create the long-form template  
**Then** it includes this folder structure:

```
/Raw Footage
  /A-Roll (Required)
  /B-Roll
/Graphics
  /Thumbnails
  /Lower Thirds
/Audio
  /Voiceover
  /Background Music
/Scripts
/Brand Assets
```

### AC2: YouTube Shorts / Reels Template

**Given** a YouTube Shorts project type  
**When** I create the shorts template  
**Then** it includes this folder structure:

```
/Clips (Required)
/Audio
/Captions
```

### AC3: Album Design Only Template

**Given** an album design project type  
**When** I create the album template  
**Then** it includes this folder structure:

```
/Photos
  /Selected (Required)
/References
  /Design Style
  /Layout Preferences
```

### AC4: Seed Integration

**Given** the content creator templates  
**When** the seed function runs  
**Then** all templates are created  
**And** each links to the appropriate project type

---

## Technical Implementation

### Files to Modify

```
MODIFY: convex/seeds/folderTemplates.ts
  - Add YouTube and Album templates to the file
```

### Seed Data

```typescript
// convex/seeds/folderTemplates.ts - Add these templates

const CONTENT_CREATOR_TEMPLATES: FolderTemplateSeed[] = [
  {
    name: "YouTube Long-Form Video",
    description: "Complete folder structure for long-form YouTube content",
    projectTypeSlug: "youtube-video",
    variant: "Long-Form",
    isDefault: true,
    isActive: true,
    folders: [
      {
        name: "Raw Footage",
        path: "/Raw Footage",
        children: [
          {
            name: "A-Roll",
            path: "/Raw Footage/A-Roll",
            isRequired: true,
            description: "Main camera footage",
          },
          {
            name: "B-Roll",
            path: "/Raw Footage/B-Roll",
            description: "Supplementary footage",
          },
        ],
      },
      {
        name: "Graphics",
        path: "/Graphics",
        children: [
          { name: "Thumbnails", path: "/Graphics/Thumbnails" },
          { name: "Lower Thirds", path: "/Graphics/Lower Thirds" },
        ],
      },
      {
        name: "Audio",
        path: "/Audio",
        children: [
          { name: "Voiceover", path: "/Audio/Voiceover" },
          { name: "Background Music", path: "/Audio/Background Music" },
        ],
      },
      {
        name: "Scripts",
        path: "/Scripts",
        description: "Video scripts and notes",
      },
      {
        name: "Brand Assets",
        path: "/Brand Assets",
        description: "Logos, intros, outros",
      },
    ],
  },
  {
    name: "YouTube Shorts / Reels",
    description: "Minimal structure for short-form content",
    projectTypeSlug: "youtube-shorts",
    variant: "Short-Form",
    isDefault: true,
    isActive: true,
    folders: [
      {
        name: "Clips",
        path: "/Clips",
        isRequired: true,
        description: "Raw video clips",
      },
      {
        name: "Audio",
        path: "/Audio",
        description: "Background music and sound effects",
      },
      {
        name: "Captions",
        path: "/Captions",
        description: "Caption files or text",
      },
    ],
  },
  {
    name: "Album Design Only",
    description: "Structure for album design projects",
    projectTypeSlug: "album-design",
    variant: "Standard",
    isDefault: true,
    isActive: true,
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        children: [
          {
            name: "Selected",
            path: "/Photos/Selected",
            isRequired: true,
            description: "Final selected photos for album",
          },
        ],
      },
      {
        name: "References",
        path: "/References",
        children: [
          {
            name: "Design Style",
            path: "/References/Design Style",
            description: "Style inspiration images",
          },
          {
            name: "Layout Preferences",
            path: "/References/Layout Preferences",
            description: "Layout examples client likes",
          },
        ],
      },
    ],
  },
];

export async function seedContentCreatorFolderTemplates(
  ctx: MutationCtx,
): Promise<void> {
  console.log("🌱 Seeding content creator folder templates...");

  for (const template of CONTENT_CREATOR_TEMPLATES) {
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

  console.log("✅ Content creator folder templates seeded");
}
```

---

## ❌ DO NOT

- ❌ Do NOT duplicate project type slugs - use correct slugs from existing data
- ❌ Do NOT forget to export the new seed function
- ❌ Do NOT skip updating the main seed.ts

---

## Testing Requirements

- [ ] Run `pnpm convex dev --once` - compiles
- [ ] Run seed function
- [ ] Verify 3 content creator templates exist
- [ ] Verify folder hierarchy is correct

---

## Dev Agent Record

### Agent Model Used

_To be filled by implementing agent_

### Completion Notes

_To be filled by implementing agent_

### Files Changed

_To be filled by implementing agent_
