import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * SEED: Folder Templates
 *
 * Default folder structures for different project types.
 */

export async function seedFolderTemplates(
  ctx: MutationCtx,
  typeMap: Record<string, Id<"projectTypes">>,
) {
  const templates = [
    // Event-Based Templates
    {
      name: "Hindu Wedding - Brahmin",
      variant: "South Indian",
      description:
        "Standard Brahmin wedding ceremonies with dedicated folders for Naandi and Muhurtham.",
      folders: [
        "Naandi",
        "Muhurtham",
        "Grihapravesham",
        "Reception",
        "Candid",
        "Traditional",
      ],
      projectType: "Traditional Photo Color Correction",
      isDefault: false,
    },
    {
      name: "Christian Wedding",
      variant: "General",
      description: "Church ceremony focused structure.",
      folders: [
        "Church Ceremony",
        "Reception",
        "Couple Portraits",
        "Getting Ready",
      ],
      projectType: "Traditional Photo Color Correction",
      isDefault: false,
    },
    {
      name: "YouTube Content",
      variant: "Social Media",
      description: "Asset organization for YouTube and social media edits.",
      folders: [
        "A-Roll",
        "B-Roll",
        "Audio",
        "Assets",
        "Thumbnails",
        "Project Files",
      ],
      projectType: "Traditional Video Edit",
      isDefault: false,
    },

    // Photography Templates
    {
      name: "Photo Color Correction",
      variant: "Standard",
      description: "Basic photo editing structure.",
      folders: [
        "Raw Images",
        "Color Corrected",
        "Rejected",
        "Final Deliverables",
      ],
      projectType: "Traditional Photo Color Correction",
      isDefault: true,
    },
    {
      name: "Candid Photo Grading",
      variant: "Premium",
      description: "High-end grading for candid photography.",
      folders: [
        "Raw Photos",
        "Reference Images",
        "Graded Output",
        "Final Selection",
      ],
      projectType: "Candid Photo Grading",
      isDefault: true,
    },
    {
      name: "Album Design - Traditional",
      variant: "Standard",
      description: "Traditional grid-based album design workflow.",
      folders: [
        "Raw Photos",
        "Selected Photos",
        "Design Drafts",
        "Client Approved",
        "Print Ready",
      ],
      projectType: "Album Design - Traditional",
      isDefault: true,
    },
    {
      name: "Album Design - Candid",
      variant: "Premium",
      description: "Story-based candid album design workflow.",
      folders: [
        "Raw Photos",
        "Graded Photos",
        "Layout Drafts",
        "Final Design",
        "Print Files",
      ],
      projectType: "Album Design - Candid",
      isDefault: true,
    },

    // Videography Templates
    {
      name: "Traditional Video Edit",
      variant: "Standard",
      description: "Documentary style wedding video edit.",
      folders: [
        "Raw Footage",
        "Proxy Files",
        "Audio",
        "Timeline Exports",
        "Final Render",
      ],
      projectType: "Traditional Video Edit",
      isDefault: true,
    },
    {
      name: "Pre-Wedding Video",
      variant: "Teaser",
      description: "Short highlight film structure.",
      folders: [
        "Raw Clips",
        "BTS Footage",
        "Music",
        "VFX Assets",
        "Teaser Export",
        "Main Video Export",
      ],
      projectType: "Pre-Wedding Teaser",
      isDefault: true,
    },
    {
      name: "Pre-Wedding with VFX",
      variant: "Premium",
      description: "High-end pre-wedding film with heavy visual effects.",
      folders: [
        "Raw Clips",
        "VFX Source",
        "After Effects Projects",
        "Render Queue",
        "Final Exports",
      ],
      projectType: "Pre-Wedding with VFX",
      isDefault: true,
    },
    {
      name: "VFX Project",
      variant: "General",
      description: "Standalone visual effects or cleanup work.",
      folders: [
        "Source Footage",
        "Masks & Roto",
        "Composites",
        "Render Output",
        "Final Delivery",
      ],
      projectType: "VFX Work",
      isDefault: true,
    },
    {
      name: "Highlight/Teaser",
      variant: "Standard",
      description: "Quick turnaround highlight edit.",
      folders: [
        "Raw Clips",
        "Selected Moments",
        "Music",
        "Draft Cuts",
        "Final Export",
      ],
      projectType: "Highlight/Teaser Edit",
      isDefault: true,
    },
    {
      name: "Cinematic Film",
      variant: "Premium",
      description: "Feature-length cinematic wedding film structure.",
      folders: [
        "Day 1 Raw",
        "Day 2 Raw",
        "Interviews",
        "Drone Footage",
        "Audio",
        "Timeline",
        "Color Graded",
        "Master Export",
      ],
      projectType: "Cinematic Film",
      isDefault: true,
    },

    // Package Templates
    {
      name: "Wedding Package - Full",
      variant: "Gold",
      description: "Comprehensive package including photo and video services.",
      folders: [
        "Ceremony Raw",
        "Reception Raw",
        "Candid Raw",
        "Drone Footage",
        "Color Corrected Photos",
        "Album Designs",
        "Video Raw",
        "Video Exports",
        "Deliverables",
      ],
      projectType: "Wedding Package - Gold",
      isDefault: true,
    },
    {
      name: "Wedding Package - Premium",
      variant: "Diamond",
      description: "Luxury tier package with multi-day event organization.",
      folders: [
        "Day 1 - Ceremony",
        "Day 1 - Reception",
        "Day 2 - Events",
        "Pre-Wedding Shoot",
        "Drone Raw",
        "Photos - Traditional",
        "Photos - Candid",
        "Albums - Main",
        "Albums - Parent",
        "Videos - Traditional",
        "Videos - Highlights",
        "Videos - Cinematic",
        "VFX Projects",
        "Final Package",
      ],
      projectType: "Wedding Package - Diamond",
      isDefault: true,
    },

    // General/Fallback
    {
      name: "General Project",
      variant: "Default",
      description: "Fallback structure for generic work.",
      folders: ["Raw Data", "Work In Progress", "Drafts", "Final Deliverables"],
      projectType: null,
      isDefault: true,
    },
  ];

  const existingTemplates = await ctx.db.query("folderTemplates").collect();
  let insertedCount = 0;
  let updatedCount = 0;

  for (const template of templates) {
    const existing = existingTemplates.find((t) => t.name === template.name);

    const projectTypeId =
      template.projectType && typeMap[template.projectType]
        ? typeMap[template.projectType]
        : undefined;

    const data: any = {
      name: template.name,
      variant: (template as any).variant,
      description: (template as any).description,
      folders: template.folders,
      projectTypeId,
      isDefault: template.isDefault,
      isActive: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      updatedCount++;
    } else {
      await ctx.db.insert("folderTemplates", data);
      insertedCount++;
    }
  }

  console.log(
    `Folder templates: ${insertedCount} inserted, ${updatedCount} updated`,
  );
}
