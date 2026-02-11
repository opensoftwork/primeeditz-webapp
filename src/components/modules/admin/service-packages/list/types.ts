import type { Doc, Id } from "@convex/_generated/dataModel";

export interface AdminServicePackage extends Doc<"servicePackages"> {
  categoryName?: string;
  projectTypeName?: string;
}
