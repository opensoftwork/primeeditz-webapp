"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Plus, ListOrdered, Palette, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionSheet } from "./section-sheet";
import { EditingSection } from "./types";

export function QuotationConfig() {
  const sections =
    useQuery(api.functions.quotations.sections.queries.getSections, {}) || [];

  const createSection = useMutation(
    api.functions.quotations.sections.mutations.createSection,
  );
  const updateSection = useMutation(
    api.functions.quotations.sections.mutations.updateSection,
  );
  const deleteSection = useMutation(
    api.functions.quotations.sections.mutations.deleteSection,
  );

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<EditingSection | null>(
    null,
  );

  const handleOpenCreate = () => {
    setEditingSection(null);
    setSheetOpen(true);
  };

  const handleOpenEdit = (section: any) => {
    setEditingSection({ id: section._id, data: section });
    setSheetOpen(true);
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteSection({ sectionId: id });
      toast.success("Section deleted successfully");
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Proposal Sections
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Define the structure of your proposal documents.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="h-10 rounded-xl bg-primary text-[10px] font-black uppercase tracking-widest text-primary-foreground gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center space-y-4 border border-dashed border-white/10 rounded-3xl bg-white/3">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <ListOrdered className="h-8 w-8 text-white/20" />
            </div>
            <div>
              <p className="text-lg font-bold text-white/60">
                No sections found
              </p>
              <p className="text-sm text-white/30">
                Create your first section to get started
              </p>
            </div>
          </div>
        ) : (
          sections.map((section: any) => (
            <div
              key={section._id}
              onClick={() => handleOpenEdit(section)}
              className={cn(
                "group relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer",
                "bg-white/3 border-white/5 hover:bg-white/5 hover:border-white/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1",
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -z-10",
                  `from-${section.color || "zinc"}-500/20 to-transparent`,
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110",
                      `bg-${section.color || "zinc"}-500/10 border-${section.color || "zinc"}-500/20 text-${section.color || "zinc"}-500`,
                    )}
                  >
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                      {section.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          "text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider",
                          `bg-${section.color || "zinc"}-500/10 text-${section.color || "zinc"}-400`,
                        )}
                      >
                        {section.color || "Default"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white/40 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(section);
                    }}
                  >
                    <GripVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <SectionSheet
        key={editingSection?.id ?? "new"}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={editingSection?.data}
        onSubmit={async (values) => {
          if (editingSection) {
            await updateSection({ sectionId: editingSection.id, ...values });
            toast.success("Section updated");
          } else {
            await createSection(values);
            toast.success("Section created");
          }
          setSheetOpen(false);
        }}
        onDelete={
          editingSection ? () => handleDelete(editingSection.id) : undefined
        }
      />
    </div>
  );
}
