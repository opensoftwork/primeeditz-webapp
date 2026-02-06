import { v } from "convex/values";
import { mutation } from "../../_generated/server";

export const fixProjectFolders = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const folder of folders) {
      let newPath = folder.path;
      
      if (folder.name === "Images") newPath = "images";
      if (folder.name === "wedding") newPath = "images/wedding";
      
      // Handle duplicates by ID if possible, but let's try sequence
    }
    
    // Actually, it's safer to just hardcode the IDs from my finding
    const fixes = [
      { id: "jh724298r91cr1wjwr47s71tkh80nn2d", path: "images" },
      { id: "jh7ep4e29q2yhs27x5n7gsy1dx80n0b1", path: "images/wedding" },
      { id: "jh76bms1kjjxn6cgpgzdam665580nqsy", path: "audio" },
      { id: "jh7ayrgh93e2dhx4nhef2krqb980nk3z", path: "audio/audio" },
      { id: "jh7eq28qxea0pwsq92qhh8ewtn80mq5b", path: "video" },
      { id: "jh7fwr5935z7czchn1k73exdth80m6dz", path: "video/video" },
    ];

    for (const f of fixes) {
       await ctx.db.patch(f.id, { path: f.path });
    }
    
    return "Hierarchy fixed";
  },
});
