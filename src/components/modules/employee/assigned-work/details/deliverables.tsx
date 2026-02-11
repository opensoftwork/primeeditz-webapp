"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { History } from "lucide-react";
import { DeliverableCard } from "@/components/modules/admin/projects/project-detail/deliverables/list/deliverable-card";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailSection } from "@/components/modules/projects/detail/shared";

interface AssignedWorkDeliverablesProps {
  projectId: string;
}

export function AssignedWorkDeliverables({
  projectId,
}: AssignedWorkDeliverablesProps) {
    const deliverables = useQuery(
      //@ts-ignore
    api.functions.deliverables.queries.getProjectDeliverables,
    { projectId: projectId as Id<"projects"> }
  );

  if (deliverables === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-32 rounded-lg bg-white/5" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
          <Skeleton className="h-24 w-full rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  if (deliverables.length === 0) {
    return null;
  }

  return (
    <DetailSection
      title="Sent Deliverables"
      icon={<History className="h-5 w-5" />}
      action={
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
          {deliverables.length} Deliverables
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        {deliverables.map((item) => (
          <DeliverableCard
            key={item._id}
            id={item._id}
            projectId={projectId}
            name={item.name}
            version={item.version}
            sizeBytes={item.sizeBytes}
            status={item.status}
            createdAt={item._creationTime}
            uploadedByName={item.uploadedByName}
            href={`/assigned-work/${projectId}/deliverables/${item._id}`}
          />
        ))}
      </div>
    </DetailSection>
  );
}
