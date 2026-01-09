"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { X, Image, Video, FileIcon, File } from "lucide-react";
import { formatFileSize } from "@/lib/file";

interface FileItemProps {
  fileId: string;
  index: number;
  onRemove: (index: number) => void;
}

export function FileItem({ fileId, index, onRemove }: FileItemProps) {
  const parseFileInfo = (id: string) => {
    if (id.startsWith("pending:")) {
      const parts = id.split(":");
      return {
        name: parts[1] || "Unknown",
        size: Number(parts[2]) || 0,
        isPending: true,
      };
    }
    return { name: id, size: 0, isPending: false };
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split(".").pop();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext || "")) {
      return <Video className="h-5 w-5 text-purple-500" />;
    }
    if (["pdf"].includes(ext || "")) {
      return <FileIcon className="h-5 w-5 text-red-500" />;
    }
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const info = parseFileInfo(fileId);

  return (
    <motion.li
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        {getFileIcon(info.name)}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{info.name}</p>
          {info.size > 0 && (
            <p className="text-xs text-muted-foreground">
              {formatFileSize(info.size)}
              {info.isPending && " • Pending upload"}
            </p>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Remove ${info.name}`}
      >
        <X className="h-4 w-4" />
      </Button>
    </motion.li>
  );
}
