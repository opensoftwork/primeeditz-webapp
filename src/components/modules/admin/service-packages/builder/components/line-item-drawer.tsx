/**
 * Line Item Drawer
 *
 * Slide-in drawer for adding/editing service package line items.
 * Opens from the right side.
 */

"use client";

import {
  Edit3,
  Hash,
  IndianRupee,
  Package,
  Sparkles,
  Layers,
} from "lucide-react";
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
import { DEFAULT_UNIT } from "@/lib/constants/units";
import { cn } from "@/lib/utils";

// Currency formatter
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export interface LineItem {
  id: string;
  sectionId?: string;
  projectConfigId: string;
  description: string;
  unit: string;
  rate: number;
  quantity: number;
  subItems?: any[];
}

interface LineItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItem?: LineItem | null;
  projectConfigs: any[];
  onSave: (lineItem: LineItem) => void;
}

export function LineItemDrawer({
  open,
  onOpenChange,
  lineItem,
  projectConfigs,
  onSave,
}: LineItemDrawerProps) {
  const isEditing = !!lineItem;

  // Form state
  const [description, setDescription] = useState("");
  const [projectConfigId, setProjectConfigId] = useState("");
  const [unit, setUnit] = useState(DEFAULT_UNIT);
  const [rate, setRate] = useState<number | "">(0);
  const [quantity, setQuantity] = useState<number | "">(1);

  // Populate form when opening
  useEffect(() => {
    if (open) {
      if (lineItem) {
        setDescription(lineItem.description || "");
        setProjectConfigId(
          lineItem.projectConfigId || projectConfigs[0]?.id || "",
        );
        setUnit(lineItem.unit || DEFAULT_UNIT);
        setRate(lineItem.rate || 0);
        setQuantity(lineItem.quantity || 1);
      } else {
        setDescription("");
        setProjectConfigId(projectConfigs[0]?.id || "");
        setUnit(DEFAULT_UNIT);
        setRate(0);
        setQuantity(1);
      }
    }
  }, [open, lineItem, projectConfigs]);

  // Calculate subtotal
  const calculatedSubtotal = useMemo(() => {
    return (Number(rate) || 0) * (Number(quantity) || 0);
  }, [rate, quantity]);

  // Handle save
  const handleSave = () => {
    if (!description.trim()) return;

    onSave({
      id: lineItem?.id || crypto.randomUUID(),
      description: description.trim(),
      projectConfigId,
      unit,
      rate: Number(rate) || 0,
      quantity: Number(quantity) || 0,
      sectionId: lineItem?.sectionId,
      subItems: lineItem?.subItems || [],
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
                {isEditing ? "Edit Line Item" : "Add Line Item"}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-white/40">
                Configure your service offering and pricing
              </DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Item Description */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Package className="h-3 w-3" />
              Offering Description *
            </FieldLabel>
            <FieldContent>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Cinematic Wedding Film"
                className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white placeholder:text-white/20"
                autoFocus
              />
            </FieldContent>
          </Field>

          {/* Project Config Selection */}
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Layers className="h-3 w-3" />
              Project Configuration
            </FieldLabel>
            <FieldContent>
              <Select
                value={projectConfigId}
                onValueChange={setProjectConfigId}
              >
                <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl text-sm font-bold text-white/60">
                  <SelectValue placeholder="Select Configuration" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {projectConfigs.map((config) => (
                    <SelectItem
                      key={config.id}
                      value={config.id}
                      className="text-sm font-bold text-white/60 focus:bg-primary focus:text-black cursor-pointer"
                    >
                      {config.label || "Untitled"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Subtotal Preview */}
          <div
            className={cn(
              "p-5 rounded-2xl border transition-all duration-300",
              isEditing
                ? "bg-amber-500/5 border-amber-500/20 shadow-[0_4px_20px_rgba(245,158,11,0.05)]"
                : "bg-primary/5 border-primary/20 shadow-[0_4px_20px_rgba(var(--primary),0.05)]",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                Line Subtotal
              </span>
              <span
                className={cn(
                  "text-2xl font-black tracking-tighter tabular-nums",
                  isEditing ? "text-amber-500" : "text-primary",
                )}
              >
                {formatCurrency(calculatedSubtotal)}
              </span>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t border-white/5 pt-4 flex-row gap-3">
          <DrawerClose asChild>
            <Button
              variant="ghost"
              className="flex-1 h-11 rounded-xl text-white/40 hover:text-white font-bold uppercase tracking-wider text-[10px] transition-all"
            >
              Cancel
            </Button>
          </DrawerClose>
          <Button
            onClick={handleSave}
            disabled={!description.trim()}
            className={cn(
              "flex-1 h-11 rounded-xl font-black uppercase tracking-wider text-[10px] gap-2 transition-all active:scale-95 shadow-lg",
              isEditing
                ? "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/10"
                : "bg-primary hover:bg-primary/90 text-black shadow-primary/10",
            )}
          >
            {isEditing ? "Update Item" : "Add Line Item"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
