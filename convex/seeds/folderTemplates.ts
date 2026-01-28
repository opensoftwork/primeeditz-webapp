import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * SEED: Folder Templates (Enhanced Hierarchical Model)
 */

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

interface FolderTemplateSeed {
  name: string;
  description: string;
  projectTypeName: string;
  variant?: string;
  folders: FolderLevel1[];
  isDefault?: boolean;
}

const TEMPLATES: FolderTemplateSeed[] = [
  // --- WEDDING TEMPLATES (Photography) ---
  {
    name: "South Indian Traditional Wedding",
    description: "Traditional South Indian wedding folder structure with Muhurtham and Vardhaani events",
    projectTypeName: "Traditional Photo Color Correction",
    variant: "South Indian",
    isDefault: true,
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        description: "All photography assets",
        children: [
          { name: "Muhurtham", path: "/Photos/Muhurtham", isRequired: true, description: "Main wedding ceremony photos" },
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
    description: "Christian wedding structure with church ceremony and reception",
    projectTypeName: "Traditional Photo Color Correction",
    variant: "Christian",
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        children: [
          { name: "Church Ceremony", path: "/Photos/Church Ceremony", isRequired: true },
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
    description: "North Indian wedding with Haldi, Mehendi, Sangeet, and Baraat",
    projectTypeName: "Traditional Photo Color Correction",
    variant: "North Indian",
    folders: [
      {
        name: "Photos",
        path: "/Photos",
        children: [
          { name: "Haldi", path: "/Photos/Haldi" },
          { name: "Mehendi", path: "/Photos/Mehendi" },
          { name: "Sangeet", path: "/Photos/Sangeet" },
          { name: "Baraat", path: "/Photos/Baraat" },
          { name: "Pheras", path: "/Photos/Pheras", isRequired: true },
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

  // --- CONTENT CREATOR TEMPLATES ---
  {
    name: "YouTube Content Template",
    description: "Standard organization for YouTube video editors",
    projectTypeName: "Traditional Video Edit",
    variant: "YouTube",
    isDefault: true,
    folders: [
      {
        name: "Footage",
        path: "/Footage",
        children: [
          { name: "A-Roll", path: "/Footage/A-Roll", isRequired: true, description: "Main talking head / primary footage" },
          { name: "B-Roll", path: "/Footage/B-Roll", description: "Supporting visuals" },
          { name: "Screen Recordings", path: "/Footage/Screen Recordings" },
        ],
      },
      {
        name: "Audio",
        path: "/Audio",
        children: [
          { name: "Music", path: "/Audio/Music" },
          { name: "SFX", path: "/Audio/SFX" },
          { name: "Voiceover", path: "/Audio/Voiceover" },
        ],
      },
      {
        name: "Assets",
        path: "/Assets",
        children: [
          { name: "Overlays", path: "/Assets/Overlays" },
          { name: "Graphics", path: "/Assets/Graphics" },
          { name: "Thumbnails", path: "/Assets/Thumbnails" },
        ],
      },
    ],
  },
  {
    name: "Short-Form Content (Reels/TikTok)",
    description: "Vertical video optimized structure",
    projectTypeName: "Highlight/Teaser Edit",
    variant: "Shorts",
    isDefault: true,
    folders: [
      { name: "Raw Footage", path: "/Raw Footage", isRequired: true },
      { name: "Audio & Music", path: "/Audio & Music" },
      { name: "Subtitles & Graphics", path: "/Subtitles & Graphics" },
      { name: "Final Exports", path: "/Final Exports" },
    ],
  },

  // --- OTHER STANDARD TEMPLATES ---
  {
    name: "Album Design - Traditional",
    description: "Standard album design workflow",
    projectTypeName: "Album Design - Traditional",
    isDefault: true,
    folders: [
      { name: "Raw Photos", path: "/Raw Photos", isRequired: true },
      { name: "Selected Photos", path: "/Selected Photos" },
      { name: "Design Drafts", path: "/Design Drafts" },
      { name: "Print Ready", path: "/Print Ready" },
    ],
  },
  {
    name: "Candid Photo Grading",
    description: "Premium photo grading workflow",
    projectTypeName: "Candid Photo Grading",
    isDefault: true,
    folders: [
      { name: "Raw Photos", path: "/Raw Photos", isRequired: true },
      { name: "References", path: "/References" },
      { name: "Graded Exports", path: "/Graded Exports" },
    ],
  },
];

export async function seedFolderTemplates(
  ctx: MutationCtx,
  typeMap: Record<string, Id<"projectTypes">>,
) {
  console.log("🌱 Seeding enhanced folder templates...");
  
  // Clear existing templates to avoid validation errors with old schema
  const existingTemplates = await ctx.db.query("folderTemplates").collect();
  for (const template of existingTemplates) {
    await ctx.db.delete(template._id);
  }

  let insertedCount = 0;

  for (const template of TEMPLATES) {
    const projectTypeId = typeMap[template.projectTypeName];
    if (!projectTypeId) {
      console.warn(`⚠️ Project type not found: ${template.projectTypeName}`);
      continue;
    }

    await ctx.db.insert("folderTemplates", {
      name: template.name,
      description: template.description,
      projectTypeId,
      variant: template.variant,
      folders: template.folders,
      isDefault: template.isDefault ?? false,
      isActive: true,
    });
    insertedCount++;
  }

  console.log(`✅ Seeded ${insertedCount} folder templates`);
}
