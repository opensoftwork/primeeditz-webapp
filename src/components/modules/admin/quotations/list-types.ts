import type { Doc } from "@convex/_generated/dataModel";

export type AdminQuotation = Doc<"quotations"> & {
  studioName?: string;
  projectName?: string;
};
