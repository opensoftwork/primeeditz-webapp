import type { Id } from "@convex/_generated/dataModel";

export interface AdminProject {
  _id: Id<"projects">;
  code: string;
  phase: string;
  actionState: string;
  status: string; // compatibility
  projectTypeName: string;
  clientName: string;
  clientId: Id<"profiles">;
  eventName?: string;
  eventDate?: number;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
  deliveryConfig?: {
    hasPhysicalDelivery: boolean;
    physicalDeliveryLabel?: string;
    hasDigitalDelivery: boolean;
    digitalDeliveryLabel?: string;
    requiresSignoff: boolean;
  };
}
