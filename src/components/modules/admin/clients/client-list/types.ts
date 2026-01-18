import type { Doc, Id } from "@convex/_generated/dataModel";

export interface AdminClient {
  _id: Id<"profiles">;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  onboardingComplete: boolean;
  role: string;
  _creationTime: number;
  deactivatedAt?: number;
}

// For component props that accept selection
export type Client = Doc<"profiles">;
