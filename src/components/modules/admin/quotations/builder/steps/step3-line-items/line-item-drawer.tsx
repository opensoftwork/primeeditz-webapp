/**
 * Line Item Drawer
 *
 * Slide-in drawer for adding/editing quotation line items.
 * Uses SectionPickerDrawer and ProjectPickerDrawer for selections.
 */

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Package,
  IndianRupee,
  Hash,
  FileText,
  Sparkles,
  Edit3,
  Loader2,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { NestedUnitSelector } from "@/components/ui/nested-unit-selector";
import { cn } from "@/lib/utils";
import { DEFAULT_UNIT } from "@/lib/constants/units";
import { SectionPickerDrawer } from "./section-picker-drawer";
import { ProjectPickerDrawer } from "./project-picker-drawer";
import type { QuotationLineItem, Section, Project } from "../../types";

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
  item?: QuotationLineItem | null;
  sections: Section[];
  defaultSectionId?: string;
  projects?: Project[];
  defaultProjectId?: string;
  onSave: (item: Omit<QuotationLineItem, "id">) => void;
  isSubmitting?: boolean;
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
}: LineItemDrawerProps) {
  const isEditing = !!item;

  // Form state
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [sectionId, setSectionId] = useState<string>("");
  const [projectId, setProjectId] = useState<string | undefined>(undefined);
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [rate, setRate] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

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
      } else {
        // Reset for new item
        setDescription("");
        setNotes("");
        setSectionId(defaultSectionId || sections[0]?._id || "");
        setProjectId(defaultProjectId);
        setUnit(DEFAULT_UNIT);
        setRate(0);
        setQuantity(1);
      }
    }
  }, [open, item, defaultSectionId, defaultProjectId, sections]);

  // Calculate total
  const calculatedTotal = useMemo(() => {
    return rate * quantity;
  }, [rate, quantity]);

  // Handle save
  const handleSave = () => {
    if (!description.trim()) return;

    onSave({
      sectionId: sectionId as any,
      projectId,
      description: description.trim(),
      unit,
      rate,
      quantity,
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

          {/* Project Association (if projects exist) */}
          {projects.length > 0 && (
            <Field>
              <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Associated Project
              </FieldLabel>
              <FieldContent>
                <ProjectPickerDrawer
                  projects={projects}
                  selectedProjectId={projectId}
                  onSelect={setProjectId}
                />
              </FieldContent>
            </Field>
          )}

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
                placeholder="Specifications, deliverables format, revisions included..."
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
                    value={rate || ""}
                    onChange={(e) => setRate(Number(e.target.value) || 0)}
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
                value={quantity || ""}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
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
              {quantity} {unit} × ₹{rate.toLocaleString()}
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
            disabled={!description.trim() || !sectionId || isSubmitting}
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
