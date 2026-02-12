"use client";

import { format } from "date-fns";
import { ArrowLeft, History, Download, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeliverableHeaderProps {
  name: string;
  version: number;
  sizeBytes: number;
  createdAt: number;
  hasMultipleVersions: boolean;
  versionCount: number;
  showVersionHistory: boolean;
  onToggleVersionHistory: () => void;
  onBack: () => void;
  downloadUrl?: string | null;
}

export function DeliverableHeader({
  name,
  version,
  sizeBytes,
  createdAt,
  hasMultipleVersions,
  versionCount,
  showVersionHistory,
  onToggleVersionHistory,
  onBack,
  downloadUrl,
}: DeliverableHeaderProps) {
  const formattedSize = (sizeBytes / (1024 * 1024)).toFixed(2);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-all opacity-50" />
            <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all shadow-xl shadow-primary/10">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">
                Deliverable Detail
              </span>
              <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                v{version}
              </span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
              {name}
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">
              <span>{formattedSize} MB</span>
              <span>•</span>
              <span>{format(createdAt, "PPP p")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {downloadUrl && (
          <Button
            variant="outline"
            size="sm"
            asChild
            className="rounded-xl border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400 gap-2 transition-all"
          >
            <a href={downloadUrl} download={name}>
              <Download className="h-4 w-4" />
              Download
            </a>
          </Button>
        )}

        {hasMultipleVersions && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleVersionHistory}
            className="rounded-xl border-white/10 hover:bg-white/5 gap-2"
          >
            <History className="h-4 w-4" />
            {versionCount} Versions
          </Button>
        )}
      </div>
    </div>
  );
}
