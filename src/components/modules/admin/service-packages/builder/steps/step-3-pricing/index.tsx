"use client";

import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "convex/react";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import { Plus, Calculator } from "lucide-react";

import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useBuilder } from "../../builder-context";
import { LineItemCard } from "../../components/line-item-card";
import { PricingSidebar } from "../../components/pricing-sidebar";

const lineItemSchema = z.object({
  id: z.string(),
  sectionId: z.string().optional(),
  projectConfigId: z.string(),
  description: z.string().min(1, "Description is required"),
  unit: z.string().min(1, "Unit is required"),
  rate: z.number().min(0, "Rate must be 0 or more"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

const step3Schema = z.object({
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  applyGST: z.boolean(),
  gstPercentage: z.number().min(0).max(100),
});

export function Step3Pricing() {
  const {
    step2Data,
    step3Data,
    setStep3Data,
    setCurrentStep,
    setSubmitTrigger,
    setSyncCurrentStep,
    goToStep,
    isEditor,
  } = useBuilder();

  const projectConfigs = step2Data?.projectConfigs ?? [];

  const form = useForm({
    defaultValues: {
      lineItems:
        step3Data && step3Data.lineItems.length > 0
          ? step3Data.lineItems
          : [
              {
                id: crypto.randomUUID(),
                projectConfigId: projectConfigs[0]?.id || "",
                sectionId: undefined as string | undefined,
                description: "Main Service Offering",
                unit: "per project",
                rate: 0,
                quantity: 1,
              },
            ],
      applyGST: step3Data?.applyGST ?? true,
      gstPercentage: step3Data?.gstPercentage ?? 18,
    },
    validators: {
      onSubmit: step3Schema,
    },
    onSubmit: async ({ value }) => {
      setStep3Data({
        lineItems: value.lineItems.map((item: any) => ({
          ...item,
          sectionId: item.sectionId
            ? (item.sectionId as Id<"quotationSections">)
            : undefined,
          projectConfigId: item.projectConfigId || undefined,
        })),
        terms: step3Data?.terms, // Preserve existing terms from step 4
        applyGST: value.applyGST,
        gstPercentage: value.gstPercentage,
      });
      if (!isEditor) {
        goToStep(4);
      }
    },
  });

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(() => () => form.handleSubmit());
    return () => setSubmitTrigger(null);
  }, [form, setSubmitTrigger]);

  // Register sync callback - saves form data to context before navigation
  useEffect(() => {
    setSyncCurrentStep(() => () => {
      const values = form.state.values;
      setStep3Data({
        lineItems: values.lineItems.map((item: any) => ({
          ...item,
          sectionId: item.sectionId
            ? (item.sectionId as Id<"quotationSections">)
            : undefined,
          projectConfigId: item.projectConfigId || undefined,
        })),
        terms: step3Data?.terms, // Preserve terms from step 4
        applyGST: values.applyGST,
        gstPercentage: values.gstPercentage,
      });
    });
    return () => setSyncCurrentStep(null);
  }, [form, setStep3Data, setSyncCurrentStep, step3Data?.terms]);

  return (
    <form.Subscribe selector={(state) => state.values}>
      {(values) => {
        return (
          <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">
                  Step 03 — Financial Design
                </span>
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                Pricing & Terms
              </h2>
              <p className="text-sm font-semibold text-white/40 max-w-lg leading-relaxed">
                Construct your default cost structure and legal guardrails for
                this package.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              {/* Main Content Area */}
              <div className="lg:col-span-8 space-y-12">
                {/* Line Items Section */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between ml-1">
                    <div className="flex items-center gap-3">
                      <Calculator className="h-5 w-5 text-primary" />
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

                  <div className="space-y-4">
                    <form.Field name="lineItems" mode="array">
                      {(field) => (
                        <>
                          {field.state.value.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-white/5 rounded-[32px] bg-white/2 gap-4">
                              <div className="p-4 rounded-full bg-white/5">
                                <Plus className="h-8 w-8 text-white/10" />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-black text-white/40 uppercase tracking-widest">
                                  No line items added
                                </p>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">
                                  Start by adding your first service offering
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  field.pushValue({
                                    id: crypto.randomUUID(),
                                    projectConfigId:
                                      projectConfigs[0]?.id || "",
                                    description: "",
                                    unit: "per project",
                                    rate: 0,
                                    quantity: 1,
                                  })
                                }
                                className="mt-2 h-9 px-6 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary text-black hover:bg-primary/90 border-none"
                              >
                                Add First Item
                              </Button>
                            </div>
                          ) : (
                            field.state.value.map((_, index) => (
                              <LineItemCard
                                key={field.state.value[index]?.id ?? index}
                                form={form}
                                index={index}
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
                            ))
                          )}
                        </>
                      )}
                    </form.Field>
                  </div>
                </section>
              </div>

              {/* Sidebar Sidebar Area */}
              <div className="lg:col-span-4 lg:sticky lg:top-8">
                <PricingSidebar
                  lineItems={values.lineItems as any}
                  projectConfigs={projectConfigs}
                  applyGST={values.applyGST}
                  gstPercentage={values.gstPercentage}
                  onToggleGST={(checked) =>
                    form.setFieldValue("applyGST", checked)
                  }
                  onUpdateGSTPercentage={(value) =>
                    form.setFieldValue("gstPercentage", value)
                  }
                />
              </div>
            </form>
          </div>
        );
      }}
    </form.Subscribe>
  );
}
