/**
 * No Client Content Component
 * Content area shown when "No Client" option is selected
 */

"use client";

import { motion } from "motion/react";
import { FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface NoClientContentProps {
    onCancel: () => void;
}

export function NoClientContent({ onCancel }: NoClientContentProps) {
    return (
        <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center">
                    Internal Project <span className="text-amber-500 ml-1.5">*</span>
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

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-3xl bg-white/2 border border-white/5"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <FolderOpen className="h-8 w-8 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">No Client Association</h3>
                        <p className="text-sm text-white/40 font-medium mt-1 max-w-md">
                            Proceeding without a client association. This project will be treated as an internal account.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
