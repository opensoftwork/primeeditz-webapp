"use client";

import {
  FileText,
  Image as ImageIcon,
  LucideIcon,
  RotateCcw,
  Video,
  Music,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileStatsCardProps {
  type: "image" | "video" | "audio" | "document";
  count: number;
  onClick: () => void;
}

const TYPE_CONFIG = {
  image: {
    label: "Images",
    icon: ImageIcon,
    colorClass: "text-primary",
    hoverBorder: "hover:border-primary/20",
    manageBg: "bg-primary/10",
    manageBorder: "border-primary/20",
    manageText: "text-primary",
  },
  video: {
    label: "Videos",
    icon: Video,
    colorClass: "text-amber-500",
    hoverBorder: "hover:border-amber-500/20",
    manageBg: "bg-amber-500/10",
    manageBorder: "border-amber-500/20",
    manageText: "text-amber-500",
  },
  document: {
    label: "Documents",
    icon: FileText,
    colorClass: "text-blue-500",
    hoverBorder: "hover:border-blue-500/20",
    manageBg: "bg-blue-500/10",
    manageBorder: "border-blue-500/20",
    manageText: "text-blue-500",
  },
  audio: {
    label: "Audio",
    icon: Music,
    colorClass: "text-emerald-500",
    hoverBorder: "hover:border-emerald-500/20",
    manageBg: "bg-emerald-500/10",
    manageBorder: "border-emerald-500/20",
    manageText: "text-emerald-500",
  },
};

export function FileStatsCard({ type, count, onClick }: FileStatsCardProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "p-4 h-auto rounded-2xl bg-white/2 border border-white/5 flex flex-col items-start gap-2 group hover:bg-white/5 transition-all text-left relative overflow-hidden",
        config.hoverBorder,
      )}
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg border",
            config.manageBg,
            config.manageBorder,
          )}
        >
          <span
            className={cn(
              "text-[8px] font-black uppercase tracking-widest",
              config.manageText,
            )}
          >
            Manage
          </span>
          <RotateCcw className={cn("h-2 w-2", config.manageText)} />
        </div>
      </div>
      <div className={cn("flex items-center gap-2", config.colorClass)}>
        <Icon className="h-3 w-3" />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {config.label}
        </span>
      </div>
      <p className="text-xl font-black text-white">{count}</p>
    </Button>
  );
}
