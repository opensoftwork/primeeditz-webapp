"use client";

import { use } from "react";
import { StudioDeliverableDetailView } from "@/components/modules/projects/detail/deliverables";

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
    <StudioDeliverableDetailView
      projectId={projectId}
      deliverableId={deliverableId}
    />
  );
}
