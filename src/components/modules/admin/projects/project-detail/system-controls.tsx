"use client";

import { Shield, Settings, Users, FolderTree, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemControlsProps {
  storageAllocated?: number;
  status: string;
  canSetupFolders?: boolean;
  hasFolders?: boolean;
  folderSetupReason?: string | null;
  onSetupFolders?: () => void;
  onViewFolders?: () => void;
}

export function SystemControls({
  storageAllocated,
  status,
  canSetupFolders = false,
  hasFolders = false,
  folderSetupReason,
  onSetupFolders,
  onViewFolders,
}: SystemControlsProps) {
  // Determine folder button state
  const showViewFolders = hasFolders;
  const showSetupFolders = !hasFolders && canSetupFolders;
  const disableSetupButton = !canSetupFolders && !hasFolders;

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
        {showViewFolders ? (
          <Button
            variant="outline"
            onClick={onViewFolders}
            className="w-full justify-between rounded-xl h-12 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-[10px] font-black uppercase tracking-widest group"
          >
            <span className="text-emerald-500">VIEW FOLDERS</span>
            <Eye className="h-4 w-4 text-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        ) : showSetupFolders ? (
          <Button
            variant="outline"
            onClick={onSetupFolders}
            className="w-full justify-between rounded-xl h-12 border-primary/20 bg-primary/5 hover:bg-primary/10 text-[10px] font-black uppercase tracking-widest group"
          >
            <span className="text-primary">SETUP FOLDERS</span>
            <FolderTree className="h-4 w-4 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
          </Button>
        ) : (
          <div className="space-y-2">
            <Button
              variant="outline"
              disabled
              className="w-full justify-between rounded-xl h-12 border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest group"
            >
              <span>SETUP FOLDERS</span>
              <Settings className="h-4 w-4 opacity-30" />
            </Button>
            {folderSetupReason && (
              <p className="text-white/30 text-[9px] font-medium px-1">
                {folderSetupReason}
              </p>
            )}
          </div>
        )}
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

