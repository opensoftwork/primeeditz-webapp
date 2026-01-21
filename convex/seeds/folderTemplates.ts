import { MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

/**
 * SEED: Folder Templates
 * 
 * Default folder structures for different project types.
 */

export async function seedFolderTemplates(
  ctx: MutationCtx,
  typeMap: Record<string, Id<"projectTypes">>
) {
  const templates = [
    // Photography Templates
    {
      name: "Photo Color Correction",
      folders: ["Raw Images", "Color Corrected", "Rejected", "Final Deliverables"],
      projectType: "Traditional Photo Color Correction",
      isDefault: true,
    },
    {
      name: "Candid Photo Grading",
      folders: ["Raw Photos", "Reference Images", "Graded Output", "Final Selection"],
      projectType: "Candid Photo Grading",
      isDefault: true,
    },
    {
      name: "Album Design - Traditional",
      folders: ["Raw Photos", "Selected Photos", "Design Drafts", "Client Approved", "Print Ready"],
      projectType: "Album Design - Traditional",
      isDefault: true,
    },
    {
      name: "Album Design - Candid",
      folders: ["Raw Photos", "Graded Photos", "Layout Drafts", "Final Design", "Print Files"],
      projectType: "Album Design - Candid",
      isDefault: true,
    },

    // Videography Templates
    {
      name: "Traditional Video Edit",
      folders: ["Raw Footage", "Proxy Files", "Audio", "Timeline Exports", "Final Render"],
      projectType: "Traditional Video Edit",
      isDefault: true,
    },
    {
      name: "Pre-Wedding Video",
      folders: ["Raw Clips", "BTS Footage", "Music", "VFX Assets", "Teaser Export", "Main Video Export"],
      projectType: "Pre-Wedding Teaser",
      isDefault: true,
    },
    {
      name: "Pre-Wedding with VFX",
      folders: ["Raw Clips", "VFX Source", "After Effects Projects", "Render Queue", "Final Exports"],
      projectType: "Pre-Wedding with VFX",
      isDefault: true,
    },
    {
      name: "VFX Project",
      folders: ["Source Footage", "Masks & Roto", "Composites", "Render Output", "Final Delivery"],
      projectType: "VFX Work",
      isDefault: true,
    },
    {
      name: "Highlight/Teaser",
      folders: ["Raw Clips", "Selected Moments", "Music", "Draft Cuts", "Final Export"],
      projectType: "Highlight/Teaser Edit",
      isDefault: true,
    },
    {
      name: "Cinematic Film",
      folders: ["Day 1 Raw", "Day 2 Raw", "Interviews", "Drone Footage", "Audio", "Timeline", "Color Graded", "Master Export"],
      projectType: "Cinematic Film",
      isDefault: true,
    },

    // Package Templates
    {
      name: "Wedding Package - Full",
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
      folders: ["Raw Data", "Work In Progress", "Drafts", "Final Deliverables"],
      projectType: null,
      isDefault: true,
    },
  ];

  const existingTemplates = await ctx.db.query("folderTemplates").collect();
  let insertedCount = 0;
  let updatedCount = 0;

  for (const template of templates) {
    const existing = existingTemplates.find(t => t.name === template.name);
    
    const projectTypeId = template.projectType && typeMap[template.projectType]
      ? typeMap[template.projectType]
      : undefined;

    const data = {
      name: template.name,
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

  console.log(`Folder templates: ${insertedCount} inserted, ${updatedCount} updated`);
}
