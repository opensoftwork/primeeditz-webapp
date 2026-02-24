/**
 * Sub Item Drawer
 *
 * Slide-in drawer for adding/editing quotation sub-items.
 * Sub-items are simpler than primary line items and inherit section/project from parent.
 */

"use client";

import { Edit3, Hash, IndianRupee, Package, Sparkles } from "lucide-react";
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
import { DEFAULT_UNIT } from "@/lib/constants/units";
import { cn } from "@/lib/utils";
import type { QuotationSubItem } from "../../types";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

interface SubItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subItem?: QuotationSubItem | null;
  parentName?: string;
  onSave: (subItem: QuotationSubItem) => void;
  isLevel3?: boolean; // If true, this sub-item cannot have further children
}

export function SubItemDrawer({
  open,
  onOpenChange,
  subItem,
  parentName,
  onSave,
  isLevel3 = false,
}: SubItemDrawerProps) {
  const isEditing = !!subItem;

  // Form state
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [rate, setRate] = useState<number | "">(0);
  const [quantity, setQuantity] = useState<number | "">(1);

  // Populate form when opening
  useEffect(() => {
    if (open) {
      if (subItem) {
        setDescription(subItem.description || "");
        setUnit(subItem.unit || DEFAULT_UNIT);
        setRate(subItem.rate || 0);
        setQuantity(subItem.quantity || 1);
      } else {
        setDescription("");
        setUnit(DEFAULT_UNIT);
        setRate(0);
        setQuantity(1);
      }
    }
  }, [open, subItem]);

  // Calculate total
  const calculatedTotal = useMemo(() => {
    return (Number(rate) || 0) * (Number(quantity) || 0);
  }, [rate, quantity]);

  // Handle save
  const handleSave = () => {
    if (!description.trim()) return;

    onSave({
      id: subItem?.id || crypto.randomUUID(),
      description: description.trim(),
      unit,
      rate: Number(rate) || 0,
      quantity: Number(quantity) || 0,
      subItems: subItem?.subItems || [],
    });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full w-full max-w-sm ml-auto rounded-none border-l border-white/10 bg-zinc-950">
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
                {isEditing ? "Edit Sub-Item" : "Add Sub-Item"}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-white/40">
                {isLevel3
                  ? "Deep-level breakdown item"
                  : "Breakdown for " + (parentName || "parent item")}
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Sub-Item Description */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Package className="h-3 w-3" />
              Sub-Item Description *
            </FieldLabel>
            <FieldContent>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Color Grading"
                className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-medium text-white placeholder:text-white/20"
                autoFocus
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
                Item Total
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
          </div>
        </div>

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
            disabled={!description.trim()}
            className={cn(
              "flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-[10px] gap-2",
              isEditing
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-primary hover:bg-primary/90 text-black",
            )}
          >
            {isEditing ? "Update" : "Add Sub-Item"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
