"use client";

import { Upload } from "lucide-react";
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
}

export function DropZone({
  onFilesSelected,
  disabled = false,
  accept,
  title = "Drop files here or click to browse",
  description = "Supports all major file formats",
  multiple = true,
  className,
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
      e.target.value = ""; // Reset input
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
    if (!disabled) {
      setIsDragOver(true);
    }
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

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer group overflow-hidden",
          disabled
            ? "border-white/5 opacity-50 cursor-not-allowed"
            : isDragOver
              ? "border-primary/50 bg-primary/10 scale-[1.01]"
              : "border-white/10 hover:border-primary/30 hover:bg-white/2",
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
      >
        {/* Subtle glow effect on drag over */}
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
        )}

        <div className="relative z-10 p-10 text-center flex flex-col items-center gap-4">
          <div
            className={cn(
              "h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center transition-all duration-300",
              !disabled && "group-hover:scale-110 group-hover:bg-primary/15",
              isDragOver && "scale-110 bg-primary/20",
            )}
          >
            <Upload
              className={cn(
                "h-7 w-7 text-primary/60 transition-colors duration-300",
                !disabled && "group-hover:text-primary",
                isDragOver && "text-primary",
              )}
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-black uppercase tracking-tight text-white">
              {title}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
              {description}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
