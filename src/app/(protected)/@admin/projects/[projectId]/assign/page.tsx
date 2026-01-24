"use client";

import { use } from "react";
import AssignTeamContainer from "@/components/modules/admin/projects/assign-team/index";

interface AssignTeamPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function AssignTeamPage({ params }: AssignTeamPageProps) {
  const { projectId } = use(params);

  return <AssignTeamContainer projectId={projectId} />;
}
