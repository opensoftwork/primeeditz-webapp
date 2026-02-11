"use client";

import { format } from "date-fns";
import { ArrowLeft, History, Download } from "lucide-react";
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl h-10 w-10 border-white/10 hover:bg-white/5"
          onClick={onBack}
        >
          <ArrowLeft className="h-5 w-5 text-white/60" />
        </Button>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            {name}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
            <span>Version {version}</span>
            <span>•</span>
            <span>{formattedSize} MB</span>
            <span>•</span>
            <span>{format(createdAt, "PPP p")}</span>
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
