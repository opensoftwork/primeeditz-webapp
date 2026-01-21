import type { Id } from "@convex/_generated/dataModel";

export interface AdminEmployee {
  _id: Id<"profiles">;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  designation?: string;
  onboardingComplete: boolean;
  role: string;
  _creationTime: number;
  deactivatedAt?: number;
}

export interface EmployeeWithStats {
  _id: Id<"profiles">;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  designation?: string;
  onboardingComplete: boolean;
  createdAt: number;
  projectCount: number;
  activeProjectCount: number;
  lastActivityDate: number | null;
}
