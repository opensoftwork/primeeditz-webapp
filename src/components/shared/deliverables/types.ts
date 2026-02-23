import { Id } from "@convex/_generated/dataModel";

export type VersionRequestStatus = "pending" | "in_progress" | "resolved";

export interface VersionRequestRow {
  _id: Id<"versionRequests">;
  versionNumber: number;
  notes: string;
  status: VersionRequestStatus | string;
  requestedByName: string;
  requestedByRole: string;
  createdAt: number;
  referenceImages?: { fileName: string }[];
}

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
  latestVersionRequestId?: Id<"versionRequests">;
  studioVersion?: number;
}

/**
 * A single version entry from the deliverableVersions table.
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
  childItems?: any[]; // For folders/zip contents
  description?: string;
  createdAt: number;
  displayVersionNumber?: number;
}
