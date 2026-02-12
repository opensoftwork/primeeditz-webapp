"use client";

import { useParams } from "next/navigation";
import { VersionsPage } from "@/components/modules/admin/projects/project-detail/deliverables/detail/versions-page";

export default function AdminNewVersionPage() {
  const { projectId, deliverableId } = useParams<{
    projectId: string;
    deliverableId: string;
  }>();
  return <VersionsPage projectId={projectId} deliverableId={deliverableId} />;
}
