"use client";

import { motion } from "motion/react";
import { Upload, Plus, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onUpload: (files: File[]) => void;
  isUploading: boolean;
  maxFiles?: number;
  maxFileSize?: number;
}

export function FileUploadZone({
  onUpload,
  isUploading,
  maxFiles = 20,
  maxFileSize = 100 * 1024 * 1024, // 100MB
}: FileUploadZoneProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="relative group">
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleSelectFiles}
        disabled={isUploading}
      />

      <label
        htmlFor="file-input"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center min-h-[280px] rounded-[2.5rem] border-2 border-dashed transition-all duration-700 cursor-pointer overflow-hidden",
          isUploading
            ? "border-primary/20 bg-primary/5 cursor-wait"
            : "border-white/5 bg-white/2 hover:bg-white/4 hover:border-primary/30 group-hover:border-primary/20"
        )}
      >
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[24px_24px]" />

        {/* Animated Glow */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

        <div className="relative z-10 flex flex-col items-center gap-6 p-10 text-center">
          <div
            className={cn(
              "p-6 rounded-3xl transition-all duration-700",
              isUploading
                ? "bg-primary/20 scale-110 shadow-[0_0_30px_rgba(var(--primary),0.3)]"
                : "bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:scale-110"
            )}
          >
            {isUploading ? (
              <div className="relative">
                <Upload className="h-8 w-8 text-primary animate-bounce" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
              </div>
            ) : (
              <Plus className="h-8 w-8 text-white/40 group-hover:text-primary group-hover:rotate-90 transition-all duration-700" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              {isUploading ? "Transmitting Data..." : "Engage Intake"}
            </h3>
            <p className="text-xs font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40 transition-colors">
              Drop files here or click to browse
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Badge
              variant="outline"
              className="border-white/5 bg-white/3 text-[10px] font-black uppercase tracking-widest text-white/40"
            >
              UHD 4K+ Support
            </Badge>
            <Badge
              variant="outline"
              className="border-white/5 bg-white/3 text-[10px] font-black uppercase tracking-widest text-white/40"
            >
              Raw Formats
            </Badge>
            <Badge
              variant="outline"
              className="border-white/5 bg-white/3 text-[10px] font-black uppercase tracking-widest text-white/40"
            >
              Max 100MB / File
            </Badge>
          </div>
        </div>

        {/* Progress bar for isUploading state */}
        {isUploading && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <motion.div
              className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            />
          </div>
        )}
      </label>
    </div>
  );
}

function Badge({
  children,
  variant = "outline",
  className,
}: {
  children: React.ReactNode;
  variant?: "outline";
  className?: string;
}) {
  return (
    <span className={cn("px-3 py-1 rounded-full border shadow-sm", className)}>
      {children}
    </span>
  );
}
