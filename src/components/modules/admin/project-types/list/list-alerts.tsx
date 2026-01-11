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
  typeToToggle: { id: string; current: boolean } | null;
  setTypeToToggle: (val: { id: string; current: boolean } | null) => void;
  typeToDelete: { id: string; name: string } | null;
  setTypeToDelete: (val: { id: string; name: string } | null) => void;
  onToggleStatus: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function ListAlerts({
  typeToToggle,
  setTypeToToggle,
  typeToDelete,
  setTypeToDelete,
  onToggleStatus,
  onDelete,
}: ListAlertsProps) {
  return (
    <>
      <AlertDialog
        open={!!typeToToggle}
        onOpenChange={(open) => !open && setTypeToToggle(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-tight text-xl">
              Deactivate Project Type?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              This will hide the project type from the client dashboard. New
              projects of this type cannot be created until reactivated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onToggleStatus}
              className="bg-red-500 text-white hover:bg-red-600 font-black uppercase tracking-widest text-[10px] rounded-xl px-6"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!typeToDelete}
        onOpenChange={(open) => !open && setTypeToDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-tight text-xl">
              Delete Project Type?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] space-y-2">
              <p>
                You are about to permanently delete{" "}
                <span className="text-white">{typeToDelete?.name}</span>.
              </p>
              <p className="text-red-500/80">
                This action cannot be undone and will also delete all associated
                form fields.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white/40 hover:text-white rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-600 text-white hover:bg-red-700 font-black uppercase tracking-widest text-[10px] rounded-xl px-6"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
