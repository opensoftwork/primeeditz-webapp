"use client";

import { X } from "lucide-react";
import { motion } from "motion/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FileTypeCounts, VaultTabType } from "../types";
import { formatFileSize } from "../utils";
import { VaultTabs } from "./vault-tabs";

interface VaultHeaderProps {
  title: string;
  subtitle?: string;
  filesCount: number;
  totalSize: number;
  primaryColor: string;
  activeTab: VaultTabType;
  onTabChange: (tab: VaultTabType) => void;
  fileTypeCounts: FileTypeCounts;
  showTabs: boolean;
  onClose: () => void;
}

export function VaultHeader({
  title,
  subtitle,
  filesCount,
  totalSize,
  primaryColor,
  activeTab,
  onTabChange,
  fileTypeCounts,
  showTabs,
  onClose,
}: VaultHeaderProps) {
  return (
    <div className="shrink-0 px-6 py-8 border-b border-white/5 relative overflow-hidden bg-white/2">
      <div
        className={cn(
          "absolute top-0 right-0 w-80 h-80 blur-[120px] rounded-full -mr-40 -mt-40 animate-pulse duration-5000",
          `bg-${primaryColor}/10`,
        )}
      />
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-size-[32px_32px]" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={cn(
                  "h-0.5 w-12 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]",
                  `bg-${primaryColor}`,
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.4em]",
                  `text-${primaryColor}/60`,
                )}
              >
                Vault Protocol
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white mb-2 leading-none">
              {title}
            </h2>
          </motion.div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/5 text-white/20 h-10 w-10 mt-[-20px] hover:text-white transition-all"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm font-semibold text-white/40 max-w-sm leading-relaxed mb-8">
          {subtitle ||
            `Managing ${filesCount} production asset${
              filesCount !== 1 ? "s" : ""
            } • ${formatFileSize(totalSize)}`}
        </p>

        {showTabs && (
          <VaultTabs
            activeTab={activeTab}
            onTabChange={onTabChange}
            fileTypeCounts={fileTypeCounts}
            totalCount={filesCount}
          />
        )}
      </div>
    </div>
  );
}
