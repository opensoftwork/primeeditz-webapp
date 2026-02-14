"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import {
  History,
  MessageSquare,
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle,
  Play,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VersionRequestsList } from "@/components/modules/admin/projects/project-detail/deliverables/detail/version-requests-list";
import { VersionHistoryList } from "@/components/modules/admin/projects/project-detail/deliverables/detail/version-history-list";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudioVersionsPage() {
  const { projectId, deliverableId } = useParams<{
    projectId: string;
    deliverableId: string;
  }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("requests");
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const deliverable = useQuery(
    // @ts-ignore
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  useEffect(() => {
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => removeOverride(deliverableId);
  }, [deliverableId, deliverable, setOverride, removeOverride]);

  const versionRequests = useQuery(
    api.functions.deliverables.queries.getDeliverableVersionRequests,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  if (!deliverable || !versionRequests || !versions) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="flex items-center gap-4 mb-10">
          <Skeleton className="h-11 w-11 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-10 w-64 bg-white/5" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg shrink-0"
            onClick={() =>
              router.push(
                `/projects/${projectId}/deliverables/${deliverableId}`,
              )
            }
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                DELIVERABLE HISTORY
              </span>
              <Badge
                variant="outline"
                className="rounded-md border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase px-2 py-0"
              >
                {deliverable.name}
              </Badge>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Versions & Feedback
            </h1>
            <p className="text-sm text-white/40 mt-2 uppercase tracking-widest font-bold">
              {versionRequests.length} request
              {versionRequests.length !== 1 ? "s" : ""} • {versions.length}{" "}
              version{versions.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
        </div>

        <Button
          onClick={() =>
            router.push(
              `/projects/${projectId}/deliverables/${deliverableId}/versions/new`,
            )
          }
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-6 py-5 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 text-xs uppercase tracking-widest"
        >
          <Plus className="h-4 w-4" />
          New Version Request
        </Button>
      </div>

      {/* Tabs Layout */}
      <Tabs
        defaultValue="requests"
        className="w-full space-y-8"
        onValueChange={setActiveTab}
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl h-12">
            <TabsTrigger
              value="requests"
              className="rounded-lg px-6 data-[state=active]:bg-indigo-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Version Requests
              <Badge className="ml-2 bg-black/20 text-white/60 border-none h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold">
                {versionRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg px-6 data-[state=active]:bg-indigo-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
            >
              <History className="h-3.5 w-3.5" />
              File History
              <Badge className="ml-2 bg-black/20 text-white/60 border-none h-5 px-1.5 min-w-[20px] flex items-center justify-center font-bold">
                {versions.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Active Tab Stats Summary */}
          <div className="hidden lg:flex items-center gap-6">
            {activeTab === "requests" ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    {
                      versionRequests.filter((r: any) => r.status === "pending")
                        .length
                    }{" "}
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                    {
                      versionRequests.filter(
                        (r: any) => r.status === "resolved",
                      ).length
                    }{" "}
                    Resolved
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">
                  Latest: v
                  {Math.max(...versions.map((v: any) => v.versionNumber), 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <TabsContent
          value="requests"
          className="mt-0 border-none p-0 outline-hidden"
        >
          <VersionRequestsList
            projectId={projectId}
            deliverableId={deliverableId}
            hideHeader={true}
          />
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-0 border-none p-0 outline-hidden"
        >
          <VersionHistoryList
            projectId={projectId}
            deliverableId={deliverableId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
