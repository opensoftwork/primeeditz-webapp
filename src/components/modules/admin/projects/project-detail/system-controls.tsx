"use client";

import { Shield, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemControlsProps {
  storageAllocated?: number;
  status: string;
}

export function SystemControls({
  storageAllocated,
  status,
}: SystemControlsProps) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 space-y-8">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40">
          <Shield className="h-5 w-5" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
          System Control
        </h3>
      </div>

      <div className="space-y-4">
        <Button
          variant="outline"
          className="w-full justify-between rounded-xl h-12 border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest group"
          disabled={!storageAllocated}
        >
          <span>SETUP FOLDERS</span>
          <Settings className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
        </Button>
        <Button
          variant="outline"
          className="w-full justify-between rounded-xl h-12 border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest group"
          disabled={status === "pending_review" || status === "draft"}
        >
          <span>ASSIGN TEAM</span>
          <Users className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>
    </div>
  );
}
