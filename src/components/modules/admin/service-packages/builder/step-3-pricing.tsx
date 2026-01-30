"use client";

import { api } from "@convex/_generated/api";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  IndianRupee,
  ReceiptIndianRupee,
  FileText,
  BadgePercent,
  Calculator,
} from "lucide-react";

import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useBuilder } from "./builder-context";
import { LineItemRow } from "./components/line-item-row";
import { PricingSummary } from "./components/pricing-summary";

const lineItemSchema = z.object({
  id: z.string(),
  sectionId: z.string().optional().or(z.literal("")),
  projectConfigId: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  unit: z.string(),
  rate: z.number().min(0, "Rate must be 0 or more"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const step3Schema = z.object({
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  terms: z.string().max(2000, "Terms must be 2000 chars or less"),
  applyGST: z.boolean(),
});

export function Step3Pricing() {
  const { step2Data, step3Data, setStep3Data, setCurrentStep } = useBuilder();
  const projectConfigs = step2Data?.projectConfigs ?? [];
  const sections =
    useQuery(api.functions.quotations.sections.queries.getSections, {
      activeOnly: true,
    }) || [];

  const form = useForm({
    defaultValues: {
      lineItems: step3Data?.lineItems ?? [
        {
          id: crypto.randomUUID(),
          projectConfigId: projectConfigs[0]?.id || "",
          sectionId: "",
          description: "Main Service Offering",
          unit: "per project",
          rate: 0,
          quantity: 1,
        },
      ],
      terms: step3Data?.terms ?? "",
      applyGST: step3Data?.applyGST ?? true,
    },
    validators: {
      onChange: step3Schema,
    },
    onSubmit: async ({ value }) => {
      setStep3Data({
        lineItems: value.lineItems,
        terms: value.terms || undefined,
        applyGST: value.applyGST,
      });
      setCurrentStep(4);
    },
  });

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        return (
          <div className="max-w-6xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-10 space-y-2">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Pricing & Terms
              </h2>
              <p className="text-white/40 font-medium text-sm">
                Define the default cost structure and legal terms for this
                package.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-12"
            >
              {/* Line Items Section */}
              <section className="space-y-6">
                <div className="flex items-center justify-between ml-1">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest">
                      Service Line Items
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.pushFieldValue("lineItems", {
                        id: crypto.randomUUID(),
                        projectConfigId: projectConfigs[0]?.id || "",
                        sectionId: "",
                        description: "",
                        unit: "per project",
                        rate: 0,
                        quantity: 1,
                      });
                    }}
                    className="bg-white/5 border-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-xl gap-2 transition-all active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Item
                  </Button>
                </div>

                <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle">
                  <div className="bg-white/2 border-b border-white/5 px-8 py-3 grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 md:col-span-2 translate-x-4">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        Project
                      </span>
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                        Description
                      </span>
                    </div>
                    <div className="hidden md:block col-span-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center">
                        Section
                      </span>
                    </div>
                    <div className="hidden md:block col-span-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center">
                        Unit
                      </span>
                    </div>
                    <div className="hidden md:block col-span-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center">
                        Rate
                      </span>
                    </div>
                    <div className="hidden md:block col-span-1">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest text-right pr-4">
                        Qty
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-0 divide-y divide-white/5">
                    <form.Field name="lineItems" mode="array">
                      {(field) => (
                        <>
                          {field.state.value.map((_, index) => (
                            <LineItemRow
                              key={field.state.value[index]?.id ?? index}
                              form={form}
                              index={index}
                              sections={sections}
                              projectConfigs={projectConfigs}
                              canRemove={field.state.value.length > 1}
                              onRemove={() => {
                                if (field.state.value.length > 1) {
                                  field.removeValue(index);
                                } else {
                                  toast.error(
                                    "At least one line item is required",
                                  );
                                }
                              }}
                            />
                          ))}
                        </>
                      )}
                    </form.Field>
                  </CardContent>

                  <div className="bg-white/2 p-8 space-y-8">
                    <div className="flex flex-col xl:flex-row gap-10">
                      {/* Terms & Conditions */}
                      <div className="flex-1 w-full space-y-4">
                        <div className="flex items-center gap-2 ml-1">
                          <FileText className="h-4 w-4 text-primary" />
                          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                            Terms & Conditions
                          </h3>
                        </div>
                        <form.Field name="terms">
                          {(field) => {
                            const hasError = field.state.meta.errors.length > 0;
                            return (
                              <Field data-invalid={hasError}>
                                <Textarea
                                  id={field.name}
                                  placeholder="Define payment milestones, cancellation policies, delivery timelines..."
                                  value={field.state.value}
                                  onBlur={field.handleBlur}
                                  onChange={(e) =>
                                    field.handleChange(e.target.value)
                                  }
                                  aria-invalid={hasError}
                                  className="bg-zinc-950/40 border-white/5 focus:border-primary/50 focus:ring-primary/20 resize-none h-32 rounded-2xl text-sm transition-all p-4 shadow-inner"
                                />
                                <FieldError className="text-[10px] uppercase tracking-wider font-bold">
                                  {field.state.meta.errors
                                    .map((err) => err?.toString())
                                    .join(", ")}
                                </FieldError>
                              </Field>
                            );
                          }}
                        </form.Field>
                      </div>

                      {/* Pricing Summary Breakdown */}
                      <div className="flex-[1.5] w-full">
                         <PricingSummary 
                           lineItems={values.lineItems}
                           projectConfigs={projectConfigs}
                           applyGST={values.applyGST}
                         />
                      </div>
                    </div>
                  </div>
                </Card>
              </section>

              {/* Navigation */}
              <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCurrentStep(2)}
                  className="hover:bg-white/5 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 rounded-2xl transition-all gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Config
                </Button>

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                    >
                      {isSubmitting ? "Processing..." : "Next: Review"}
                      {!isSubmitting && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </div>
        );
      }}
    </form.Subscribe>
  );
}

