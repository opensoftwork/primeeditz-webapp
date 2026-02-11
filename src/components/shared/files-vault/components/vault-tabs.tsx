"use client";

import { File, FileText, Image as ImageIcon, Video, Music } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { cn } from "@/lib/utils";
import type { FileTypeCounts, VaultTabType } from "../types";

interface VaultTabsProps {
  activeTab: VaultTabType;
  onTabChange: (tab: VaultTabType) => void;
  fileTypeCounts: FileTypeCounts;
  totalCount: number;
}

const TABS = [
  { id: "all" as const, label: "All Items", icon: File },
  { id: "image" as const, label: "Images", icon: ImageIcon },
  { id: "video" as const, label: "Videos", icon: Video },
  { id: "audio" as const, label: "Audio", icon: Music },
  { id: "document" as const, label: "Docs", icon: FileText },
];

export function VaultTabs({
  activeTab,
  onTabChange,
  fileTypeCounts,
  totalCount,
}: VaultTabsProps) {
  const getCount = (tabId: VaultTabType): number => {
    switch (tabId) {
      case "all":
        return totalCount;
      case "image":
        return fileTypeCounts.image;
      case "video":
        return fileTypeCounts.video;
      case "audio":
        return fileTypeCounts.audio;
      case "document":
        return fileTypeCounts.document;
      default:
        return 0;
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/2 border border-white/5 w-fit">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const count = getCount(tab.id);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300",
              isActive
                ? "bg-white/10 text-white shadow-lg"
                : "text-white/20 hover:text-white/40 hover:bg-white/5",
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeVaultTab"
                className="absolute inset-0 bg-white/10 rounded-xl"
                transition={{
                  type: "spring",
                  bounce: 0.2,
                  duration: 0.6,
                }}
              />
            )}
            <Icon className="h-3.5 w-3.5 relative z-10" />
            <span className="text-[10px] font-black uppercase tracking-widest relative z-10">
              {tab.label}
            </span>
            {count > 0 && (
              <span
                className={cn(
                  "text-[8px] font-bold px-1.5 py-0.5 rounded-md relative z-10",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/5 text-white/40",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
