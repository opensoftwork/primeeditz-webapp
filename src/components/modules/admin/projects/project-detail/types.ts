import type { Id } from "@convex/_generated/dataModel";

export interface StatusHistoryEntry {
  changedAt: number;
  previousPhase?: string;
  newPhase: string;
  previousActionState?: string;
  newActionState: string;
  actorName: string;
}

export interface AdminProjectDetail {
  _id: Id<"projects">;
  _creationTime: number;
  code: string;
  phase: string;
  actionState: string;
  status: string; // compatibility
  projectTypeId: Id<"projectTypes">;
  clientId?: Id<"profiles">;
  clientName: string;
  clientEmail?: string;
  awaitingActorRole?: string;
  awaitingActorId?: Id<"profiles">;
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
  deliveryConfig?: {
    hasPhysicalDelivery: boolean;
    physicalDeliveryLabel?: string;
    hasDigitalDelivery: boolean;
    digitalDeliveryLabel?: string;
    requiresSignoff: boolean;
  };
}

