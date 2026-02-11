import type { ReactNode } from "react";

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  index: number;
  color?: string;
}

export interface ProjectData {
  _id: string;
  eventName: string;
  projectTypeName: string;
  code: string;
  phase: string;
  actionState: string;
  eventDate?: number;
  createdAt: number;
}
