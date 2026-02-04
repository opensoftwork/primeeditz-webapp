"use client";

import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DeliverableVersion } from "./types";

interface VersionHistoryProps {
  versions: DeliverableVersion[];
  currentId: string;
  projectId: string;
}

export function VersionHistory({
  versions,
  currentId,
  projectId,
}: VersionHistoryProps) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
      <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
        Version History
      </h3>
      <div className="flex flex-wrap gap-2">
        {versions.map((v) => (
          <Link
            key={v._id}
            href={`/projects/${projectId}/deliverables/${v._id}`}
            className={cn(
              "px-3 py-2 rounded-xl border text-xs font-bold transition-all",
              v._id === currentId
                ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
            )}
          >
            <span>v{v.version}</span>
            <span className="ml-2 text-[10px] text-white/40">
              {format(v._creationTime, "MMM dd")}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
