"use client";

import { use, useEffect } from "react";
import { DeliverableDetailView } from "@/components/modules/admin/projects/project-detail/deliverables/detail/deliverable-detail-view";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

interface DeliverablePageProps {
  params: Promise<{
    projectId: string;
    deliverableId: string;
  }>;
}

export default function EmployeeDeliverablePage({
  params,
}: DeliverablePageProps) {
  const { projectId, deliverableId } = use(params);
  const router = useRouter();

  const deliverable = useQuery(
    // @ts-ignore
    api.functions.deliverables.queries.getDeliverable,
    {
      deliverableId: deliverableId as Id<"deliverables">,
    },
  );

  useEffect(() => {
    if (deliverable?.status === "version_requested") {
      router.replace(
        `/assigned-work/${projectId}/deliverables/${deliverableId}/versions`,
      );
    }
  }, [deliverable?.status, projectId, deliverableId, router]);

  if (deliverable === undefined) {
    return (
      <div className="p-12 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-1/3 bg-white/5 rounded-xl" />
        <Skeleton className="h-[400px] w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  return (
    <DeliverableDetailView
      projectId={projectId}
      deliverableId={deliverableId}
      hrefPrefix={`/assigned-work/${projectId}/deliverables`}
    />
  );
}
