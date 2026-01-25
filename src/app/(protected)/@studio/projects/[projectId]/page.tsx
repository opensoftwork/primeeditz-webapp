"use client";

import { use } from "react";
import { ProjectDetailView } from "@/components/modules/projects/detail/project-detail-view";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);

  return <ProjectDetailView projectId={projectId} />;
}
