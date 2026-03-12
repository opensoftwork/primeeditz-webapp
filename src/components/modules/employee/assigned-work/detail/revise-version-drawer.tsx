"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, X } from "lucide-react";
import { CorrectedUpload } from "./corrected-upload";

interface ReviseVersionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  deliverableId: string;
  deliverableName: string;
}

export function ReviseVersionDrawer({
  open,
  onOpenChange,
  projectId,
  deliverableId,
  deliverableName,
}: ReviseVersionDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-l border-white/10 h-full w-full sm:max-w-xl p-0 focus:outline-none rounded-l-4xl">
        <div className="h-full flex flex-col relative overflow-hidden">
          {/* CRT scanline effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] animate-scan" />

          <DrawerHeader className="p-8 pb-4 border-b border-white/5 relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  </div>
                  <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-white">
                    Revise Version
                  </DrawerTitle>
                </div>
                <DrawerDescription className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  Asset: {deliverableName} — Upload your corrected version for
                  review
                </DrawerDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-xl hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
            <div className="space-y-8">
              <div className="space-y-1">
                <h2 className="text-lg font-black uppercase tracking-tight text-white">
                  Action Required
                </h2>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">
                  Detailed correction upload and notes for this specific version
                  request.
                </p>
              </div>

              <CorrectedUpload
                projectId={projectId}
                parentDeliverableId={deliverableId}
                deliverableName={deliverableName}
              />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
