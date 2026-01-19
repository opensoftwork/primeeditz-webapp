import { Doc } from "@convex/_generated/dataModel";

export type ClientQuotation = {
  _id: string;
  _creationTime: number;
  code: string;
  status: "draft" | "sent" | "viewed" | "approved" | "changes_requested" | "rejected" | "expired" | "superseded";
  total: number;
  projectName?: string;
  validUntil?: number;
  approvedAt?: number;
};
