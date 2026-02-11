"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  FileIcon,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Eye,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { toast } from "sonner";

interface Deliverable {
  _id: Id<"deliverables">;
  _creationTime: number;
  name: string;
  version: number;
  status: string;
  sizeBytes: number;
  uploadedByName: string;
}

export function DeliverablesList() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"projects">;
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const deliverables = useQuery(
    //@ts-ignore
    api.functions.deliverables.queries.getProjectDeliverables,
    { projectId },
  );

  const sendToStudioMutation = useMutation(
    api.functions.deliverables.mutations.sendToStudio,
  );
  // @ts-ignore
  const project = useQuery(api.admin.getAdminProject, { projectId });

  useEffect(() => {
    const label =
      project?.eventName || project?.projectTypeName || project?.code;
    if (label) {
      setOverride(projectId, label);
    }
    return () => removeOverride(projectId);
  }, [
    projectId,
    project?.eventName,
    project?.projectTypeName,
    project?.code,
    setOverride,
    removeOverride,
  ]);

  const handleSendToStudio = async (deliverableId: Id<"deliverables">) => {
    try {
      await sendToStudioMutation({ deliverableId });
      toast.success("Deliverables sent to studio review!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send to studio");
    }
  };

  const columns: ColumnDef<Deliverable>[] = [
    {
      accessorKey: "name",
      header: "Deliverable Name",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
              <FileIcon className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5">
                {item.name}
              </div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                v{item.version} • {(item.sizeBytes / (1024 * 1024)).toFixed(2)}{" "}
                MB
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
              status === "approved"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : status === "revision_requested" ||
                    status === "revision_needed"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400",
            )}
          >
            {status === "approved" ? (
              <CheckCircle className="h-3 w-3" />
            ) : status === "revision_requested" ||
              status === "revision_needed" ? (
              <XCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {status.replace("_", " ")}
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
      header: "Submitted At",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-white/40">
          {format(row.original._creationTime, "MMM dd, yyyy • HH:mm")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
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
          {row.original.status === "approved" &&
            project?.actionState !== "awaiting_review" &&
            project?.actionState !== "review_approved" &&
            project?.phase !== "delivery" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5 hover:text-emerald-400 hover:border-emerald-500/30"
                onClick={() => handleSendToStudio(row.original._id)}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
        </div>
      ),
    },
  ];

  if (deliverables === undefined || project === undefined) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
        <DataTableSkeleton rows={6} columns={6} viewMode="table" />
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
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Button>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400/60">
                QUALITY CONTROL PIPELINE
              </span>
              <Badge
                variant="outline"
                className="rounded-md border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase px-2 py-0"
              >
                {project?.code}
              </Badge>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Deliverables 
            </h1>
            <p className="text-sm text-white/40 mt-2 uppercase tracking-widest font-bold">
              Reviewing {deliverables.length} finalized assets for{" "}
              {project?.eventName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                Storage Used
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
                Approved
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {deliverables.filter((d) => d.status === "approved").length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <ShieldCheck className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">
              Pending QC
            </h3>
            <p className="text-2xl font-black text-white">
              {deliverables.filter((d) => d.status === "pending_qc").length}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
              Revisions
            </h3>
            <p className="text-2xl font-black text-white">
              {
                deliverables.filter(
                  (d) =>
                    d.status === "revision_requested" ||
                    d.status === "revision_needed",
                ).length
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
              Ready for Delivery
            </h3>
            <p className="text-2xl font-black text-white">
              {deliverables.filter((d) => d.status === "approved").length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1">
        <DataTable
          className="flex-1"
          columns={columns}
          data={deliverables}
          isLoading={deliverables === undefined}
          emptyTitle="No Deliverables Found"
          emptyDescription="No finalized assets have been uploaded for this project yet."
          defaultView="table"
          showViewToggle={false}
          toolbar={{
            search: {
              column: "name",
              placeholder: "Search deliverables...",
            },
          }}
        />
      </div>
    </div>
  );
}
