import type { Id } from "@convex/_generated/dataModel";

export interface AdminProject {
  _id: Id<"projects">;
  code: string;
  status: string;
  projectTypeName: string;
  clientName: string;
  clientId: Id<"profiles">;
  eventName?: string;
  eventDate?: number;
  createdAt: number;
  updatedAt: number;
}
