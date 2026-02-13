"use client";

import { format } from "date-fns";
import { FileIcon, Send } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { FilePreview } from "@/components/shared/file-preview";

interface DeliverableCardProps {
  id: Id<"deliverables">;
  projectId: string;
  name: string;
  version: number;
  studioVersion?: number;
  sizeBytes: number;
  status: string;
  createdAt: number;
  uploadedByName: string;
  onSend?: () => void;
  variant?: "card" | "flat";
  href?: string;
  disableLink?: boolean;
  signedUrl?: string;
}

export function DeliverableCard({
  id,
  projectId,
  name,
  version,
  studioVersion,
  sizeBytes,
  status,
  createdAt,
  uploadedByName,
  onSend,
  variant = "card",
  href,
  disableLink,
  signedUrl,
}: DeliverableCardProps) {
  const CardWrapper = (disableLink ? "div" : Link) as any;
  const cardHref = href || `/projects/${projectId}/deliverables/${id}`;

  return (
    <CardWrapper
      {...(disableLink ? {} : { href: cardHref })}
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center justify-between transition-all gap-4 cursor-pointer",
        variant === "card"
          ? "p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30"
          : "p-2 rounded-xl border border-transparent hover:bg-white/5",
      )}
    >
      <div className="flex items-center gap-4">
        {signedUrl ? (
          <div className="h-16 w-16 rounded-xl overflow-hidden bg-black/20 border border-white/10 shrink-0">
            <FilePreview url={signedUrl} fileName={name} />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
            <FileIcon className="h-6 w-6 text-indigo-400" />
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
            {name}
          </h4>
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase font-bold tracking-wider text-white/40">
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded-md">
              <span className="text-white/30">Internal</span>
              <span className="text-white">v{version}</span>
              {studioVersion != null && (
                <>
                  <span className="w-px h-2 bg-white/10 mx-0.5" />
                  <span className="text-indigo-400/50">Client</span>
                  <span className="text-indigo-400">v{studioVersion}</span>
                </>
              )}
            </div>
            <span>•</span>
            <span>{(sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
            <span>•</span>
            <span>{format(createdAt, "MMM dd, yyyy")}</span>
            <span>•</span>
            <span
              className={cn(
                status === "approved"
                  ? "text-emerald-400"
                  : status === "version_requested" ||
                      status === "version_needed"
                    ? "text-red-400"
                    : "text-amber-400",
              )}
            >
              {status.replace("_", " ").replace("revision", "version")}
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
    </CardWrapper>
  );
}
