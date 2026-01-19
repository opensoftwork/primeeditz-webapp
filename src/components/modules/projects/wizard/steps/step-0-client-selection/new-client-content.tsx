/**
 * New Client Content Component
 * Content area shown when "Create New Client" option is selected
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewClientForm } from "./new-client-form";

interface NewClientContentProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function NewClientContent({
  onCancel,
  onSuccess,
}: NewClientContentProps) {
  return (
    <div className="mt-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Create New Client
          </h3>
          <p className="text-sm text-white/40 font-medium">
            Enter the client details below
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
        >
          <X className="h-3 w-3 mr-1.5" /> Cancel
        </Button>
      </div>

      <NewClientForm onSuccess={onSuccess} />
    </div>
  );
}
