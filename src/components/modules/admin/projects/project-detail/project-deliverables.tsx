"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction, useQuery, useMutation } from "convex/react";
import { format } from "date-fns";
import { toast } from "sonner";
import { File as FileIcon, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DetailSection } from "@/components/modules/projects/detail/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { DeliverableCard } from "./deliverables/list/deliverable-card";

interface ProjectDeliverablesProps {
  projectId: Id<"projects">;
  isVisible?: boolean;
}

export function ProjectDeliverables({
  projectId,
  isVisible = true,
}: ProjectDeliverablesProps) {
  const deliverables = useQuery(
    api.functions.deliverables.queries.getProjectDeliverables,
    { projectId },
  );

  const sendToStudio = useMutation(
    api.functions.deliverables.mutations.sendToStudio,
  );

  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>(
    {},
  );

  const getSignedUrlsAction = useAction(
    api.functions.storage.actions.getSignedFileUrls,
  );

  useEffect(() => {
    async function fetchUrls() {
      if (deliverables && deliverables.length > 0) {
        const keys = deliverables
          .map((d) => d.minioKey)
          .filter((k): k is string => !!k);

        if (keys.length > 0) {
          try {
            const urls = await getSignedUrlsAction({ storageKeys: keys });
            setSignedUrls(urls);
          } catch (error) {
            console.error("Error fetching signed URLs:", error);
          }
        }
      }
    }
    fetchUrls();
  }, [deliverables, getSignedUrlsAction]);

  if (!isVisible) {
    return null;
  }

  if (deliverables === undefined) {
    return <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />;
  }

  return (
    <DetailSection
      title="Finalized Deliverables"
      icon={<ShieldCheck className="h-5 w-5" />}
      noContainer
      action={
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 rounded-lg h-8"
          asChild
        >
          <Link href={`/projects/${projectId}/deliverables`}>View All</Link>
        </Button>
      }
    >
      <div className="space-y-4">
        {deliverables.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-white/10 bg-white/2 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">
              No deliverables finalized yet
            </p>
          </div>
        ) : (
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
                versionFeedback={item.versionFeedback}
                onSend={
                  item.status === "approved"
                    ? () => {
                        toast.promise(
                          sendToStudio({ deliverableId: item._id }),
                          {
                            loading: "Sending to studio...",
                            success: "Deliverable sent to studio review!",
                            error: "Failed to send deliverable",
                          },
                        );
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </DetailSection>
  );
}
