"use client";

import React from "react";
import Image from "next/image";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { formatFileSize, getFileTypeIcon } from "../utils";
import type { VaultFile } from "../types";

interface VaultFileItemProps {
  file: VaultFile;
  index: number;
  onImageClick: (fileId: string) => void;
  onRemove?: (fileId: string) => void;
}

export function VaultFileItem({
  file,
  index,
  onImageClick,
  onRemove,
}: VaultFileItemProps) {
  const FileIcon = getFileTypeIcon(file.type);
  const isImage = file.type.startsWith("image/");

  return (
    <motion.div
      key={file.id}
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative flex items-center justify-between p-3 rounded-2xl bg-white/1 border border-white/5 hover:bg-white/3 hover:border-primary/40 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div
          className="shrink-0 w-14 h-14 rounded-xl border border-white/10 overflow-hidden bg-black/40 cursor-pointer transition-all hover:scale-105 shadow-xl shadow-black/40 relative"
          onClick={() => onImageClick(file.id)}
        >
          {file.isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white/10" />
            </div>
          ) : isImage && file.url ? (
            <Image
              src={file.url}
              alt={file.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-110 transition-all duration-700"
            />
          ) : (
            <div className="flex items-center justify-center h-full group-hover:bg-primary/5 transition-all">
              <FileIcon className="h-6 w-6 text-white/20 group-hover:text-primary transition-all duration-500" />
            </div>
          )}
        </div>
        <div className="min-w-0 pr-4">
          <p className="text-sm font-bold truncate tracking-tight text-white group-hover:text-primary transition-colors">
            {file.name}
          </p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] bg-white/5 px-2.5 py-1 rounded-lg">
              {formatFileSize(file.size)}
            </span>
            <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">
              {file.type.split("/")[1]?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pr-4">
        {file.url && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 rounded-lg border-white/10 hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] gap-2 hidden sm:flex"
            onClick={() => onImageClick(file.id)}
          >
            <Eye className="h-4 w-4" />
            VIEW
          </Button>
        )}
        {onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg opacity-0 group-hover:opacity-100 bg-white/5 hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
            onClick={() => onRemove(file.id)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
