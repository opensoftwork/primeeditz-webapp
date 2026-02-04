"use client";

import { format } from "date-fns";
import { FileIcon, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";

interface DeliverableCardProps {
  id: Id<"deliverables">;
  projectId: string;
  name: string;
  version: number;
  sizeBytes: number;
  status: string;
  createdAt: number;
  uploadedByName: string;
  onSend?: () => void;
}

export function DeliverableCard({
  id,
  projectId,
  name,
  version,
  sizeBytes,
  status,
  createdAt,
  uploadedByName,
  onSend,
}: DeliverableCardProps) {
  return (
    <Link
      href={`/projects/${projectId}/deliverables/${id}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all gap-4 cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
          <FileIcon className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
            {name}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-white/40">
            <span className="bg-white/5 px-2 py-0.5 rounded-md">v{version}</span>
            <span>•</span>
            <span>{(sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
            <span>•</span>
            <span>{format(createdAt, "MMM dd, yyyy")}</span>
            <span>•</span>
            <span
              className={cn(
                status === "approved"
                  ? "text-emerald-400"
                  : status === "revision_requested" || status === "revision_needed"
                    ? "text-red-400"
                    : "text-amber-400"
              )}
            >
              {status.replace("_", " ")}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 pl-16 sm:pl-0">
        <div className="text-left sm:text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
            Submitted By
          </p>
          <p className="text-xs font-bold text-white/60">{uploadedByName}</p>
        </div>

        {onSend && (
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 shrink-0 rounded-xl border-white/10 hover:bg-white/10 group-hover:border-indigo-500/50 group-hover:text-indigo-400"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSend();
            }}
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Link>
  );
}
