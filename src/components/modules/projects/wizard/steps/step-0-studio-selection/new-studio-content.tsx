/**
 * New Studio Content Component
 * Content area shown when "Create New Studio" option is selected
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewStudioForm } from "./new-studio-form";

interface NewStudioContentProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function NewStudioContent({
  onCancel,
  onSuccess,
}: NewStudioContentProps) {
  return (
    <div className="mt-10 space-y-8 px-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Create New Studio
          </h3>
          <p className="text-sm text-white/40 font-medium">
            Enter the studio details below
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

      <NewStudioForm onSuccess={onSuccess} />
    </div>
  );
}
