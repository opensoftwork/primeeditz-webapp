"use client";

import React from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCategoryLabel, getCategoryIcon } from "../utils";
import type { VaultTabType } from "../types";

interface VaultEmptyStateProps {
  activeTab: VaultTabType;
  onUploadClick?: () => void;
  hasUploadCapability: boolean;
}

export function VaultEmptyState({
  activeTab,
  onUploadClick,
  hasUploadCapability,
}: VaultEmptyStateProps) {
  const Icon = getCategoryIcon(activeTab);
  const categoryLabel = getCategoryLabel(activeTab);

  return (
    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-24">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150" />
        <div className="relative p-10 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
          <Icon className="h-14 w-14 text-white/20" />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          No {categoryLabel} Found
        </p>
        {activeTab !== "all" && (
          <p className="text-sm font-medium text-white/10 max-w-xs">
            Upload {categoryLabel.toLowerCase()} to see them here
          </p>
        )}
      </div>

      {hasUploadCapability && onUploadClick && (
        <Button
          variant="outline"
          onClick={onUploadClick}
          className="mt-4 h-12 px-6 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 text-primary font-black uppercase tracking-widest text-[10px] gap-2 transition-all"
        >
          <Upload className="h-4 w-4" />
          Upload {categoryLabel}
        </Button>
      )}
    </div>
  );
}
