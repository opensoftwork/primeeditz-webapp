"use client";

import { use } from "react";
import EmployeeProjectDetail from "@/components/modules/employee/assigned-work/detail/index";

interface AssignedWorkDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function AssignedWorkDetailPage({
  params,
}: AssignedWorkDetailPageProps) {
  const { projectId } = use(params);

  return <EmployeeProjectDetail projectId={projectId} />;
}
