import type { Doc, Id } from "@convex/_generated/dataModel";
import type { FolderLevel1 } from "@convex/schema";

export interface AdminFolderTemplate extends Doc<"folderTemplates"> {
  projectTypeName: string;
}
