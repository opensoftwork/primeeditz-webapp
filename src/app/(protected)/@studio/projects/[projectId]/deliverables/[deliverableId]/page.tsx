"use client";

import { use } from "react";
import { DeliverableDetailView } from "@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view";

interface DeliverablePageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function StudioDeliverablePage({
  params,
}: DeliverablePageProps) {
  const { projectId, deliverableId } = use(params);

  return (
    <DeliverableDetailView
      projectId={projectId}
      deliverableId={deliverableId}
    />
  );
}
