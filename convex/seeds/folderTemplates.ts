import { mutation } from "../_generated/server";

export const seedFolderTemplates = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("folderTemplates").collect();
    if (existing.length > 0) return "Already seeded";

    const defaultTemplates = [
      {
        name: "Wedding Photography",
        folders: ["Ceremony", "Reception", "Candid", "Couple Portraits", "Highlights"],
        isActive: true,
        isDefault: true,
      },
      {
        name: "YouTube Video",
        folders: ["Raw Footage", "B-Roll", "Audio", "Graphics", "Thumbnails"],
        isActive: true,
        isDefault: true,
      },
      {
        name: "General Project",
        folders: ["Raw Data", "Edits", "Drafts", "Final Deliverables"],
        isActive: true,
        isDefault: true,
      },
    ];

    for (const template of defaultTemplates) {
      await ctx.db.insert("folderTemplates", template);
    }

    return "Folder templates seeded successfully";
  },
});
