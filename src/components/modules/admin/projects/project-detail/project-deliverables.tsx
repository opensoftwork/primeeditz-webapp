"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { format } from "date-fns";
import { File as FileIcon, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DetailSection } from "@/components/modules/projects/detail/shared";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProjectDeliverablesProps {
  projectId: Id<"projects">;
}

export function ProjectDeliverables({ projectId }: ProjectDeliverablesProps) {
  const deliverables = useQuery(
    api.functions.deliverables.queries.getProjectDeliverables,
    { projectId },
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

  if (deliverables === undefined) {
    return <Skeleton className="h-32 w-full rounded-2xl bg-white/5" />;
  }

  return (
    <DetailSection
      title="Finalized Deliverables"
      icon={<ShieldCheck className="h-5 w-5" />}
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
            {deliverables.map((item) => {
              const url = signedUrls[item.minioKey];
              return (
                <Link
                  key={item._id}
                  href={`/projects/${projectId}/deliverables/${item._id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                      <FileIcon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-white/40">
                        <span className="bg-white/5 px-2 py-0.5 rounded-md">
                          v{item.version}
                        </span>
                        <span>•</span>
                        <span>
                          {(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                        </span>
                        <span>•</span>
                        <span>
                          {format(item._creationTime, "MMM dd, yyyy")}
                        </span>
                        <span>•</span>
                        <span
                          className={cn(
                            item.status === "approved"
                              ? "text-emerald-400"
                              : item.status === "revision_requested"
                                ? "text-red-400"
                                : "text-amber-400",
                          )}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-16 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                        Submitted By
                      </p>
                      <p className="text-xs font-bold text-white/60">
                        {item.uploadedByName}
                      </p>
                    </div>

                    <Button
                      size="icon"
                      variant="outline"
                      className="h-10 w-10 shrink-0 rounded-xl border-white/10 hover:bg-white/10 group-hover:border-indigo-500/50 group-hover:text-indigo-400"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Placeholder for send action
                        console.log("Send clicked");
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DetailSection>
  );
}
