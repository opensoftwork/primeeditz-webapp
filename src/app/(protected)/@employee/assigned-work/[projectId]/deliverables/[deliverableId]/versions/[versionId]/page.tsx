"use client";

import { VersionsWorkspace } from "@/components/modules/employee/assigned-work/detail/versions-workspace";
import { use } from "react";

interface VersionDetailPageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
    versionId: string;
  }>;
}

export default function EmployeeVersionDetailPage({
  params,
}: VersionDetailPageProps) {
  const { projectId, deliverableId, versionId } = use(params);
  return (
    <VersionsWorkspace
      projectId={projectId}
      deliverableId={deliverableId}
      requestId={versionId}
    />
  );
}
