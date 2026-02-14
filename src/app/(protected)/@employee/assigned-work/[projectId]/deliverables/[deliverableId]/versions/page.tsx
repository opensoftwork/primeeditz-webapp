"use client";

import { VersionRequestsList } from "@/components/modules/employee/assigned-work/detail/version-requests-list";
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
    <VersionRequestsList projectId={projectId} deliverableId={deliverableId} />
  );
}
