import type { Id } from "@convex/_generated/dataModel";

export interface AssignedWorkItem {
  _id: Id<"projects">;
  code: string;
  eventName: string;
  eventDate: number;
  phase: string;
  actionState: string;
  projectTypeName: string;
  updatedAt: number;
}
