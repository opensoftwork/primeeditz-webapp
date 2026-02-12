"use client";

import { useParams } from "next/navigation";
import { VersionRequestDetailView } from "@/components/modules/admin/projects/project-detail/deliverables/detail/version-request-detail-view";

export default function AdminVersionDetailPage() {
  const { projectId, deliverableId, versionId } = useParams<{
    projectId: string;
    deliverableId: string;
    versionId: string;
  }>();
  return (
    <VersionRequestDetailView
      projectId={projectId}
      deliverableId={deliverableId}
      versionId={versionId}
    />
  );
}
