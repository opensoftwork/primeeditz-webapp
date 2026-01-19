import { Doc } from "@convex/_generated/dataModel";

export type AdminQuotation = Doc<"quotations"> & {
  clientName?: string;
  projectName?: string;
};
