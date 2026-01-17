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
  setTierToToggle: (val: null) => void;
  tierToDelete: { id: string; name: string } | null;
  setTierToDelete: (val: null) => void;
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
      {/* Deactivation Alert */}
      <AlertDialog
        open={!!tierToToggle}
        onOpenChange={() => setTierToToggle(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Verify Deactivation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to deactivate <span className="text-white">"{tierToToggle?.name}"</span>? 
              This will hide the plan from new quotations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:bg-white/10 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onToggleStatus}
              className="bg-amber-500 hover:bg-amber-600 text-black font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl transition-all"
            >
              Deactivate Plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Deletion Alert */}
      <AlertDialog
        open={!!tierToDelete}
        onOpenChange={() => setTierToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem] p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">
              Permanent Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              Are you sure you want to remove <span className="text-white">"{tierToDelete?.name}"</span>? 
              This action is permanent and cannot be reversed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl hover:bg-white/10 transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-xl transition-all"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
