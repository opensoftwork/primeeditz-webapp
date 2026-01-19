import type { Doc, Id } from "@convex/_generated/dataModel";

export type ClientProject = {
  _id: Id<"projects">;
  code: string;
  status: Doc<"projects">["status"];
  projectTypeName: string;
  eventName?: string;
  eventDate?: number;
  createdAt: number;
  updatedAt: number;
};
