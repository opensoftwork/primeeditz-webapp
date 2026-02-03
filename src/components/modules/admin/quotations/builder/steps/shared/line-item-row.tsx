"use client";

import { Briefcase, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
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
import type { Project, QuotationLineItem, Section } from "../../types";

interface LineItemRowProps {
  item: QuotationLineItem & { originalIdx: number };
  idx: number;
  filteredProjects: Project[];
  sections: Section[];
  handleUpdateItem: (
    idx: number,
    field: keyof QuotationLineItem,
    value: string | number | boolean | undefined,
  ) => void;
  removeLineItem: (idx: number) => void;
}

export function LineItemRow({
  item,
  idx,
  filteredProjects,
  sections,
  handleUpdateItem,
  removeLineItem,
}: LineItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-4 p-5 rounded-2xl bg-white/3 border border-white/5 group hover:border-white/10 transition-all items-start"
    >
      <div className="flex-1 grid grid-cols-12 gap-5">
        {/* Description & Section */}
        <div className="col-span-12 md:col-span-4 space-y-4">
          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2">
              Service / Segment Description
            </FieldLabel>
            <FieldContent>
              <Input
                value={item.description}
                onChange={(e) =>
                  handleUpdateItem(idx, "description", e.target.value)
                }
                className="h-11 bg-white/5 border-none rounded-xl text-sm font-bold text-white placeholder:text-white/30"
                placeholder="Service or Product name..."
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2">
              Quotation Section
            </FieldLabel>
            <FieldContent>
              <Select
                value={item.sectionId}
                onValueChange={(val) => handleUpdateItem(idx, "sectionId", val)}
              >
                <SelectTrigger className="h-11 bg-white/5 border-none rounded-xl text-[11px] font-bold text-white">
                  <SelectValue placeholder="Select Section..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {sections.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={s._id}
                      className="text-[11px] font-bold"
                    >
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
          </Field>
        </div>

        {/* Project Association */}
        <Field className="col-span-12 md:col-span-3">
          <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Associated Project
          </FieldLabel>
          <FieldContent>
            <Select
              value={item.projectId || "none"}
              onValueChange={(val) =>
                handleUpdateItem(
                  idx,
                  "projectId",
                  val === "none" ? undefined : val,
                )
              }
            >
              <SelectTrigger className="h-11 bg-white/5 border-none rounded-xl text-[11px] font-bold text-white">
                <SelectValue placeholder="General / No Project" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="none" className="text-[11px] font-bold">
                  General / No Project
                </SelectItem>
                {filteredProjects.map((p) => (
                  <SelectItem
                    key={p._id}
                    value={p._id}
                    className="text-[11px] font-bold"
                  >
                    {p.eventName || p.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        {/* Pricing & Units */}
        <div className="col-span-12 md:col-span-5 grid grid-cols-6 gap-4">
          {/* Unit */}
          <Field className="col-span-2">
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2">
              Unit
            </FieldLabel>
            <FieldContent>
              <NestedUnitSelector
                value={item.unit}
                onValueChange={(val) => handleUpdateItem(idx, "unit", val)}
                triggerClassName="h-11 w-full bg-white/5 border-none"
              />
            </FieldContent>
          </Field>

          {/* Rate */}
          <Field className="col-span-2">
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2">
              Rate
            </FieldLabel>
            <FieldContent>
              <Input
                type="number"
                value={item.rate}
                onChange={(e) =>
                  handleUpdateItem(idx, "rate", Number(e.target.value))
                }
                className="h-11 bg-white/5 border-none rounded-xl text-sm font-mono font-bold text-white text-right pr-4"
              />
            </FieldContent>
          </Field>

          {/* Quantity */}
          <Field className="col-span-2">
            <FieldLabel className="text-[10px] font-black text-white/40 uppercase tracking-widest pl-1 mb-2">
              Qty
            </FieldLabel>
            <FieldContent>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleUpdateItem(idx, "quantity", Number(e.target.value))
                }
                className="h-11 bg-white/5 border-none rounded-xl text-sm font-bold text-white text-center"
              />
            </FieldContent>
          </Field>
        </div>
      </div>

      {/* Delete Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => removeLineItem(idx)}
        className="mt-6 h-11 w-11 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
