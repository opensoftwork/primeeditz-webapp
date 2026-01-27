"use client";

import { Upload } from "lucide-react";
import { useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

interface FolderDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FolderDropZone({
  onFilesSelected,
  disabled,
}: FolderDropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  };

  return (
    <>
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <Card
        className={`border-2 border-dashed transition-all cursor-pointer group ${
          disabled
            ? "border-white/5 opacity-50 cursor-not-allowed"
            : "border-white/10 hover:border-primary/30 hover:bg-white/5"
        }`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <CardContent className="p-12 text-center">
          <div
            className={`mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 transition-transform ${
              !disabled && "group-hover:scale-110"
            }`}
          >
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-tight text-white mb-2">
            Drop files here or click to browse
          </CardTitle>
          <CardDescription className="text-sm font-bold uppercase tracking-widest">
            Supports all major video and image formats
          </CardDescription>
        </CardContent>
      </Card>
    </>
  );
}
