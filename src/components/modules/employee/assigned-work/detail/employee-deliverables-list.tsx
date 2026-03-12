"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  FileIcon,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  History,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import Link from "next/link";

interface Deliverable {
  _id: Id<"deliverables">;
  _creationTime: number;
  name: string;
  version: number;
  status: string;
  sizeBytes: number;
  uploadedByName: string;
}

export function EmployeeDeliverablesList() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as Id<"projects">;
  const { setOverride, removeOverride } = useBreadcrumbStore();

  const deliverables = useQuery(
    //@ts-ignore
    api.functions.deliverables.queries.getProjectDeliverables,
    { projectId },
  );

  // @ts-ignore
  const project = useQuery(api.employees.getEmployeeProject, { projectId });

  useEffect(() => {
    if (project) {
      const label =
        project.endClientName ||
        project.eventName ||
        project.projectTypeName ||
        project.code;
      if (label) {
        setOverride(projectId, label);
      }
    }
    return () => removeOverride(projectId);
  }, [projectId, project, setOverride, removeOverride]);

  const columns: ColumnDef<Deliverable>[] = [
    {
      accessorKey: "name",
      header: "Deliverable Name",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <Link
            href={`/assigned-work/${projectId}/deliverables/${item._id}`}
            className="flex items-center gap-3 group/item w-fit"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 group-hover/item:border-indigo-500/40 group-hover/item:bg-indigo-500/20 transition-all">
              <FileIcon className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-white mb-0.5 group-hover/item:text-indigo-400 transition-colors">
                {item.name}
              </div>
              <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                v{item.version} • {(item.sizeBytes / (1024 * 1024)).toFixed(2)}{" "}
                MB
              </div>
            </div>
          </Link>
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
                : status === "version_requested" || status === "version_needed"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-400",
            )}
          >
            {status === "approved" ? (
              <CheckCircle className="h-3 w-3" />
            ) : status === "version_requested" ||
              status === "version_needed" ? (
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
      accessorKey: "_creationTime",
      header: "Submitted At",
      cell: ({ row }) => (
        <span className="text-xs font-bold text-white/40">
          {format(row.original._creationTime, "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          {row.original.status === "version_requested" ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5 hover:text-amber-400 hover:border-amber-500/30"
              asChild
            >
              <Link
                href={`/assigned-work/${projectId}/deliverables/${row.original._id}/versions`}
              >
                <History className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5 hover:text-indigo-400 hover:border-indigo-500/30"
              asChild
            >
              <Link
                href={`/assigned-work/${projectId}/deliverables/${row.original._id}`}
              >
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (deliverables === undefined || project === undefined) {
    return (
      <div className="flex flex-1 w-full flex-col px-8 pt-10 pb-12">
        <DataTableSkeleton rows={6} columns={6} viewMode="table" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 w-full flex-col px-8 pt-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                PRODUCTION DELIVERABLES
              </span>
              <Badge
                variant="outline"
                className="rounded-md border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase px-2 py-0"
              >
                {project?.code}
              </Badge>
            </div>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Project Assets
            </h1>
            <p className="text-sm text-white/40 mt-2 uppercase tracking-widest font-bold">
              {deliverables.length} finalized assets for{" "}
              {project?.eventName || project?.endClientName || "this project"}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <FileIcon className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-1">
              Total Assets
            </h3>
            <p className="text-2xl font-black text-white">
              {deliverables.length}
            </p>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">
              Revision Needed
            </h3>
            <p className="text-2xl font-black text-white">
              {
                deliverables.filter(
                  (d) =>
                    d.status === "version_requested" ||
                    d.status === "version_needed",
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
              Approved
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
          emptyDescription="You haven't uploaded any deliverables for this project yet."
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
