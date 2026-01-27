/**
 * Existing Studio Content Component
 * Content area shown when "Select Existing" option is selected
 */

"use client";

import type { Doc, Id } from "@convex/_generated/dataModel";
import { X } from "lucide-react";
import { StudioDataTable } from "@/components/modules/admin/studio";
import { Button } from "@/components/ui/button";

type Studio = Doc<"profiles">;

interface ExistingStudioContentProps {
  onCancel: () => void;
  onSelectStudio: (studio: Studio) => void;
  selectedId?: Id<"profiles">;
}

export function ExistingStudioContent({
  onCancel,
  onSelectStudio,
  selectedId,
}: ExistingStudioContentProps) {
  return (
    <div className="mt-10 space-y-8 px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Select Existing Studio
          </h3>
          <p className="text-sm text-white/40 font-medium">
            Choose a studio from your existing database
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <X className="h-4 w-4 mr-2" /> Cancel
        </Button>
      </div>

      <div className="rounded-2xl bg-white/2 border border-white/5 overflow-hidden">
        <StudioDataTable onSelect={onSelectStudio} selectedId={selectedId} />
      </div>
    </div>
  );
}
