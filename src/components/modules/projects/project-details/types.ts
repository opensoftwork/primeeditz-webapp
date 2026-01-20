import type { Doc, Id } from "@convex/_generated/dataModel";

export type ClientProject = {
  _id: Id<"projects">;
  code: string;
  phase: Doc<"projects">["phase"];
  actionState: Doc<"projects">["actionState"];
  awaitingActorRole?: Doc<"projects">["awaitingActorRole"];
  projectTypeName: string;
  eventName?: string;
  eventDate?: number;
  source: Doc<"projects">["source"];
  createdAt: number;
  updatedAt: number;
};
