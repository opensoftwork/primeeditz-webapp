/**
 * Existing Client Content Component
 * Content area shown when "Select Existing" option is selected
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientDataTable } from "@/components/modules/admin/clients/client-data-table";
import type { Doc } from "@convex/_generated/dataModel";
import type { Id } from "@convex/_generated/dataModel";

type Client = Doc<"profiles">;

interface ExistingClientContentProps {
  onCancel: () => void;
  onSelectClient: (client: Client) => void;
  selectedId?: Id<"profiles">;
}

export function ExistingClientContent({
  onCancel,
  onSelectClient,
  selectedId,
}: ExistingClientContentProps) {
  return (
    <div className="mt-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-black uppercase tracking-tight text-white">
            Select Existing Client
          </h3>
          <p className="text-sm text-white/40 font-medium">
            Choose a client from your existing database
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

      <div className="rounded-2xl bg-white/2 border border-white/5 overflow-hidden">
        <ClientDataTable onSelect={onSelectClient} selectedId={selectedId} />
      </div>
    </div>
  );
}
