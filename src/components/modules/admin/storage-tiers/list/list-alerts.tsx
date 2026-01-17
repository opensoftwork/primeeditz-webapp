"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ListAlertsProps {
  tierToToggle: { id: string; current: boolean; name: string } | null;
  setTierToToggle: (tier: { id: string; current: boolean; name: string } | null) => void;
  tierToDelete: { id: string; name: string } | null;
  setTierToDelete: (tier: { id: string; name: string } | null) => void;
  onToggleStatus: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ListAlerts({
  tierToToggle,
  setTierToToggle,
  tierToDelete,
  setTierToDelete,
  onToggleStatus,
  onDelete,
}: ListAlertsProps) {
  return (
    <>
      {/* Toggle Status Confirmation */}
      <AlertDialog
        open={!!tierToToggle}
        onOpenChange={() => setTierToToggle(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-white uppercase tracking-tight">
              {tierToToggle?.current ? "Deactivate Tier" : "Activate Tier"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              {tierToToggle?.current
                ? `Deactivating "${tierToToggle?.name}" will hide it from quotation selection. Existing projects with this tier will not be affected.`
                : `Activating this tier will make it available for selection in quotations.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white/40 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onToggleStatus}
              className={`rounded-xl font-black uppercase tracking-widest text-[10px] px-6 ${
                tierToToggle?.current
                  ? "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {tierToToggle?.current ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!tierToDelete}
        onOpenChange={() => setTierToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-white uppercase tracking-tight">
              Delete Storage Tier
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to permanently delete &quot;{tierToDelete?.name}&quot;?
              This action cannot be undone. Tiers in use by projects cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 text-white/40 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 font-black uppercase tracking-widest text-[10px] px-6"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
