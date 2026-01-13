"use client";

import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineItemsBuilder, type LineItemData } from "./line-items-builder";
import { PricePreview } from "./price-preview";
import { motion, AnimatePresence } from "motion/react";
import { Settings2, Info } from "lucide-react";
import { Section, Template } from "../quotation-sections/types";

export type TemplateFormValues = {
  name: string;
  description: string;
  projectTypeHint?: string;
  terms: string;
  lineItems: LineItemData[];
};

interface ProjectType {
  _id: string;
  name: string;
  isActive: boolean;
}

interface TemplateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: TemplateFormValues) => Promise<void>;
  initialData?: Template | null;
  projectTypes: ProjectType[];
  sections: Section[];
}

export function TemplateDrawer({
  open,
  onOpenChange,
  onSave,
  initialData,
  projectTypes,
  sections,
}: TemplateDrawerProps) {
  const [lineItems, setLineItems] = useState<LineItemData[]>([]);

  const form = useForm({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      projectTypeHint: initialData?.projectTypeHint ?? "",
      terms: initialData?.terms ?? "",
      lineItems: [] as LineItemData[],
    },
    onSubmit: async ({ value }) => {
      await onSave({
        ...value,
        lineItems: lineItems,
      });
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description ?? "",
        projectTypeHint: initialData.projectTypeHint ?? "",
        terms: initialData.terms ?? "",
        lineItems: [],
      });
      setLineItems(
        initialData.lineItems.map((li) => ({
          ...li,
          sectionId: li.sectionId,
        }))
      );
    } else {
      form.reset({
        name: "",
        description: "",
        projectTypeHint: "",
        terms: "",
        lineItems: [],
      });
      setLineItems([]);
    }
  }, [initialData, form, open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full max-sm:w-full ml-auto rounded-none w-screen max-w-4xl shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="mx-auto w-full flex flex-col h-full">
          {/* Header Section */}
          <DrawerHeader className="relative border-b border-white/5 pb-10 pt-12 px-10 overflow-hidden shrink-0">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-4 mb-3">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                <Settings2 className="h-6 w-6" />
              </div>
              <div className="space-y-0.5">
                <DrawerTitle className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  {initialData ? "Refine Framework" : "Create Framework"}
                </DrawerTitle>
                <DrawerDescription className="text-white/30 font-bold uppercase tracking-[0.3em] text-[10px] sm:text-xs">
                  {initialData
                    ? "Updating legacy pricing parameters and structural definitions."
                    : "Initializing a new standardized quotation model for rapid scaling."}
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex-1 overflow-y-auto px-10 py-12 space-y-12 scrollbar-thin scrollbar-thumb-white/5"
          >
            {/* Core Configuration Section */}
            <section className="space-y-8 p-8 rounded-2xl bg-white/2 border border-white/5 backdrop-blur-3xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-5 w-1 bg-primary rounded-full" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">
                  Operational Core
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form.Field name="name">
                  {(field) => (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                        Framework Nomenclature
                      </Label>
                      <Input
                        placeholder="e.g., Premium Cinematic Master"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/5 text-white h-14 rounded-xl px-5 focus:ring-1 focus:ring-primary/30 transition-all font-bold text-sm"
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="projectTypeHint">
                  {(field) => (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                        Category Linkage
                      </Label>
                      <Select
                        value={field.state.value || "none"}
                        onValueChange={(v) =>
                          field.handleChange(v === "none" ? "" : v)
                        }
                      >
                        <SelectTrigger className="bg-white/5 border-white/5 text-white h-14 rounded-xl px-5 focus:ring-1 focus:ring-primary/30 transition-all font-bold text-sm">
                          <SelectValue placeholder="Universal Framework" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-xl">
                          <SelectItem
                            value="none"
                            className="text-xs font-bold"
                          >
                            Universal / All Types
                          </SelectItem>
                          {projectTypes
                            .filter((pt) => pt.isActive)
                            .map((pt) => (
                              <SelectItem
                                key={pt._id}
                                value={pt._id}
                                className="text-xs font-bold"
                              >
                                {pt.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>

              <form.Field name="description">
                {(field) => (
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">
                      Framework Summary
                    </Label>
                    <Textarea
                      placeholder="Briefly define the scope and intent of this framework..."
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="bg-white/5 border-white/5 text-white rounded-xl px-5 py-4 focus:ring-1 focus:ring-primary/30 transition-all min-h-[100px] font-medium leading-relaxed"
                    />
                  </div>
                )}
              </form.Field>
            </section>

            {/* Line Items Builder Section */}
            <div className="space-y-6">
              <LineItemsBuilder
                lineItems={lineItems}
                onChange={setLineItems}
                sections={sections}
              />
            </div>

            {/* Terms & Valuation Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-12">
                <PricePreview lineItems={lineItems} />
              </div>

              <div className="lg:col-span-12 space-y-6 p-8 rounded-2xl bg-white/2 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-4 w-1 bg-white/10 rounded-full" />
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/50">
                    Terms & Governance
                  </h3>
                </div>
                <form.Field name="terms">
                  {(field) => (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/2 border border-white/5">
                        <Info className="h-4 w-4 text-white/20 shrink-0" />
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed italic">
                          Terms defined here will populate automatically in
                          quotations using this framework.
                        </p>
                      </div>
                      <Textarea
                        placeholder="Define standard payment cycles, delivery timelines, and legal caveats..."
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="bg-white/5 border-white/5 text-white rounded-xl px-5 py-6 focus:ring-1 focus:ring-primary/30 transition-all min-h-[160px] font-medium leading-relaxed"
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Final Submission Control */}
            <div className="pt-10 pb-20">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-linear-to-r from-primary/50 to-primary blur-2xl opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                    <Button
                      type="submit"
                      className="relative w-full h-16 bg-primary text-primary-foreground font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-3xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-40 disabled:grayscale disabled:scale-100"
                      disabled={
                        !canSubmit || isSubmitting || lineItems.length === 0
                      }
                    >
                      {isSubmitting
                        ? "Synchronizing Database..."
                        : initialData
                        ? "Commit Framework Updates"
                        : "Initialize Framework Database"}
                    </Button>
                  </div>
                )}
              </form.Subscribe>

              <AnimatePresence>
                {lineItems.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 mt-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10"
                  >
                    <Info className="h-3.5 w-3.5 text-red-500/40" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500/60">
                      Line item configuration required for framework validation
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
