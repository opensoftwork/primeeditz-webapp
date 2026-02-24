/**
 * Line Item Card for Service Package Builder
 *
 * Manages a single primary service offering and its nested sub-items.
 */

"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Plus,
  Settings2,
  Trash2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SubItemDrawer } from "../../../quotations/builder/steps/shared/sub-item-drawer";
import type { QuotationSubItem } from "../../../quotations/types";

interface LineItemCardProps {
  form: any;
  index: number;
  projectConfigs: any[];
  canRemove: boolean;
  onRemove: () => void;
}

export function LineItemCard({
  form,
  index,
  projectConfigs,
  canRemove,
  onRemove,
}: LineItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [subItemDrawerOpen, setSubItemDrawerOpen] = useState(false);
  const [editingSubItem, setEditingSubItem] = useState<{
    item: QuotationSubItem;
    parentIndices?: number[];
    level: number;
  } | null>(null);

  const handleAddSubItem = (level: number = 0, parentIndices?: number[]) => {
    setEditingSubItem(null);
    setSubItemDrawerOpen(true);
  };

  const handleEditSubItem = (
    sub: QuotationSubItem,
    level: number,
    parentIndices?: number[],
  ) => {
    setEditingSubItem({ item: sub, level, parentIndices });
    setSubItemDrawerOpen(true);
  };

  const handleSaveSubItem = (newSub: QuotationSubItem) => {
    const currentLineItem = form.getFieldValue(`lineItems[${index}]`);
    const subItems = [...(currentLineItem.subItems || [])];

    if (!editingSubItem) {
      // Add new
      subItems.push(newSub);
    } else {
      // Update existing
      const { level, parentIndices } = editingSubItem;
      if (level === 0) {
        const idx = subItems.findIndex((s) => s.id === newSub.id);
        if (idx !== -1) subItems[idx] = newSub;
      } else if (level === 1 && parentIndices) {
        const pIdx = parentIndices[0];
        const parentSub = { ...subItems[pIdx] };
        const sSubItems = [...(parentSub.subItems || [])];
        const sIdx = sSubItems.findIndex((s) => s.id === newSub.id);
        if (sIdx !== -1) sSubItems[sIdx] = newSub;
        parentSub.subItems = sSubItems;
        subItems[pIdx] = parentSub;
      }
    }

    form.setFieldValue(`lineItems[${index}].subItems`, subItems);
    setSubItemDrawerOpen(false);
  };

  const handleRemoveSubItem = (
    subId: string,
    level: number,
    parentIndices?: number[],
  ) => {
    const currentLineItem = form.getFieldValue(`lineItems[${index}]`);
    const subItems = [...(currentLineItem.subItems || [])];

    if (level === 0) {
      const filtered = subItems.filter((s) => s.id !== subId);
      form.setFieldValue(`lineItems[${index}].subItems`, filtered);
    } else if (level === 1 && parentIndices) {
      const pIdx = parentIndices[0];
      const parentSub = { ...subItems[pIdx] };
      const sSubItems = (parentSub.subItems || []).filter(
        (s: QuotationSubItem) => s.id !== subId,
      );
      parentSub.subItems = sSubItems;
      subItems[pIdx] = parentSub;
      form.setFieldValue(`lineItems[${index}].subItems`, subItems);
    }
  };

  const calculateTotal = (item: QuotationSubItem) => {
    const self = (Number(item.rate) || 0) * (Number(item.quantity) || 0);
    const subTotal = (item.subItems || []).reduce(
      (sum: number, sub: QuotationSubItem) => {
        const subSelf = (Number(sub.rate) || 0) * (Number(sub.quantity) || 0);
        const subSubTotal = (sub.subItems || []).reduce(
          (s: number, ss: QuotationSubItem) =>
            s + (Number(ss.rate) || 0) * (Number(ss.quantity) || 0),
          0,
        );
        return sum + subSelf + subSubTotal;
      },
      0,
    );
    return self + subTotal;
  };

  return (
    <div className="group relative bg-white/2 border border-white/5 rounded-[32px] overflow-hidden transition-all hover:bg-white/3 hover:border-white/10">
      {/* Card Header & Controls */}
      <div className="p-6 md:p-8 flex items-start gap-6">
        <div className="flex-1 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60">
                  Offering {index + 1}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-white uppercase tracking-tighter">
                    Service Configuration
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="h-10 w-10 rounded-xl bg-red-400/5 hover:bg-red-400/10 text-red-400/40 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Description */}
            <div className="md:col-span-12">
              <form.Field name={`lineItems[${index}].description`}>
                {(field: any) => (
                  <Field>
                    <FieldGroup>
                      <Input
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Premium Cinematic Wedding Edit"
                        className="bg-zinc-950/50 border-white/5 h-16 text-lg font-bold placeholder:text-white/10 rounded-2xl focus:border-primary/50 transition-all"
                      />
                    </FieldGroup>
                    <FieldError />
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Config Link */}
            <div className="md:col-span-4">
              <form.Field name={`lineItems[${index}].projectConfigId`}>
                {(field: any) => (
                  <Field>
                    <FieldLabel className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1 mb-2 block">
                      Associated Project Config
                    </FieldLabel>
                    <Select
                      value={field.state.value}
                      onValueChange={field.handleChange}
                    >
                      <SelectTrigger className="bg-zinc-950/50 border-white/5 h-12 rounded-xl text-xs font-bold font-mono">
                        <SelectValue placeholder="Select Config" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {projectConfigs.map((config) => (
                          <SelectItem
                            key={config.id}
                            value={config.id}
                            className="text-xs font-bold text-white/60 focus:bg-primary focus:text-black cursor-pointer"
                          >
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Unit */}
            <div className="md:col-span-2">
              <form.Field name={`lineItems[${index}].unit`}>
                {(field: any) => (
                  <Field>
                    <FieldLabel className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1 mb-2 block">
                      Unit
                    </FieldLabel>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="per project"
                      className="bg-zinc-950/50 border-white/5 h-12 rounded-xl text-xs font-bold"
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Quantity */}
            <div className="md:col-span-2">
              <form.Field name={`lineItems[${index}].quantity`}>
                {(field: any) => (
                  <Field>
                    <FieldLabel className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1 mb-2 block">
                      Qty
                    </FieldLabel>
                    <Input
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      className="bg-zinc-950/50 border-white/5 h-12 rounded-xl text-xs font-bold font-mono"
                    />
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Rate */}
            <div className="md:col-span-2">
              <form.Field name={`lineItems[${index}].rate`}>
                {(field: any) => (
                  <Field>
                    <FieldLabel className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1 mb-2 block">
                      Rate
                    </FieldLabel>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-black">
                        ₹
                      </span>
                      <Input
                        type="number"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(Number(e.target.value))
                        }
                        className="bg-zinc-950/50 border-white/5 h-12 pl-8 rounded-xl text-xs font-bold font-mono"
                      />
                    </div>
                  </Field>
                )}
              </form.Field>
            </div>

            {/* Item Total */}
            <div className="md:col-span-2">
              <Field>
                <FieldLabel className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-1 mb-2 block">
                  Subtotal
                </FieldLabel>
                <form.Subscribe
                  selector={(state: any) => state.values.lineItems[index]}
                >
                  {(lineItem: any) => (
                    <div className="h-12 flex items-center justify-end px-4 bg-primary/5 border border-primary/20 rounded-xl">
                      <span className="text-sm font-black text-primary font-mono">
                        ₹{calculateTotal(lineItem || {}).toLocaleString()}
                      </span>
                    </div>
                  )}
                </form.Subscribe>
              </Field>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Sub-items View */}
      {isExpanded && (
        <div className="border-t border-white/5 bg-white/1 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Service Breakdown & Sub-items
              </h5>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddSubItem()}
              className="h-8 rounded-lg bg-white/5 border-white/5 hover:bg-primary hover:text-black transition-all text-[9px] font-black uppercase tracking-widest px-3 gap-2"
            >
              <Plus className="h-3 w-3" />
              Add Sub-Item
            </Button>
          </div>

          <form.Subscribe
            selector={(state: any) => state.values.lineItems[index]?.subItems}
          >
            {(subItems: QuotationSubItem[] = []) => (
              <div className="space-y-3">
                {subItems.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[24px] bg-white/1">
                    <Layers className="h-6 w-6 text-white/5 mb-2" />
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      No nested items configured
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subItems.map((sub, sIdx) => (
                      <div key={sub.id} className="space-y-3">
                        <SubItemRow
                          sub={sub}
                          level={1}
                          index={`${index + 1}.${sIdx + 1}`}
                          onEdit={() => handleEditSubItem(sub, 0)}
                          onRemove={() => handleRemoveSubItem(sub.id, 0)}
                          onAddChild={() => handleAddSubItem(1, [sIdx])}
                        />

                        {(sub.subItems || []).map((ssub, ssIdx) => (
                          <SubItemRow
                            key={ssub.id}
                            sub={ssub}
                            level={2}
                            index={`${index + 1}.${sIdx + 1}.${ssIdx + 1}`}
                            onEdit={() => handleEditSubItem(ssub, 1, [sIdx])}
                            onRemove={() =>
                              handleRemoveSubItem(ssub.id, 1, [sIdx])
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form.Subscribe>
        </div>
      )}

      {/* Sub-item Drawer */}
      <SubItemDrawer
        open={subItemDrawerOpen}
        onOpenChange={setSubItemDrawerOpen}
        onSave={handleSaveSubItem}
        subItem={editingSubItem?.item}
        isLevel3={editingSubItem?.level === 1}
      />
    </div>
  );
}

function SubItemRow({
  sub,
  level,
  index,
  onEdit,
  onRemove,
  onAddChild,
}: {
  sub: QuotationSubItem;
  level: number;
  index: string;
  onEdit: () => void;
  onRemove: () => void;
  onAddChild?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 p-3 rounded-2xl group/row transition-all",
        level === 1
          ? "bg-white/5 border border-white/5"
          : "bg-white/2 ml-8 border border-white/5",
      )}
    >
      <div className="w-10 text-center text-[9px] font-black text-white/20 font-mono">
        {index}
      </div>

      <div className="flex-1 flex items-center gap-4">
        {level === 2 && (
          <span className="text-white/10 font-light translate-y-[-2px]">└</span>
        )}
        <div className="flex flex-col">
          <span
            className={cn(
              "text-xs font-bold uppercase tracking-tight",
              level === 1 ? "text-white/80" : "text-white/40 italic",
            )}
          >
            {sub.description}
          </span>
          <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em] mt-0.5">
            {sub.quantity} {sub.unit} @ ₹{sub.rate.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 px-4 border-l border-white/5">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-white font-mono">
            ₹{(sub.rate * sub.quantity).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
          {level === 1 && onAddChild && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onAddChild}
              className="h-8 w-8 rounded-lg hover:bg-primary/20 text-primary"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
          >
            <Settings2 className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 rounded-lg hover:bg-red-400/20 text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
