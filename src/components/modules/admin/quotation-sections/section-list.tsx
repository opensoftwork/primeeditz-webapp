"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ListFilter, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionCard } from "./section-card";
import { SectionDrawer, type SectionFormValues } from "./section-drawer";
import { Reorder } from "motion/react";
import { Section } from "./types";
import { Id } from "@convex/_generated/dataModel";
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

export function SectionList() {
  const sections = useQuery(
    api.functions.quotations.sections.queries.getSections,
    { activeOnly: false }
  );
  const createSection = useMutation(
    api.functions.quotations.sections.mutations.createSection
  );
  const updateSection = useMutation(
    api.functions.quotations.sections.mutations.updateSection
  );
  const reorderSections = useMutation(
    api.functions.quotations.sections.mutations.reorderSections
  );
  const deleteSection = useMutation(
    api.functions.quotations.sections.mutations.deleteSection
  );
  const toggleActive = useMutation(
    api.functions.quotations.sections.mutations.toggleSectionActive
  );

  const [localSections, setLocalSections] = useState<Section[]>([]);
  const isSyncingOrder = useRef(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (sections) {
      if (isSyncingOrder.current) {
        // Check if the current query result matches our local order
        const isMatch =
          sections.length === localSections.length &&
          sections.every(
            (s: Section, i: number) => s._id === localSections[i]?._id
          );
        if (isMatch) {
          isSyncingOrder.current = false;
        }
      } else {
        setLocalSections(sections as unknown as Section[]);
      }
    }
  }, [sections, localSections]);

  const handleReorder = (newOrder: Section[]) => {
    // 1. Update UI immediately for responsiveness
    setLocalSections(newOrder);
    isSyncingOrder.current = true;

    // 2. Debounce the server sync to avoid flooding mutations while dragging
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await reorderSections({
          orderedIds: newOrder.map((s) => s._id as Id<"quotationSections">),
        });
      } catch (error) {
        toast.error("Failed to update order");
        // Revert to server state on error
        if (sections) setLocalSections(sections as Section[]);
        isSyncingOrder.current = false;
      }
    }, 500);
  };

  const handleSave = async (values: SectionFormValues) => {
    try {
      const { isActive, ...data } = values;
      if (editingSection) {
        await updateSection({
          sectionId: editingSection._id as Id<"quotationSections">,
          isActive,
          ...data,
        });
        toast.success("Section updated successfully");
      } else {
        await createSection(data);
        toast.success("New section created");
      }
      setIsDrawerOpen(false);
    } catch (error) {
      toast.error("Failed to save section");
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await toggleActive({
        sectionId: id as Id<"quotationSections">,
      });
      toast.success(current ? "Section deactivated" : "Section activated");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSection({ sectionId: id as Id<"quotationSections"> });
      toast.success("Section deleted");
      setSectionToDelete(null);
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  if (sections === undefined) {
    return (
      <div className="space-y-4 p-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
              Quotation Sections
            </h1>
          </div>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
            Organize line items into logical groups for your quotations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setEditingSection(null);
              setIsDrawerOpen(true);
            }}
            className="bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] h-12 px-6 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Section
          </Button>
        </div>
      </div>

      {/* List */}
      {localSections.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 rounded-[2rem] border border-dashed border-white/10 bg-white/2 space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
            <ListFilter className="h-8 w-8 text-white/20" />
          </div>
          <div className="text-center">
            <h3 className="text-white font-bold uppercase tracking-tight">
              No sections found
            </h3>
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mt-1">
              Create your first section to get started
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setEditingSection(null);
              setIsDrawerOpen(true);
            }}
            className="text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/10"
          >
            Create First Section
          </Button>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          <Reorder.Group
            axis="y"
            values={localSections}
            onReorder={handleReorder}
            className="space-y-4"
          >
            {localSections.map((section) => (
              <SectionCard
                key={section._id}
                section={section}
                onEdit={(s) => {
                  setEditingSection(s);
                  setIsDrawerOpen(true);
                }}
                onToggleActive={handleToggleActive}
                onDelete={(id) => setSectionToDelete(id)}
              />
            ))}
          </Reorder.Group>
          <div className="flex items-center gap-2 px-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/10">
              Drag handle to reorder sections. Order persists automatically.
            </span>
          </div>
        </div>
      )}

      <SectionDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSave={handleSave}
        initialData={editingSection}
      />

      <AlertDialog
        open={!!sectionToDelete}
        onOpenChange={(open) => !open && setSectionToDelete(null)}
      >
        <AlertDialogContent className="bg-[#0A0A0B] border-white/10 rounded-[2rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-tight">
              Delete Section?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px]">
              This action cannot be undone. All data related to this section
              will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl hover:bg-white/10 hover:text-white transition-all">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sectionToDelete && handleDelete(sectionToDelete)}
              className="bg-red-500 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-xl shadow-xl shadow-red-500/20 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
