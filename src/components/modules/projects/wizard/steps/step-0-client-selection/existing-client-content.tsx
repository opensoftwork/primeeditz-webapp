/**
 * Existing Client Content Component
 * Content area shown when "Select Existing" option is selected
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center">
                    Select Recipient <span className="text-primary ml-1.5">*</span>
                </Label>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white"
                >
                    <X className="h-3 w-3 mr-1.5" /> Cancel
                </Button>
            </div>

            <div className="p-1 rounded-3xl bg-white/2 border border-white/5">
                <div className="px-1 py-1">
                    <ClientDataTable
                        onSelect={onSelectClient}
                        selectedId={selectedId}
                    />
                </div>
            </div>
        </div>
    );
}
