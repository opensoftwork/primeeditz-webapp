"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DeliverableVersion } from "./types";

interface VersionHistoryProps {
  versions: DeliverableVersion[];
  currentVersionNumber?: number;
  onSelect?: (version: DeliverableVersion) => void;
}

/**
 * Displays version history for a deliverable as clickable pills.
 * Now uses deliverableVersions entries (same deliverable, different file versions)
 * instead of linking to separate deliverable pages.
 */
export function VersionHistory({
  versions,
  currentVersionNumber,
  onSelect,
}: VersionHistoryProps) {
  if (!versions || versions.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
        Version History
      </h3>
      <div className="flex flex-wrap gap-2">
        {versions.map((v) => {
          const isSelected = v.versionNumber === currentVersionNumber;
          return (
            <button
              key={v._id}
              onClick={() => onSelect?.(v)}
              className={cn(
                "px-3 py-2 rounded-xl border text-left text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]",
                isSelected
                  ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20",
              )}
            >
              <div className="flex items-center gap-2">
                <span>v{v.versionNumber}</span>
                {isSelected && (
                  <span className="px-1 rounded bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-tighter">
                    VIEWING
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-white/40 font-medium">
                  {format(v.createdAt, "MMM dd")}
                </span>
                <span className="text-[10px] text-white/30">·</span>
                <span className="text-[10px] text-white/30 capitalize">
                  {v.uploadedByRole}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
