"use client";

import { useUploadStore } from "@/stores/upload-store";
import {
  Upload,
  X,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function UploadStatusOverlay() {
  const { items, removeUpload } = useUploadStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const uploadList = Object.values(items);
  if (uploadList.length === 0) return null;

  const activeUploads = uploadList.filter(
    (i) =>
      i.status === "uploading" ||
      i.status === "processing" ||
      i.status === "pending",
  );
  const completedUploads = uploadList.filter((i) => i.status === "completed");
  const failedUploads = uploadList.filter((i) => i.status === "error");

  const totalProgress =
    activeUploads.length > 0
      ? Math.round(
          activeUploads.reduce((sum, i) => sum + i.progress, 0) /
            activeUploads.length,
        )
      : completedUploads.length > 0
        ? 100
        : 0;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <motion.div
        layout
        className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header (Always Visible) */}
        <div
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl",
                activeUploads.length > 0
                  ? "bg-primary/20 text-primary"
                  : "bg-emerald-500/20 text-emerald-500",
              )}
            >
              {activeUploads.length > 0 ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                {activeUploads.length > 0
                  ? `Uploading ${activeUploads.length} files`
                  : "Uploads Finished"}
              </p>
              <p className="text-xs font-black uppercase tracking-tight text-white mt-0.5">
                {activeUploads.length > 0
                  ? `${totalProgress}% Complete`
                  : `${completedUploads.length} successful`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {failedUploads.length > 0 && (
              <span className="flex items-center gap-1 text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                {failedUploads.length} Errors
              </span>
            )}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronUp className="h-4 w-4 text-white/40" />
            )}
          </div>
        </div>

        {/* Total Progress Bar (Always Visible when uploading) */}
        {activeUploads.length > 0 && (
          <div className="px-4 pb-4">
            <Progress
              value={totalProgress}
              className="h-1 bg-white/5"
              indicatorClassName="bg-primary"
            />
          </div>
        )}

        {/* Expanded Queue */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 bg-black/40"
            >
              <div className="max-h-64 overflow-y-auto p-2 space-y-1 scrollbar-thin">
                {uploadList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white/3 border border-white/5 group hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <StatusIcon status={item.status} />
                        <span className="text-[11px] font-bold text-white/80 truncate">
                          {item.file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeUpload(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <X className="h-3 w-3 text-white/40" />
                      </button>
                    </div>
                    {item.status === "uploading" && (
                      <div className="flex items-center gap-3">
                        <Progress
                          value={item.progress}
                          className="h-1 flex-1 bg-white/5"
                          indicatorClassName="bg-primary"
                        />
                        <span className="text-[9px] font-black text-white/40 tabular-nums">
                          {item.progress}%
                        </span>
                      </div>
                    )}
                    {item.status === "error" && (
                      <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">
                        {item.error || "Upload failed"}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "error":
      return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
    case "uploading":
      return <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />;
    case "processing":
      return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
    default:
      return (
        <div className="h-3.5 w-3.5 rounded-full border border-white/20" />
      );
  }
}
