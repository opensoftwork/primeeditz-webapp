"use client";

import { use } from "react";
import ProjectDetail from "@/components/modules/admin/projects/project-detail";
import { ConvexErrorBoundary } from "@/components/shared/convex-error-boundary";

interface AdminProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * Admin Project Detail Page
 *
 * Thin route wrapper that extracts projectId and passes it to the container component.
 * Uses Next.js 15 `use()` hook to unwrap params.
 */
export default function AdminProjectDetailPage({
  params,
}: AdminProjectDetailPageProps) {
  const { projectId } = use(params);

  return (
    <ConvexErrorBoundary>
      <ProjectDetail projectId={projectId} />
    </ConvexErrorBoundary>
  );
}
