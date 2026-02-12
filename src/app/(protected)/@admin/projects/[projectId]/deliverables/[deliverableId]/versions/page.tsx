"use client";

import { use } from "react";
import { VersionsPage } from "@/components/modules/admin/projects/project-detail/deliverables/detail/versions-page";

interface VersionsPageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function AdminVersionsPage({ params }: VersionsPageProps) {
  const { projectId, deliverableId } = use(params);
  return <VersionsPage projectId={projectId} deliverableId={deliverableId} />;
}
