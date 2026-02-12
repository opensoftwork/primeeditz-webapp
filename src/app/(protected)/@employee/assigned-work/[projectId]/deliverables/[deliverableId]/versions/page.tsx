"use client";

import { VersionsWorkspace } from "@/components/modules/employee/assigned-work/detail/versions-workspace";
import { use } from "react";

interface VersionsPageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function EmployeeVersionsPage({ params }: VersionsPageProps) {
  const { projectId, deliverableId } = use(params);
  return (
    <VersionsWorkspace projectId={projectId} deliverableId={deliverableId} />
  );
}
