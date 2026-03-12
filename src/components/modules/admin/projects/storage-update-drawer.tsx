"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  HardDrive,
  Loader2,
  Plus,
  ArrowLeft,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface StorageUpdateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"projects">;
  currentStorageGB?: number;
  projectCode: string;
  projectName?: string;
}

export function StorageUpdateDrawer({
  open,
  onOpenChange,
  projectId,
  currentStorageGB = 0,
  projectCode,
  projectName,
}: StorageUpdateDrawerProps) {
  const [storageGB, setStorageGB] = useState<string>(
    currentStorageGB.toString(),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStorageGB(currentStorageGB.toString());
    }
  }, [open, currentStorageGB]);

  const updateStorage = useMutation(
    //@ts-ignore
    api.functions.projects.mutation.admin.updateStorageAllocation,
  );

  const handleUpdate = async () => {
    const bytes = parseFloat(storageGB) * 1024 * 1024 * 1024;
    if (isNaN(bytes) || bytes < 0) {
      toast.error("Please enter a valid storage amount");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateStorage({
        projectId,
        storageAllocated: bytes,
      });
      toast.success("Storage allocation updated successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating storage:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update storage",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-zinc-950/95 border-l border-white/10 w-full sm:max-w-md p-0 overflow-y-auto backdrop-blur-3xl ring-1 ring-white/10"
      >
        <div className="flex flex-col h-full relative z-10">
          {/* Decorative background glow */}
          <div className="absolute top-20 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />

          <SheetHeader className="text-left px-8 pt-12 pb-6 border-b border-white/5 space-y-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <HardDrive className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white leading-none">
                  Project Storage
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mt-2">
                  Update Allocation for {projectCode}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 px-8 py-8 space-y-10">
            {/* Project Context */}
            <div className="p-6 rounded-4xl bg-linear-to-br from-white/7 to-white/3 border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-linear-to-r from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative flex flex-col gap-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.25em]">
                      Active Project
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tight truncate">
                      {projectName || "Unnamed Project"}
                    </h3>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 shadow-inner shrink-0">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      {projectCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 px-1">
                <Plus className="h-4 w-4 text-emerald-500" />
                <label className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
                  Allocated Storage (GB)
                </label>
              </div>

              <div className="relative group">
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={storageGB}
                  onChange={(e) => setStorageGB(e.target.value)}
                  className="bg-white/3 border-white/5 rounded-2xl h-16 text-xl font-black text-white focus:border-emerald-500/30 focus:ring-0 transition-all pl-6"
                />

                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                  GB
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                <p className="text-[9px] text-blue-200/40 leading-relaxed uppercase tracking-[0.05em] font-bold">
                  This sets the maximum storage limit for client file uploads.
                  Standard projects usually range from 10GB to 100GB.
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="px-8 py-10 flex-row gap-4 border-t border-white/5 bg-zinc-950/50 backdrop-blur-xl">
            <SheetClose asChild>
              <Button
                variant="ghost"
                className="flex-1 rounded-2xl border border-white/5 h-14 uppercase font-black tracking-[0.2em] text-[10px] hover:bg-white/5 text-white/30 hover:text-white transition-all duration-300"
              >
                Cancel
              </Button>
            </SheetClose>
            <Button
              className={cn(
                "flex-1 rounded-2xl h-14 uppercase font-black tracking-[0.2em] text-[10px] transition-all duration-500 shadow-2xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-[0_10px_50px_rgba(16,185,129,0.15)]",
              )}
              onClick={handleUpdate}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Update Storage
                </div>
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
