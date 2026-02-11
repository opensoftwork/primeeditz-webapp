"use client";

import { use } from "react";
import { ProjectDetailView } from "@/components/modules/projects/detail/project-detail-view";
import { ConvexErrorBoundary } from "@/components/shared/convex-error-boundary";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = use(params);

  return (
    <ConvexErrorBoundary>
      <ProjectDetailView projectId={projectId} />
    </ConvexErrorBoundary>
  );
}
