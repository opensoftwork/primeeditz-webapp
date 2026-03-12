"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import {
  FileIcon,
  ArrowLeft,
  CheckCircle,
  Clock,
  ShieldCheck,
  Eye,
  RotateCcw,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useSignedUrls } from "@/components/shared/deliverables";
import { FilePreview } from "@/components/shared/file-preview";
import { motion } from "motion/react";

interface StudioDeliverable {
  _id: Id<"deliverables">;
  _creationTime: number;
  name: string;
  version: number;
  studioVersion?: number;
  displayVersion?: number;
  status: string;
  sizeBytes: number;
  minioKey: string;
  mimeType?: string;
  uploadedByName: string;
  isStudioApproved?: boolean;
  latestVersionStatus?: "pending" | "in_progress" | "resolved";
}

interface StudioDeliverablesListProps {
  projectId: string;
}

export function StudioDeliverablesList({
  projectId,
}: StudioDeliverablesListProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const deliverables = useQuery(
    // @ts-ignore
    api.functions.deliverables.queries.getClientDeliverables,
    { projectId: projectId as Id<"projects"> },
  );

  //@ts-ignore
  const project = useQuery(api.functions.projects.queries.getProject, {
    projectId: projectId as Id<"projects">,
  });
  useEffect(() => {
    // projectId and projects overrides are handled by ProjectBreadcrumbLayout
    return () => {};
  }, [projectId, project, setOverride, removeOverride]);

  // Fetch signed URLs for thumbnails using custom hook
  const deliverableKeys = useMemo(
    () =>
      (deliverables?.map((d) => d.minioKey).filter(Boolean) as string[]) ?? [],
    [deliverables],
  );
  const { urls: signedUrls } = useSignedUrls(deliverableKeys);

  const columns: ColumnDef<StudioDeliverable>[] = [
    {
      accessorKey: "name",
      header: "Deliverable",
      cell: ({ row }) => {
        const item = row.original;
        const url = signedUrls[item.minioKey];
        return (
          <div className="flex items-center gap-4">
            {url ? (
              <div className="h-14 w-14 rounded-xl overflow-hidden bg-black/20 border border-white/10 shrink-0">
                <FilePreview url={url} fileName={item.name} />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                <FileIcon className="h-5 w-5 text-indigo-400" />
              </div>
            )}
            <div>
              <div className="text-sm font-bold text-white mb-0.5">
                {item.name}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-white/40">
                <span className="bg-white/5 px-2 py-0.5 rounded-md">
                  v{item.displayVersion || item.version}
                </span>
                <span>•</span>
                <span>{(item.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Review Status",
      cell: ({ row }) => {
        const item = row.original;
        const isApproved = item.isStudioApproved;
        const hasPendingVersion =
          item.latestVersionStatus === "pending" ||
          item.latestVersionStatus === "in_progress";

        if (isApproved) {
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
              <CheckCircle className="h-3 w-3" />
              Approved
            </div>
          );
        }

        if (hasPendingVersion) {
          return (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-amber-500/10 border-amber-500/20 text-amber-400">
              <RotateCcw className="h-3 w-3" />
              Version Requested
            </div>
          );
        }

        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
            <Clock className="h-3 w-3" />
            Pending Review
          </div>
        );
      },
    },
    {
      accessorKey: "uploadedByName",
      header: "Submitted By",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-white/60">
          {row.original.uploadedByName}
        </span>
      ),
    },
    {
      accessorKey: "_creationTime",
      header: "Delivered On",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-white/40">
          {format(row.original._creationTime, "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5 hover:text-indigo-400 hover:border-indigo-500/30"
            asChild
          >
            <Link
              href={`/projects/${projectId}/deliverables/${row.original._id}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  // Loading state
  if (deliverables === undefined || project === undefined) {
    return (
      <div className="flex flex-1 w-full flex-col px-8 pt-10 pb-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
        <DataTableSkeleton rows={6} columns={5} viewMode="table" />
      </div>
    );
  }

  const approvedCount = deliverables.filter((d) => d.isStudioApproved).length;
  const versionRequestsCount = deliverables.filter(
    (d) =>
      d.latestVersionStatus === "pending" ||
      d.latestVersionStatus === "in_progress",
  ).length;
  const pendingReviewCount =
    deliverables.length - approvedCount - versionRequestsCount;

  return (
    <div className="flex flex-1 w-full flex-col px-8 pt-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg shrink-0"
            asChild
          >
            <Link href={`/projects/${projectId}`}>
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </Link>
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                Your Deliverables
              </span>
              <Badge
                variant="outline"
                className="rounded-md border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase px-2 py-0"
              >
                {project?.code}
              </Badge>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Final Deliverables
            </h1>
            <p className="text-sm text-white/40 mt-2 uppercase tracking-widest font-bold">
              {deliverables.length} finalized{" "}
              {deliverables.length === 1 ? "file" : "files"} for your project
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                Total Size
              </span>
              <span className="text-xs font-bold text-white">
                {(
                  deliverables.reduce((acc, d) => acc + d.sizeBytes, 0) /
                  (1024 * 1024)
                ).toFixed(1)}{" "}
                MB
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                Reviewed
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {approvedCount} / {deliverables.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4"
        >
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Package className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">
              Pending Review
            </h3>
            <p className="text-2xl font-black text-white">
              {pendingReviewCount}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4"
        >
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <RotateCcw className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
              Version Requests
            </h3>
            <p className="text-2xl font-black text-white">
              {versionRequestsCount}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4"
        >
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">
              Approved
            </h3>
            <p className="text-2xl font-black text-white">{approvedCount}</p>
          </div>
        </motion.div>
      </div>

      {/* Main Table */}
      <div className="flex-1">
        <DataTable
          className="flex-1"
          columns={columns}
          data={deliverables as StudioDeliverable[]}
          isLoading={deliverables === undefined}
          emptyTitle="No Deliverables Available"
          emptyDescription="Your finalized deliverables will appear here once the production team completes and approves their work."
          defaultView="table"
          showViewToggle={false}
          toolbar={{
            search: {
              column: "name",
              placeholder: "Search your deliverables...",
            },
          }}
        />
      </div>
    </div>
  );
}
