"use client";

import { FilePreview } from "@/components/shared/file-preview";

interface DeliverablePreviewProps {
  url: string | null;
  fileName: string;
  mimeType?: string;
  description?: string;
  versionFeedback?: string;
}

export function DeliverablePreview({
  url,
  fileName,
  mimeType,
  description,
  versionFeedback,
}: DeliverablePreviewProps) {
  return (
    <div className="space-y-6">
      {/* Preview Area */}
      <div className="rounded-4xl bg-zinc-900 border border-white/5 overflow-hidden min-h-[500px] relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
        <div className="relative z-10 h-full">
          <FilePreview
            url={url}
            fileName={fileName}
            mimeType={mimeType || "application/octet-stream"}
          />
        </div>
      </div>

      {/* Description */}
      <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
          Description / Notes
        </h3>
        <p className="text-sm text-white/80 leading-relaxed">
          {description || "No description provided."}
        </p>
      </div>

      {/* Version Feedback */}
      {versionFeedback && (
        <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
            Version Feedback
          </h3>
          <p className="text-sm text-red-200/80 leading-relaxed">
            {versionFeedback}
          </p>
        </div>
      )}
    </div>
  );
}
