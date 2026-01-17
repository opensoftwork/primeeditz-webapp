import type { Id } from "@convex/_generated/dataModel";

export interface StatusHistoryEntry {
  changedAt: number;
  newStatus: string;
  actorName: string;
}

export interface AdminProjectDetail {
  _id: Id<"projects">;
  _creationTime: number;
  code: string;
  status: string;
  projectTypeId: Id<"projectTypes">;
  clientId?: Id<"profiles">;
  clientName: string;
  clientEmail?: string;
  projectTypeName: string;
  eventName?: string;
  eventDate?: number;
  venue?: string;
  description?: string;
  additionalNotes?: string;
  referenceFiles?: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    storageKey?: string;
  }>;
  statusHistory?: StatusHistoryEntry[];
  storageAllocated?: number;
}

