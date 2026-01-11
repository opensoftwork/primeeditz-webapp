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

interface DetailAlertsProps {
  fieldToDeactivate: string | null;
  setFieldToDeactivate: (id: string | null) => void;
  fieldToReactivate: string | null;
  setFieldToReactivate: (id: string | null) => void;
  fieldToHardDelete: string | null;
  setFieldToHardDelete: (id: string | null) => void;
  onConfirmToggleStatus: () => Promise<void>;
  onConfirmHardDelete: () => Promise<void>;
}

export function DetailAlerts({
  fieldToDeactivate,
  setFieldToDeactivate,
  fieldToReactivate,
  setFieldToReactivate,
  fieldToHardDelete,
  setFieldToHardDelete,
  onConfirmToggleStatus,
  onConfirmHardDelete,
}: DetailAlertsProps) {
  return (
    <>
      <AlertDialog
        open={!!fieldToDeactivate}
        onOpenChange={(open) => !open && setFieldToDeactivate(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-tight">
              Deactivate Field?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-medium">
              This will remove the field from the client wizard. You can
              reactivate it later from the configuration menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmToggleStatus}
              className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase tracking-widest text-[10px]"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!fieldToReactivate}
        onOpenChange={(open) => !open && setFieldToReactivate(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white uppercase font-black tracking-tight">
              Reactivate Field?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-medium">
              This will make the field visible again in the client onboarding
              wizard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmToggleStatus}
              className="bg-primary text-black hover:bg-primary/90 font-bold uppercase tracking-widest text-[10px]"
            >
              Reactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!fieldToHardDelete}
        onOpenChange={(open) => !open && setFieldToHardDelete(null)}
      >
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500 uppercase font-black tracking-tight">
              Permanent Deletion?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-medium">
              This action is{" "}
              <span className="text-red-500 font-bold">permanent</span> and
              cannot be undone. All configuration for this field will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmHardDelete}
              className="bg-red-600 text-white hover:bg-red-700 font-bold uppercase tracking-widest text-[10px]"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
