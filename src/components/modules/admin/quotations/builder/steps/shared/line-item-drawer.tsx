/**
 * Line Item Drawer
 *
 * Slide-in drawer for adding/editing quotation line items.
 * Uses SectionPickerDrawer and ProjectPickerDrawer for selections.
 */

"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Edit3,
  FileText,
  Folders,
  Hash,
  IndianRupee,
  Loader2,
  Package,
  Rocket,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NestedUnitSelector } from "@/components/ui/nested-unit-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_UNIT } from "@/lib/constants/units";
import { cn } from "@/lib/utils";
import type { Project, QuotationLineItem, Section } from "../../types";
import { ProjectPickerDrawer } from "./project-picker-drawer";
import { SectionPickerDrawer } from "./section-picker-drawer";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface LineItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: (QuotationLineItem & { originalIdx?: number }) | null;
  sections: Section[];
  defaultSectionId?: string;
  projects?: Project[];
  defaultProjectId?: string;
  onSave: (item: Omit<QuotationLineItem, "id">) => void;
  isSubmitting?: boolean;
  /** If true, project selection is mandatory before adding items */
  requireProject?: boolean;
}

export function LineItemDrawer({
  open,
  onOpenChange,
  item,
  sections,
  defaultSectionId,
  projects = [],
  defaultProjectId,
  onSave,
  isSubmitting = false,
  requireProject = false,
}: LineItemDrawerProps) {
  const isEditing = !!item;

  // Form state
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [rate, setRate] = useState<number | "">(0);
  const [quantity, setQuantity] = useState<number | "">(1);

  // Project Spawning state
  const [spawnsProject, setSpawnsProject] = useState(false);
  const [projectTypeId, setProjectTypeId] = useState<
    Id<"projectTypes"> | undefined
  >(undefined);
  const [selectedFolderTemplateId, setSelectedFolderTemplateId] = useState<
    Id<"folderTemplates"> | undefined
  >(undefined);

  // Queries
  const activeProjectTypes = useQuery(
    api.functions.projectTypes.queries.getActiveProjectTypes,
  );
  const folderTemplates = useQuery(
    api.functions.folderTemplates.queries.getFolderTemplates,
    { activeOnly: true },
  );

  const filteredFolderTemplates = useMemo(() => {
    if (!projectTypeId || !folderTemplates) return [];
    return folderTemplates.filter((t) => t.projectTypeId === projectTypeId);
  }, [projectTypeId, folderTemplates]);

  // Populate form when opening
  useEffect(() => {
    if (open) {
      if (item) {
        setDescription(item.description || "");
        setNotes("");
        setSectionId(item.sectionId || defaultSectionId || "");
        setProjectId(item.projectId);
        setUnit(item.unit || DEFAULT_UNIT);
        setRate(item.rate || 0);
        setQuantity(item.quantity || 1);
        setSpawnsProject(!!item.spawnsProject);
        setProjectTypeId(item.projectTypeId as Id<"projectTypes">);
        setSelectedFolderTemplateId(
          item.selectedFolderTemplateId as Id<"folderTemplates">,
        );
      } else {
        // Reset for new item
        setDescription("");
        setNotes("");
        setSectionId(defaultSectionId || sections[0]?._id || "");
        setProjectId(defaultProjectId);
        setUnit(DEFAULT_UNIT);
        setRate(0);
        setQuantity(1);
        setSpawnsProject(false);
        setProjectTypeId(undefined);
        setSelectedFolderTemplateId(undefined);
      }
    }
  }, [open, item, defaultSectionId, defaultProjectId, sections]);

  // Calculate total
  const calculatedTotal = useMemo(() => {
    return (Number(rate) || 0) * (Number(quantity) || 0);
  }, [rate, quantity]);

  // Handle save
  const handleSave = () => {
    if (!description.trim()) return;

    onSave({
      sectionId: sectionId as Id<"quotationSections">,
      projectId,
      description: description.trim(),
      unit,
      rate: Number(rate) || 0,
      quantity: Number(quantity) || 0,
      spawnsProject,
      projectTypeId,
      selectedFolderTemplateId,
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-md ml-auto rounded-none border-l border-white/10 bg-zinc-950">
        {/* Header */}
        <DrawerHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center border",
                isEditing
                  ? "bg-amber-500/10 border-amber-500/20"
                  : "bg-primary/10 border-primary/20",
              )}
            >
              {isEditing ? (
                <Edit3 className="h-5 w-5 text-amber-500" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <DrawerTitle className="text-lg font-black uppercase tracking-tight text-white">
                {isEditing ? "Edit Item" : "Add Line Item"}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-white/40">
                {isEditing
                  ? "Update the details for this item"
                  : "Add a new service or deliverable"}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section Selector */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              Section *
            </FieldLabel>
            <FieldContent>
              <SectionPickerDrawer
                sections={sections}
                selectedSectionId={sectionId}
                onSelect={setSectionId}
              />
            </FieldContent>
          </Field>

          {/* Project Association */}
          {projects && projects.length > 0 && (
            <Field>
              <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Associated Project {requireProject && "*"}
              </FieldLabel>
              <FieldContent>
                <ProjectPickerDrawer
                  projects={projects}
                  selectedProjectId={projectId}
                  onSelect={setProjectId}
                />
                {requireProject && !projectId && (
                  <p className="text-[10px] text-amber-500/80 mt-1 font-medium">
                    Please select a project before adding items
                  </p>
                )}
              </FieldContent>
            </Field>
          )}

          {/* Project Spawning Configuration (Story 11B.1 & 11B.2) */}
          <div className="p-4 rounded-2xl bg-white/3 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                  <Rocket className="h-3 w-3" />
                  Project Spawning
                </FieldLabel>
                <p className="text-[10px] text-white/20">
                  Create new project on approval
                </p>
              </div>
              <Switch
                checked={spawnsProject}
                onCheckedChange={setSpawnsProject}
              />
            </div>

            {spawnsProject && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4 pt-2 border-t border-white/5"
              >
                {/* Project Type Selector */}
                <Field>
                  <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2">
                    Project Type
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={projectTypeId || ""}
                      onValueChange={(val) => {
                        setProjectTypeId(val as Id<"projectTypes">);
                        // Auto-select default folder template if available
                        const defaultTpl = folderTemplates?.find(
                          (t) => t.projectTypeId === val && t.isDefault,
                        );
                        if (defaultTpl)
                          setSelectedFolderTemplateId(defaultTpl._id);
                      }}
                    >
                      <SelectTrigger className="h-11 bg-white/5 border-none rounded-xl text-[11px] font-bold text-white">
                        <SelectValue placeholder="Select Project Type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {activeProjectTypes?.map((t) => (
                          <SelectItem
                            key={t._id}
                            value={t._id}
                            className="text-[11px] font-bold"
                          >
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Folder Template Selector (Story 11B.2) */}
                <Field>
                  <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2 flex items-center gap-1.5">
                    <Folders className="h-3 w-3" /> Folder Template
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={selectedFolderTemplateId || ""}
                      onValueChange={(val) =>
                        setSelectedFolderTemplateId(
                          val as Id<"folderTemplates">,
                        )
                      }
                    >
                      <SelectTrigger className="h-11 bg-white/5 border-none rounded-xl text-[11px] font-bold text-white">
                        <SelectValue placeholder="Select Folder Template..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {filteredFolderTemplates.map((t) => {
                          const variantLabel = t.variant
                            ? ` (${t.variant})`
                            : "";
                          return (
                            <SelectItem
                              key={t._id}
                              value={t._id}
                              className="text-[11px] font-bold"
                            >
                              {t.name}
                              {variantLabel}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </motion.div>
            )}
          </div>

          {/* Item Description */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Package className="h-3 w-3" />
              Service / Deliverable *
            </FieldLabel>
            <FieldContent>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Wedding Highlight Video Editing"
                className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-white/20"
              />
            </FieldContent>
          </Field>

          {/* Notes (optional) */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <FileText className="h-3 w-3" />
              Notes
              <span className="text-white/20 font-normal">(optional)</span>
            </FieldLabel>
            <FieldContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specifications, deliverables format, versions included..."
                className="min-h-[70px] bg-white/5 border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 resize-none"
              />
            </FieldContent>
          </Field>

          {/* Unit & Rate Row */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Unit
              </FieldLabel>
              <FieldContent>
                <NestedUnitSelector
                  value={unit}
                  onValueChange={setUnit}
                  triggerClassName="h-11 w-full bg-white/5 border-white/10 rounded-xl"
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                <IndianRupee className="h-3 w-3" />
                Rate
              </FieldLabel>
              <FieldContent>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">
                    ₹
                  </span>
                  <Input
                    type="number"
                    value={rate}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const val = e.target.value;
                      const cleanValue = val.replace(/^0+(?=\d)/, "");
                      setRate(cleanValue === "" ? "" : Number(cleanValue));
                    }}
                    placeholder="0"
                    className="h-11 pl-7 bg-white/5 border-white/10 rounded-xl text-sm font-mono font-bold text-white text-right pr-3"
                  />
                </div>
              </FieldContent>
            </Field>
          </div>

          {/* Quantity */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Hash className="h-3 w-3" />
              Quantity
            </FieldLabel>
            <FieldContent>
              <Input
                type="number"
                value={quantity}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const val = e.target.value;
                  const cleanValue = val.replace(/^0+(?=\d)/, "");
                  setQuantity(cleanValue === "" ? "" : Number(cleanValue));
                }}
                placeholder="1"
                min="1"
                className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white text-center"
              />
            </FieldContent>
          </Field>

          {/* Total Preview */}
          <div
            className={cn(
              "p-4 rounded-xl border",
              isEditing
                ? "bg-amber-500/5 border-amber-500/20"
                : "bg-primary/5 border-primary/20",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                Estimated Total
              </span>
              <span
                className={cn(
                  "text-2xl font-black tracking-tight",
                  isEditing ? "text-amber-500" : "text-primary",
                )}
              >
                {formatCurrency(calculatedTotal)}
              </span>
            </div>
            <p className="text-[10px] text-white/30 mt-1">
              {quantity} {unit} × ₹{(Number(rate) || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-white/5 pt-4 flex-row gap-3">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="flex-1 h-11 rounded-xl text-white/40 hover:text-white font-bold uppercase tracking-wider text-[10px]"
            >
              Cancel
            </Button>
          </DrawerClose>
          <Button
            onClick={handleSave}
            disabled={
              !description.trim() ||
              !sectionId ||
              isSubmitting ||
              (requireProject && !projectId) ||
              (spawnsProject && !projectTypeId)
            }
            className={cn(
              "flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-[10px] gap-2",
              isEditing
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-primary hover:bg-primary/90",
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Adding..."}
              </>
            ) : (
              <>
                {isEditing ? (
                  <Edit3 className="h-4 w-4" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                {isEditing ? "Save Changes" : "Add Item"}
              </>
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
