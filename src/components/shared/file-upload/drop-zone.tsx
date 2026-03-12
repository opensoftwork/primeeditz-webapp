"use client";

import { Upload } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DropZoneProps {
  /** Callback when files are selected (via click or drag-and-drop) */
  onFilesSelected: (files: File[]) => void;
  /** Whether the drop zone is disabled */
  disabled?: boolean;
  /** Accepted file types (e.g., "image/*,video/*") */
  accept?: string;
  /** Title text displayed in the drop zone */
  title?: string;
  /** Description text displayed below the title */
  description?: string;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** Additional className for the container */
  className?: string;
  /** Compact mode — smaller padding for embedded use */
  compact?: boolean;
}

export function DropZone({
  onFilesSelected,
  disabled = false,
  accept,
  title = "Drop files here or click to browse",
  description = "Supports all major file formats",
  multiple = true,
  className,
  compact = false,
}: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(Array.from(files));
      e.target.value = "";
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [disabled, onFilesSelected],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <>
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-500 cursor-pointer group overflow-hidden",
          disabled
            ? "border-white/5 opacity-50 cursor-not-allowed"
            : isDragOver
              ? "border-primary/50 bg-primary/5"
              : "border-white/10 hover:border-white/20",
          className,
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        animate={isDragOver ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Animated glow */}
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none"
          />
        )}

        <div
          className={cn(
            "relative z-10 text-center flex flex-col items-center gap-3",
            compact ? "py-6 px-4" : "py-10 px-6",
          )}
        >
          <motion.div
            className={cn(
              "rounded-2xl bg-white/5 flex items-center justify-center transition-colors duration-300",
              compact ? "h-12 w-12" : "h-14 w-14",
              !disabled && "group-hover:bg-primary/10",
              isDragOver && "bg-primary/15",
            )}
            animate={isDragOver ? { y: -4 } : { y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Upload
              className={cn(
                "transition-colors duration-300",
                compact ? "h-5 w-5" : "h-6 w-6",
                isDragOver
                  ? "text-primary"
                  : "text-white/25 group-hover:text-white/50",
              )}
            />
          </motion.div>
          <div className="space-y-1">
            <p
              className={cn(
                "font-black uppercase tracking-tight text-white/80",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {title}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
              {description}
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
