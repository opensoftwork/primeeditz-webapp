import { Id } from "@convex/_generated/dataModel";

export interface DeliverableData {
  _id: Id<"deliverables">;
  _creationTime: number;
  name: string;
  description?: string;
  version: number;
  status: "pending_qc" | "approved" | "version_needed" | "version_requested";
  minioKey: string;
  sizeBytes: number;
  mimeType?: string;
  uploadedBy: Id<"profiles">;
  uploadedByName?: string;
  qcReviewedBy?: Id<"profiles">;
  qcNotes?: string;
  versionFeedback?: string;
  projectId: Id<"projects">;
  latestVersionId?: Id<"deliverableVersions">;
  studioVersion?: number;
}

/**
 * A single version entry from the deliverableVersions table.
 * Replaces the legacy pattern where each version was a separate deliverable row.
 */
export interface DeliverableVersion {
  _id: Id<"deliverableVersions">;
  _creationTime: number;
  deliverableId: Id<"deliverables">;
  projectId: Id<"projects">;
  versionNumber: number;
  studioVersionNumber?: number;
  scope?: "internal" | "external";
  minioKey: string;
  sizeBytes: number;
  mimeType?: string;
  uploadedBy: Id<"profiles">;
  uploadedByRole: "admin" | "employee";
  uploadedByName?: string;
  description?: string;
  createdAt: number;
  displayVersionNumber?: number;
}
