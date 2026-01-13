"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash2,
  Layers,
  Hash,
  Coins,
  ChevronDown,
  Package,
} from "lucide-react";
import {
  Section,
  TemplateLineItem as LineItemData,
} from "../quotation-sections/types";

// Re-export LineItemData for convenience as it was previously defined here
export type { LineItemData };

interface LineItemsBuilderProps {
  lineItems: LineItemData[];
  onChange: (items: LineItemData[]) => void;
  sections: Section[];
}

const UNIT_OPTIONS = [
  { value: "ls", label: "Lump Sum" },
  { value: "hr", label: "Hour" },
  { value: "min", label: "Minute" },
  { value: "day", label: "Day" },
  { value: "sqft", label: "Sq Ft" },
  { value: "page", label: "Page" },
  { value: "unit", label: "Unit" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LineItemsBuilder({
  lineItems,
  onChange,
  sections,
}: LineItemsBuilderProps) {
  const addItem = (sectionId: string) => {
    onChange([
      ...lineItems,
      {
        sectionId,
        description: "",
        unit: "ls",
        unitPrice: 0,
        defaultQuantity: 1,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof LineItemData,
    value: string | number
  ) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value } as LineItemData;
    onChange(updated);
  };

  const removeItem = (index: number) => {
    onChange(lineItems.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-1 bg-primary/40 rounded-full" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Line Item Framework
          </h4>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-10 px-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 rounded-xl transition-all shadow-lg hover:shadow-primary/5 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Categorical Addition
              <ChevronDown className="h-3.5 w-3.5 ml-2 opacity-40 group-hover:opacity-100 transition-opacity" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 bg-zinc-900/95 backdrop-blur-3xl border-white/10 text-white p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t border-white/20">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 px-3 py-3 mb-1">
              Architecture Segments
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5 mx-2" />
            <div className="space-y-1 mt-1">
              {sections.map((section) => (
                <DropdownMenuItem
                  key={section._id}
                  onClick={() => addItem(section._id)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl focus:bg-primary/20 focus:text-white cursor-pointer transition-colors group"
                >
                  <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary group-hover:scale-125 transition-all" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {section.name}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
            {sections.length === 0 && (
              <div className="px-4 py-8 text-center italic">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                  System architectural categories not yet defined
                </p>
              </div>
            )}
            <DropdownMenuSeparator className="bg-white/5 mx-2 my-2" />
            <DropdownMenuItem className="flex items-center gap-3 px-3 py-3 rounded-xl opacity-20 grayscale pointer-events-none mb-1">
              <Package className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Component Library
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {lineItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-16 rounded-2xl border border-dashed border-white/5 bg-white/1 flex flex-col items-center justify-center space-y-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/5 blur-[30px] rounded-full" />
            <div className="relative h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center">
              <Layers className="h-6 w-6 text-white/5" />
            </div>
          </div>
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em] text-center max-w-[200px] leading-relaxed">
            Awaiting structural definition. Select a category to begin.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {lineItems.map((item, index) => {
              const itemTotal = item.unitPrice * item.defaultQuantity;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="group relative p-6 rounded-2xl bg-white/2 border-white/5 hover:bg-white/4 hover:border-white/10 transition-all shadow-2xl shadow-black/40"
                >
                  <div className="absolute -left-px top-6 bottom-6 w-1 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col gap-6">
                    {/* Primary Info */}
                    <div className="flex flex-col xl:flex-row gap-6">
                      <div className="w-full xl:w-72 shrink-0">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block ml-1">
                          Operational Category
                        </Label>
                        <Select
                          value={item.sectionId}
                          onValueChange={(v) =>
                            updateItem(index, "sectionId", v)
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/5 text-white h-12 rounded-xl text-[11px] font-bold px-4 focus:ring-1 focus:ring-primary/30 transition-all hover:bg-white/8 hover:border-white/10">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/10 text-white rounded-xl shadow-2xl">
                            {sections.map((s) => (
                              <SelectItem
                                key={s._id}
                                value={s._id}
                                className="text-[10px] font-bold uppercase tracking-wider focus:bg-primary/20 focus:text-white py-2.5"
                              >
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex-1">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block ml-1">
                          Product / Service Identification
                        </Label>
                        <Input
                          placeholder="e.g., Master Narrative Architecture"
                          value={item.description}
                          onChange={(e) =>
                            updateItem(index, "description", e.target.value)
                          }
                          className="bg-white/5 border-white/5 text-white h-12 rounded-xl text-sm font-semibold px-4 focus:ring-1 focus:ring-primary/30 transition-all hover:bg-white/8 hover:border-white/10"
                        />
                      </div>
                    </div>

                    {/* Financial Metrics */}
                    <div className="flex flex-wrap items-end gap-6 pt-6 border-t border-white/5">
                      <div className="w-40 shrink-0">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block ml-1">
                          Unit Metrics
                        </Label>
                        <Select
                          value={item.unit}
                          onValueChange={(v) => updateItem(index, "unit", v)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/5 text-white h-12 rounded-xl text-[11px] font-bold px-4 transition-all hover:bg-white/8 hover:border-white/10">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/10 text-white rounded-xl shadow-2xl">
                            {UNIT_OPTIONS.map((opt) => (
                              <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-[10px] font-bold uppercase tracking-wider focus:bg-primary/20 focus:text-white py-2.5"
                              >
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-40">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block ml-1">
                          Base Rate
                        </Label>
                        <div className="relative group/input">
                          <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 group-focus-within/input:text-primary transition-colors" />
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.unitPrice || ""}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="pl-10 bg-white/5 border-white/5 text-white h-12 rounded-xl text-sm font-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all hover:bg-white/8 hover:border-white/10"
                          />
                        </div>
                      </div>

                      <div className="w-28">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-3 block ml-1">
                          Target Qty
                        </Label>
                        <div className="relative group/input">
                          <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 group-focus-within/input:text-primary transition-colors" />
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.defaultQuantity || ""}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "defaultQuantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="pl-10 bg-white/5 border-white/5 text-white h-12 rounded-xl text-sm font-black text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all hover:bg-white/8 hover:border-white/10"
                          />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col items-end gap-1 px-4 min-w-[140px]">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
                          Valuation
                        </span>
                        <span className="text-2xl font-black text-white tracking-tighter drop-shadow-lg">
                          {formatCurrency(
                            itemTotal +
                              (item.subItems?.reduce(
                                (s, sub) =>
                                  s + sub.unitPrice * sub.defaultQuantity,
                                0
                              ) ?? 0)
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const updated = [...lineItems];
                            const currentSubItems =
                              updated[index].subItems ?? [];
                            updated[index] = {
                              ...updated[index],
                              subItems: [
                                ...currentSubItems,
                                {
                                  description: "",
                                  unit: "ls",
                                  unitPrice: 0,
                                  defaultQuantity: 1,
                                },
                              ],
                            };
                            onChange(updated);
                          }}
                          className="h-12 px-4 text-primary/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Add Segment
                          </span>
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          className="h-12 w-12 text-red-500/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Sub Items Section */}
                    {item.subItems && item.subItems.length > 0 && (
                      <div className="ml-12 pl-12 border-l border-white/5 space-y-4 pt-2 pb-2">
                        <AnimatePresence initial={false}>
                          {item.subItems.map((sub, sIdx) => (
                            <motion.div
                              key={sIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center gap-4 bg-white/2 p-4 rounded-xl border border-white/5 relative group/sub"
                            >
                              <div className="absolute -left-12 top-1/2 w-12 h-px bg-white/5" />

                              <div className="flex-1">
                                <Input
                                  placeholder="Sub-component description"
                                  value={sub.description}
                                  onChange={(e) => {
                                    const updated = [...lineItems];
                                    const newSubs = [
                                      ...(updated[index].subItems || []),
                                    ];
                                    newSubs[sIdx] = {
                                      ...newSubs[sIdx],
                                      description: e.target.value,
                                    };
                                    updated[index] = {
                                      ...updated[index],
                                      subItems: newSubs,
                                    };
                                    onChange(updated);
                                  }}
                                  className="bg-transparent border-none text-white h-9 text-xs font-bold p-0 focus:ring-0 placeholder:text-white/10"
                                />
                              </div>

                              <div className="flex items-center gap-3">
                                <Input
                                  type="number"
                                  placeholder="Rate"
                                  value={sub.unitPrice || ""}
                                  onChange={(e) => {
                                    const updated = [...lineItems];
                                    const newSubs = [
                                      ...(updated[index].subItems || []),
                                    ];
                                    newSubs[sIdx] = {
                                      ...newSubs[sIdx],
                                      unitPrice:
                                        parseFloat(e.target.value) || 0,
                                    };
                                    updated[index] = {
                                      ...updated[index],
                                      subItems: newSubs,
                                    };
                                    onChange(updated);
                                  }}
                                  className="w-24 bg-white/3 border-white/5 h-8 text-[10px] font-black text-center rounded-lg focus:ring-1 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <Input
                                  type="number"
                                  placeholder="Qty"
                                  value={sub.defaultQuantity || ""}
                                  onChange={(e) => {
                                    const updated = [...lineItems];
                                    const newSubs = [
                                      ...(updated[index].subItems || []),
                                    ];
                                    newSubs[sIdx] = {
                                      ...newSubs[sIdx],
                                      defaultQuantity:
                                        parseFloat(e.target.value) || 1,
                                    };
                                    updated[index] = {
                                      ...updated[index],
                                      subItems: newSubs,
                                    };
                                    onChange(updated);
                                  }}
                                  className="w-16 bg-white/3 border-white/5 h-8 text-[10px] font-black text-center rounded-lg focus:ring-1 focus:ring-primary/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <div className="w-24 text-right">
                                  <span className="text-[10px] font-black text-white/40 tracking-tight">
                                    {formatCurrency(
                                      sub.unitPrice * sub.defaultQuantity
                                    )}
                                  </span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const updated = [...lineItems];
                                    const newSubs = (
                                      updated[index].subItems || []
                                    ).filter((_, i) => i !== sIdx);
                                    updated[index] = {
                                      ...updated[index],
                                      subItems: newSubs,
                                    };
                                    onChange(updated);
                                  }}
                                  className="h-8 w-8 text-red-500/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg animate-in fade-in"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
