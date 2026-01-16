/**
 * New Client Content Component
 * Content area shown when "Create New Client" option is selected
 */

"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NewClientForm } from "./new-client-form";

interface NewClientContentProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export function NewClientContent({ onCancel, onSuccess }: NewClientContentProps) {
    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center">
                    Create New Client <span className="text-primary ml-1.5">*</span>
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

            <div className="p-8 rounded-3xl bg-white/2 border border-white/5">
                <NewClientForm onSuccess={onSuccess} />
            </div>
        </div>
    );
}
