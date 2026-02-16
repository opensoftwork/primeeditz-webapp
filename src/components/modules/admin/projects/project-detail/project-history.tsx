"use client";

import { History } from "lucide-react";
import { DetailSection } from "@/components/modules/projects/detail/shared";
import { getStatusConfig } from "@/lib/status-display";
import { cn } from "@/lib/utils";
import type { StatusHistoryEntry } from "./types";

interface ProjectHistoryProps {
  history?: StatusHistoryEntry[];
}

export function ProjectHistory({ history }: ProjectHistoryProps) {
  return (
    <DetailSection
      title="Status History"
      icon={<History className="h-5 w-5" />}
    >
      <div className="space-y-6">
        {history && history.length > 0 ? (
          history.map((entry: StatusHistoryEntry, idx: number) => {
            const currentConfig = getStatusConfig(entry.newActionState);
            const prevConfig = entry.previousActionState
              ? getStatusConfig(entry.previousActionState)
              : null;

            return (
              <div
                key={`${entry.changedAt}-${idx}`}
                className="flex gap-4 group"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-2.5 h-2.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors mt-1",
                      currentConfig.bgColor.split(" ")[0],
                    )}
                  />
                  {idx !== history.length - 1 && (
                    <div className="w-px h-full bg-white/5 group-hover:bg-primary/10 transition-colors my-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {prevConfig && (
                        <>
                          <span className="text-[10px] font-medium text-white/20 line-through">
                            {prevConfig.label}
                          </span>
                          <span className="text-[10px] font-bold text-white/40">
                            →
                          </span>
                        </>
                      )}
                      <p
                        className={cn(
                          "text-xs font-black uppercase tracking-tight",
                          currentConfig.color,
                        )}
                      >
                        {currentConfig.label}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-white/20">
                      {new Date(entry.changedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-white/30 mt-1 uppercase tracking-widest flex items-center gap-2">
                    <span>Actor: {entry.actorName}</span>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {entry.actorRole}
                    </span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs font-black uppercase tracking-widest text-white/20 py-4">
            No history records found
          </p>
        )}
      </div>
    </DetailSection>
  );
}
