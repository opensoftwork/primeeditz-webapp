"use client";

import { use } from "react";
import { StudioDeliverablesList } from "@/components/modules/projects/detail/deliverables/studio-deliverables-list";

interface DeliverablesPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default function StudioDeliverablesPage({
  params,
}: DeliverablesPageProps) {
  const { projectId } = use(params);

  return <StudioDeliverablesList projectId={projectId} />;
}
