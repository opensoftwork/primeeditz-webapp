/**
 * Quotation Builder Step 3: Line Items Editor
 *
 * Add, edit, and remove line items with pricing.
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  HelpCircle,
  Trash2,
  BookOpen,
  Search,
  Plus,
  Briefcase,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NestedUnitSelector } from "@/components/ui/nested-unit-selector";
import { UNIT_OPTIONS } from "@/constants/units";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useQuotationBuilder } from "../quotation-builder-context";
import type { QuotationLineItem, Project, LibraryItem } from "../types";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export function Step3LineItems() {
  const {
    formData,
    addLineItem,
    updateLineItem,
    removeLineItem,
    nextStep,
    setSubmitTrigger,
    projects,
    setFormData,
  } = useQuotationBuilder();

  const { lineItems } = formData.step3;
  const selectedProjectIds = formData.step1.projectIds;
  const filteredProjects =
    projects?.filter((p) => selectedProjectIds.includes(p._id)) || [];

  const sections =
    useQuery(api.functions.quotations.sections.queries.getSections, {
      activeOnly: true,
    }) || [];

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => nextStep);
    return () => setSubmitTrigger(null);
  }, [nextStep, setSubmitTrigger]);

  const handleUpdateItem = (
    idx: number,
    field: keyof QuotationLineItem,
    value: any
  ) => {
    updateLineItem(idx, { [field]: value });
  };

  // Group items by section
  const groupedItems = sections.map((section) => ({
    section,
    items: lineItems
      .map((item, originalIdx) => ({ ...item, originalIdx }))
      .filter((item) => item.sectionId === section._id),
  }));

  const uncategorizedItems = lineItems
    .map((item, originalIdx) => ({ ...item, originalIdx }))
    .filter(
      (item) =>
        !item.sectionId || !sections.find((s) => s._id === item.sectionId)
    );

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Calculate Worth
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Define the line items and pricing for this quotation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LibraryItemsDrawer
              onSelect={(item) => {
                // Auto-assign project if only one exists
                const defaultProjectId =
                  filteredProjects.length === 1
                    ? filteredProjects[0]._id
                    : undefined;

                addLineItem({
                  description: item.name,
                  unit: item.unit,
                  rate: item.unitPrice,
                  quantity: 1,
                  sectionId: item.sectionId,
                  projectId: defaultProjectId,
                });
              }}
            />
          </div>
        </div>

        {/* Involved Projects Manager */}
        <div className="mb-8 p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-primary" /> Involved
              Projects
            </h3>
            <div className="flex items-center gap-4">
              {/* Project Selector */}
              <Select
                value=""
                onValueChange={(val) => {
                  if (
                    val &&
                    val !== "none" &&
                    !selectedProjectIds.includes(val)
                  ) {
                    setFormData("step1", {
                      projectIds: [...selectedProjectIds, val],
                    });
                  }
                }}
                disabled={!formData.step1.clientId}
              >
                <SelectTrigger className="h-9 bg-white/5 border-white/5 rounded-xl px-4 text-[10px] font-black uppercase tracking-wider text-white hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Add Project..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {projects
                    ?.filter((p) => !selectedProjectIds.includes(p._id))
                    .map((p) => (
                      <SelectItem
                        key={p._id}
                        value={p._id}
                        className="text-[10px] font-black uppercase tracking-wider py-3"
                      >
                        {p.eventName || p.code}
                      </SelectItem>
                    ))}
                  {projects?.filter((p) => !selectedProjectIds.includes(p._id))
                    .length === 0 && (
                    <div className="p-4 text-center text-[10px] font-bold text-white/20 uppercase">
                      No more projects available
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filteredProjects.map((project) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 group animate-pulse-subtle"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-primary uppercase tracking-tight">
                    {project.eventName || project.code}
                  </span>
                  <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
                    {project.projectTypeName}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData("step1", {
                      projectIds: selectedProjectIds.filter(
                        (id) => id !== project._id
                      ),
                    });
                    // Also clear association for line items using this project
                    lineItems.forEach((li, idx) => {
                      if (li.projectId === project._id) {
                        handleUpdateItem(idx, "projectId", undefined);
                      }
                    });
                  }}
                  className="p-1 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="py-4 px-1">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest italic">
                  No specific projects involved. All services will be general.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-12">
          {groupedItems.map(({ section, items }) => (
            <div key={section._id} className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "h-8 px-4 rounded-xl flex items-center justify-center border font-black uppercase tracking-[0.2em] text-[10px]",
                      section.color === "blue"
                        ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        : section.color === "purple"
                        ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        : section.color === "green"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : section.color === "amber"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : section.color === "indigo"
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        : section.color === "orange"
                        ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                        : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                    )}
                  >
                    {section.name}
                  </div>
                  <div className="h-px w-24 bg-white/5" />
                  <span className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">
                    {items.length} segments
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const defaultProjectId =
                      filteredProjects.length === 1
                        ? filteredProjects[0]._id
                        : undefined;
                    addLineItem({
                      sectionId: section._id,
                      description: "",
                      unit: "ls",
                      rate: 0,
                      quantity: 1,
                      projectId: defaultProjectId,
                    });
                  }}
                  className="h-8 px-4 rounded-xl bg-white/2 hover:bg-primary/5 text-white/40 hover:text-primary font-black uppercase tracking-widest text-[8px] transition-all"
                >
                  <Plus className="h-3 w-3 mr-1.5" /> add to {section.name}
                </Button>
              </div>

              <div className="p-1 rounded-3xl bg-white/2 border border-white/5 overflow-hidden">
                <div className="p-6 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        idx={item.originalIdx}
                        filteredProjects={filteredProjects}
                        sections={sections}
                        handleUpdateItem={handleUpdateItem}
                        removeLineItem={removeLineItem}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em] italic">
                          No items in this section
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}

          {uncategorizedItems.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="h-8 px-4 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-400 font-black uppercase tracking-[0.2em] text-[10px]">
                  Uncategorized
                </div>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <div className="p-1 rounded-3xl bg-white/2 border border-white/5 overflow-hidden">
                <div className="p-6 space-y-4">
                  <AnimatePresence mode="popLayout">
                    {uncategorizedItems.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        idx={item.originalIdx}
                        filteredProjects={filteredProjects}
                        sections={sections}
                        handleUpdateItem={handleUpdateItem}
                        removeLineItem={removeLineItem}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LineItemRow({
  item,
  idx,
  filteredProjects,
  sections,
  handleUpdateItem,
  removeLineItem,
}: {
  item: QuotationLineItem & { originalIdx: number };
  idx: number;
  filteredProjects: Project[];
  sections: any[];
  handleUpdateItem: (
    idx: number,
    field: keyof QuotationLineItem,
    value: any
  ) => void;
  removeLineItem: (idx: number) => void;
}) {
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
            <FieldLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1 mb-2">
              Service / Segment Description
            </FieldLabel>
            <FieldContent>
              <Input
                value={item.description}
                onChange={(e) =>
                  handleUpdateItem(idx, "description", e.target.value)
                }
                className="h-11 bg-white/5 border-none rounded-xl text-sm font-bold text-white placeholder:text-white/10"
                placeholder="Service or Product name..."
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1 mb-2">
              Quotation Section
            </FieldLabel>
            <FieldContent>
              <Select
                value={item.sectionId}
                onValueChange={(val) => handleUpdateItem(idx, "sectionId", val)}
              >
                <SelectTrigger className="h-11 bg-white/5 border-none rounded-xl text-[10px] font-black uppercase tracking-wider text-white">
                  <SelectValue placeholder="Select Section..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {sections.map((s) => (
                    <SelectItem
                      key={s._id}
                      value={s._id}
                      className="text-[10px] font-black uppercase tracking-wider"
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
          <FieldLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1 mb-2 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Associated Project
          </FieldLabel>
          <FieldContent>
            <Select
              value={item.projectId || "none"}
              onValueChange={(val) =>
                handleUpdateItem(
                  idx,
                  "projectId",
                  val === "none" ? undefined : val
                )
              }
            >
              <SelectTrigger className="h-11 bg-white/5 border-none rounded-xl text-[10px] font-black uppercase tracking-wider text-white">
                <SelectValue placeholder="General / No Project" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem
                  value="none"
                  className="text-[10px] font-black uppercase tracking-wider"
                >
                  General / No Project
                </SelectItem>
                {filteredProjects.map((p) => (
                  <SelectItem
                    key={p._id}
                    value={p._id}
                    className="text-[10px] font-black uppercase tracking-wider"
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
            <FieldLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1 mb-2">
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
            <FieldLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1 mb-2">
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
            <FieldLabel className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-1 mb-2">
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

function LibraryItemsDrawer({ onSelect }: { onSelect: (item: any) => void }) {
  const [search, setSearch] = useState("");
  const itemGroups =
    useQuery(api.functions.quotations.queries.getLibraryItems, {}) || [];

  const filteredGroups = itemGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item: any) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description?.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className="h-10 px-5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] border border-white/5"
        >
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          Library Segments
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-zinc-950 border-white/10">
        <div className="mx-auto w-full max-w-5xl">
          <DrawerHeader className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <DrawerTitle className="text-2xl font-black uppercase tracking-tight text-white">
                  Service Library
                </DrawerTitle>
                <DrawerDescription className="text-sm text-white/40 font-medium italic">
                  Explore segments curated from your library and existing
                  templates
                </DrawerDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input
                  placeholder="Search services, segments or templates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 pl-11 bg-white/5 border-none rounded-xl text-sm font-bold text-white placeholder:text-white/20"
                />
              </div>
            </div>
          </DrawerHeader>

          <div className="p-8 max-h-[65vh] overflow-y-auto custom-scrollbar space-y-12">
            {filteredGroups.map((group) => {
              const { section, items } = group;
              return (
                <div key={section._id} className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-8 px-4 rounded-xl flex items-center justify-center border font-black uppercase tracking-[0.2em] text-[10px]",
                        section.color === "blue"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : section.color === "purple"
                          ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                          : section.color === "green"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : section.color === "amber"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : section.color === "indigo"
                          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                          : section.color === "orange"
                          ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                          : "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                      )}
                    >
                      {section.name}
                    </div>
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">
                      {items.length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item: any) => (
                      <button
                        key={item._id}
                        onClick={() => onSelect(item)}
                        className="flex flex-col items-start p-5 rounded-2xl bg-white/2 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest border",
                              item.source === "template"
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "bg-white/5 border-white/10 text-white/40"
                            )}
                          >
                            {item.source === "template" ? "Suggested" : "Base"}
                          </span>
                          <span className="text-[9px] font-black text-white uppercase tracking-tight">
                            {item.unitPrice.toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </span>
                        </div>

                        <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-1 group-hover:text-primary transition-colors line-clamp-1">
                          {item.name}
                        </h4>
                        <p className="text-[9px] font-medium text-white/30 leading-tight line-clamp-2 italic">
                          {item.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredGroups.length === 0 && (
              <div className="py-20 text-center">
                <div className="h-20 w-20 rounded-full bg-white/2 border border-white/5 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-white/10" />
                </div>
                <p className="text-white/20 font-black uppercase tracking-widest text-sm italic">
                  No matching services or segments found
                </p>
              </div>
            )}
          </div>

          <DrawerFooter className="p-8 border-t border-white/5">
            <DrawerClose asChild>
              <Button
                variant="ghost"
                className="h-11 rounded-xl text-white/40 hover:text-white font-black uppercase tracking-widest text-xs"
              >
                Back to Quotation
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
