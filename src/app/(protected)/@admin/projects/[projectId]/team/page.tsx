"use client";

import { use } from "react";
import ProjectTeamContainer from "@/components/modules/admin/projects/project-team/index";

interface ProjectTeamPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectTeamPage({ params }: ProjectTeamPageProps) {
  const { projectId } = use(params);

  return <ProjectTeamContainer projectId={projectId} />;
}
