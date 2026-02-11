import { Id } from "@convex/_generated/dataModel";

export interface DeliverableData {
  _id: Id<"deliverables">;
  _creationTime: number;
  name: string;
  description?: string;
  version: number;
  status: "pending_qc" | "approved" | "revision_needed" | "revision_requested";
  minioKey: string;
  sizeBytes: number;
  mimeType?: string;
  uploadedBy: Id<"profiles">;
  uploadedByName?: string;
  qcReviewedBy?: Id<"profiles">;
  qcNotes?: string;
  rejectionNotes?: string;
  projectId: Id<"projects">;
}

export interface DeliverableVersion {
  _id: Id<"deliverables">;
  version: number;
  _creationTime: number;
}
