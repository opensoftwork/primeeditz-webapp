import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Fixes folder hierarchy for a project by ensuring proper parent/child path relationships.
 * This script will:
 * 1. Strip leading slashes from all folder paths.
 * 2. Specifically move 'wedding' under 'images'.
 * 3. Handle 'audio' and 'video' subfolders.
 */
export const fixProjectFolders = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_projectId", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Map to keep track of folder paths to avoid duplicate assignments
    const nameToFolder = new Map();
    folders.forEach(f => {
      const list = nameToFolder.get(f.name) || [];
      list.push(f);
      nameToFolder.set(f.name, list);
    });

    for (const folder of folders) {
      let newPath = folder.path.replace(/^\/+/, ""); // Strip leading slashes
      
      // Fix Wedding
      if (folder.name.toLowerCase() === "wedding") {
        newPath = "images/wedding";
      }

      // Fix Audio duplicate
      if (folder.name.toLowerCase() === "audio") {
        // If there are multiple audio folders, the one created later might be the child
        const audioFolders = nameToFolder.get(folder.name);
        if (audioFolders.length > 1) {
          // Find the one with the latest creation time to be the child
          const latest = audioFolders.reduce((prev: any, curr: any) => 
            prev._creationTime > curr._creationTime ? prev : curr
          );
          if (folder._id === latest._id) {
            newPath = "audio/audio"; // Move child audio under parent audio
          } else {
            newPath = "audio";
          }
        } else {
          newPath = "audio";
        }
      }

      // Fix Video duplicate
      if (folder.name.toLowerCase() === "video") {
        const videoFolders = nameToFolder.get(folder.name);
        if (videoFolders && videoFolders.length > 1) {
          const latest = videoFolders.reduce((prev: any, curr: any) => 
            prev._creationTime > curr._creationTime ? prev : curr
          );
          if (folder._id === latest._id) {
            newPath = "video/video"; // Move child video under parent video
          } else {
            newPath = "video";
          }
        } else {
          newPath = "video";
        }
      }

      if (newPath !== folder.path) {
        console.log(`Patching folder ${folder.name}: ${folder.path} -> ${newPath}`);
        await ctx.db.patch(folder._id, { path: newPath });
      }
    }
    
    return "Hierarchy fixed for project " + args.projectId;
  },
});
