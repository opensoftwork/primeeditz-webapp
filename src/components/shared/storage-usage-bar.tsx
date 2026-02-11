"use client";

import { AlertTriangle, HardDrive } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatBytes } from "./project-folders/folder-card";

interface StorageUsageBarProps {
  used: number;
  allocated: number;
  className?: string;
}

export function StorageUsageBar({
  used,
  allocated,
  className,
}: StorageUsageBarProps) {
  const percentage = allocated > 0 ? (used / allocated) * 100 : 0;

  let statusColor = "bg-emerald-500";
  let textColor = "text-emerald-500";
  let statusLabel = "Healthy";

  if (percentage >= 95) {
    statusColor = "bg-red-500";
    textColor = "text-red-500";
    statusLabel = "Critical";
  } else if (percentage >= 80) {
    statusColor = "bg-amber-500";
    textColor = "text-amber-500";
    statusLabel = "Warning";
  }

  return (
    <div
      className={cn(
        "space-y-4 p-8 rounded-[2rem] bg-white/3 border border-white/5 relative overflow-hidden",
        className,
      )}
    >
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[20px_20px]" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl bg-white/5", textColor)}>
              <HardDrive className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Storage Usage
              </h4>
              <p className="text-sm font-black uppercase tracking-tight text-white mt-0.5">
                {formatBytes(used)}{" "}
                <span className="text-white/20">
                  / {formatBytes(allocated)}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em]",
                textColor,
              )}
            >
              {statusLabel}
            </span>
            <p className="text-lg font-black tracking-tight text-white mt-0.5">
              {Math.round(percentage)}%
            </p>
          </div>
        </div>

        <Progress
          value={percentage}
          className="h-2 bg-white/5"
          indicatorClassName={statusColor}
        />

        {percentage >= 80 && (
          <div
            className={cn(
              "mt-6 flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 animate-in fade-in slide-in-from-top-2",
              textColor,
            )}
          >
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider leading-relaxed">
                {percentage >= 95
                  ? "Storage is almost full! Please contact support to upgrade your allocation."
                  : "Approaching storage limit. Consider cleaning up old assets or upgrading."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
