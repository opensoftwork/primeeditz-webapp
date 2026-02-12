"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery, useAction } from "convex/react";
import {
  FileIcon,
  Download,
  User,
  Calendar,
  HardDrive,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { DeliverableVersion } from "./types";

interface VersionHistoryListProps {
  projectId: string;
  deliverableId: string;
}

export function VersionHistoryList({
  projectId,
  deliverableId,
}: VersionHistoryListProps) {
  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    { deliverableId: deliverableId as Id<"deliverables"> },
  );

  const getSignedUrl = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  const handleDownload = async (minioKey: string, fileName: string) => {
    try {
      const url = await getSignedUrl({ storageKey: minioKey });
      if (!url) throw new Error("Could not generate download URL");

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const columns: ColumnDef<DeliverableVersion>[] = [
    {
      accessorKey: "versionNumber",
      header: "Version",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 font-black">
            v{row.original.versionNumber}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "uploadedByRole",
      header: "Source",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.uploadedByRole === "admin" ? (
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          ) : (
            <User className="h-3.5 w-3.5 text-purple-400" />
          )}
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            {row.original.uploadedByRole}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "uploadedByName",
      header: " uploader",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-white/40">
          {row.original.uploadedByName}
        </span>
      ),
    },
    {
      accessorKey: "sizeBytes",
      header: "Size",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-white/40">
          {(row.original.sizeBytes / (1024 * 1024)).toFixed(2)} MB
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Uploaded At",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-white/40">
          {format(row.original.createdAt, "MMM dd, yyyy • HH:mm")}
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
            className="h-9 w-9 rounded-xl border border-white/5 hover:bg-white/5"
            onClick={() =>
              handleDownload(
                row.original.minioKey,
                `v${row.original.versionNumber}_asset`,
              )
            }
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns as any}
        data={versions || []}
        isLoading={versions === undefined}
        emptyTitle="No Version History"
        emptyDescription="No file versions have been recorded for this deliverable."
        defaultView="table"
        showViewToggle={false}
      />
    </div>
  );
}
