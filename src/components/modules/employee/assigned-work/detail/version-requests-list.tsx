"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowLeft,
  Eye,
  ImageIcon,
  Hash,
  Clock,
  Play,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import Link from "next/link";

import {
  VersionRequestRow,
  VersionStatusBadge,
} from "@/components/shared/deliverables";

interface VersionRequestsListProps {
  projectId: string;
  deliverableId: string;
  hideHeader?: boolean;
}

export function VersionRequestsList({
  projectId,
  deliverableId,
  hideHeader = false,
}: VersionRequestsListProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const versionRequests = useQuery(
    // @ts-ignore
    api.functions.deliverables.queries.getDeliverableVersionRequests,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  useEffect(() => {
    if (deliverable) {
      setOverride(deliverableId, deliverable.name);
    }
    return () => removeOverride(deliverableId);
  }, [deliverableId, deliverable, setOverride, removeOverride]);

  const columns: ColumnDef<VersionRequestRow>[] = [
    {
      accessorKey: "versionNumber",
      header: "Request #",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <Hash className="h-4 w-4 text-indigo-400" />
          </div>
          <span className="text-sm font-black text-white">
            #{row.original.versionNumber}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "notes",
      header: "Feedback",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="text-xs text-white/60 line-clamp-2">
            {row.original.notes}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <VersionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "requestedByName",
      header: "Requested By",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-bold text-white/60">
            {row.original.requestedByName}
          </span>
          <span
            className={cn(
              "inline-flex items-center w-fit px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
              row.original.requestedByRole === "admin"
                ? "text-indigo-400 border-indigo-500/20 bg-indigo-500/10"
                : "text-purple-400 border-purple-500/20 bg-purple-500/10",
            )}
          >
            {row.original.requestedByRole}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "referenceImages",
      header: "Images",
      cell: ({ row }) => {
        const count = row.original.referenceImages?.length || 0;
        return (
          <div className="flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5 text-white/30" />
            <span className="text-xs font-bold text-white/40">{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-white/40">
          {format(row.original.createdAt, "MMM dd, yyyy")}
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
              href={`/assigned-work/${projectId}/deliverables/${deliverableId}/versions/${row.original._id}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  // Loading
  if (versionRequests === undefined || deliverable === undefined) {
    return (
      <div className="flex flex-1 w-full flex-col px-8 pt-10 pb-12">
        <DataTableSkeleton rows={5} columns={6} viewMode="table" />
      </div>
    );
  }

  if (deliverable === null) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700",
        !hideHeader && "flex-1 px-8 pt-10 pb-12",
      )}
    >
      {/* Header */}
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl h-11 w-11 border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-lg shrink-0"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5 text-white/60" />
            </Button>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                  VERSION HISTORY
                </span>
                <Badge
                  variant="outline"
                  className="rounded-md border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase px-2 py-0"
                >
                  {deliverable.name}
                </Badge>
              </div>
              <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
                Version Requests
              </h1>
              <p className="text-sm text-white/40 mt-2 uppercase tracking-widest font-bold">
                {versionRequests.length} request
                {versionRequests.length !== 1 ? "s" : ""} for {deliverable.name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {!hideHeader && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
                Pending
              </h3>
              <p className="text-2xl font-black text-white">
                {versionRequests.filter((r) => r.status === "pending").length}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Play className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1">
                In Progress
              </h3>
              <p className="text-2xl font-black text-white">
                {
                  versionRequests.filter((r) => r.status === "in_progress")
                    .length
                }
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">
                Resolved
              </h3>
              <p className="text-2xl font-black text-white">
                {versionRequests.filter((r) => r.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1">
        <DataTable
          className="flex-1"
          columns={columns}
          data={versionRequests as VersionRequestRow[]}
          isLoading={versionRequests === undefined}
          emptyTitle="No Version Requests"
          emptyDescription="No version requests have been created for this deliverable yet."
          defaultView="table"
          showViewToggle={false}
          toolbar={{
            search: {
              column: "notes",
              placeholder: "Search version requests...",
            },
          }}
        />
      </div>
    </div>
  );
}
