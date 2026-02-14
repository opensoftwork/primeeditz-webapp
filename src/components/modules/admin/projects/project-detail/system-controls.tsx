"use client";

import {
  Eye,
  FolderTree,
  HardDrive,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SystemControlsProps {
  storageAllocated?: number;
  actionState: string;
  awaitingActorRole?: string;
  canSetupFolders?: boolean;
  hasFolders?: boolean;
  folderSetupReason?: string | null;
  onSetupFolders?: () => void;
  onViewFolders?: () => void;
  onViewTeam?: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 GB";
  const gb = bytes / (1024 * 1024 * 1024);
  return `${gb.toFixed(0)} GB`;
}

export function SystemControls({
  storageAllocated,
  actionState,
  awaitingActorRole,
  canSetupFolders = false,
  hasFolders = false,
  folderSetupReason,
  onSetupFolders,
  onViewFolders,
  onViewTeam,
}: SystemControlsProps) {
  const isAdminActive = awaitingActorRole === "admin";
  // Determine folder button state
  const showViewFolders = hasFolders;
  const showSetupFolders = !hasFolders && canSetupFolders && isAdminActive;

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

      {/* Storage Allocation Status */}
      {storageAllocated && storageAllocated > 0 && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                Storage Allocated
              </span>
            </div>
            <span className="text-sm font-black text-emerald-400">
              {formatBytes(storageAllocated)}
            </span>
          </div>
        </div>
      )}

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
            {(folderSetupReason || !isAdminActive) && (
              <p className="text-white/30 text-[9px] font-medium px-1">
                {!isAdminActive && !hasFolders
                  ? "Awaiting client interaction"
                  : folderSetupReason}
              </p>
            )}
          </div>
        )}
        <Button
          variant="outline"
          onClick={onViewTeam}
          className="w-full justify-between rounded-xl h-12 border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest group"
          disabled={["draft", "awaiting_quotation", "quotation_sent"].includes(
            actionState,
          )}
        >
          <span>VIEW TEAM</span>
          <Users className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>

      {!isAdminActive && (
        <div className="pt-2">
          <p className="text-[10px] font-bold text-amber-500/50 uppercase tracking-widest text-center leading-relaxed">
            SYSTEM LOCKED
            <br />
            WAITING FOR {awaitingActorRole?.toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
}
