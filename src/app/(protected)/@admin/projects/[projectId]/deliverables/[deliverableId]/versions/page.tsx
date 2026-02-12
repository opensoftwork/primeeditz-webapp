"use client";

import { useParams } from "next/navigation";
import { VersionRequestsList } from "@/components/modules/admin/projects/project-detail/deliverables/detail/version-requests-list";

export default function AdminVersionsPage() {
  const { projectId, deliverableId } = useParams<{
    projectId: string;
    deliverableId: string;
  }>();
  return (
    <VersionRequestsList projectId={projectId} deliverableId={deliverableId} />
  );
}
