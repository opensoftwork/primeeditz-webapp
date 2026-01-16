"use client";

import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { TemplateLineItemsBuilder } from "./components/template-line-items-builder";
import type { TemplateLineItem as LineItemData } from "../quotations/builder/types";
import { PricePreview } from "./price-preview";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Section, Template } from "../quotation-sections/types";
import { Id } from "@convex/_generated/dataModel";

interface TemplateEditorProps {
  templateId?: string;
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter();
  const isEditing = !!templateId;

  // Queries
  const existingTemplate = useQuery(
    api.functions.quotations.templates.queries.getTemplate,
    templateId ? { templateId: templateId as Id<"quotationTemplates"> } : "skip"
  );
  const projectTypes = useQuery(api.admin.getProjectTypes);
  const sections = useQuery(
    api.functions.quotations.sections.queries.getSections,
    { activeOnly: true }
  );

  // Mutations
  const createTemplate = useMutation(
    api.functions.quotations.templates.mutations.createTemplate
  );
  const updateTemplate = useMutation(
    api.functions.quotations.templates.mutations.updateTemplate
  );

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      projectTypeHint: "",
      terms: "",
      lineItems: [] as LineItemData[],
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        toast.error("Template name is required");
        return;
      }

      if (value.lineItems.length === 0) {
        toast.error("Add at least one line item");
        return;
      }

      try {
        if (isEditing && templateId) {
          await updateTemplate({
            templateId: templateId as Id<"quotationTemplates">,
            name: value.name,
            description: value.description || undefined,
            projectTypeHint: value.projectTypeHint || undefined,
            terms: value.terms || undefined,
            lineItems: value.lineItems as any,
          });
          toast.success("Template updated");
        } else {
          await createTemplate({
            name: value.name,
            description: value.description || undefined,
            projectTypeHint: value.projectTypeHint || undefined,
            terms: value.terms || undefined,
            lineItems: value.lineItems as any,
            createdBy: "SYSTEM",
          });
          toast.success("Template created");
        }
        router.push("/settings/quotation-templates");
      } catch (error) {
        console.error(error);
        toast.error("Failed to save template");
      }
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (existingTemplate) {
      form.reset({
        name: existingTemplate.name,
        description: existingTemplate.description ?? "",
        projectTypeHint: existingTemplate.projectTypeHint ?? "",
        terms: existingTemplate.terms ?? "",
        lineItems: existingTemplate.lineItems as LineItemData[],
      });
    }
  }, [existingTemplate]);

  // Loading state
  if (projectTypes === undefined || sections === undefined) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      </div>
    );
  }

  if (isEditing && existingTemplate === undefined) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between p-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings/quotation-templates")}
              className="h-9 w-9 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-black text-white uppercase tracking-tight">
                {isEditing ? "Edit Template" : "New Template"}
              </h1>
              <p className="text-xs font-medium text-white/40">
                {isEditing
                  ? "Modify existing template"
                  : "Create a reusable pricing template"}
              </p>
            </div>
          </div>

          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
              lineItems: state.values.lineItems,
            })}
          >
            {(state) => (
              <Button
                type="submit"
                form="template-form"
                disabled={
                  !state.canSubmit ||
                  state.isSubmitting ||
                  state.lineItems.length === 0
                }
                className="h-10 px-5 bg-primary text-primary-foreground font-bold text-sm rounded-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {state.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Update" : "Create"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </div>

      {/* Content */}
      <form
        id="template-form"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="p-4 md:p-8 space-y-6 w-full"
      >
        {/* Core Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl">
            <form.Field name="name">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-tight text-white/50 ml-1">
                    Template Name *
                  </Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g., Enterprise Cinema Package"
                    className="bg-white/5 border-white/5 text-white h-12 rounded-xl text-sm font-bold px-4 focus:ring-1 focus:ring-primary/30 transition-all hover:bg-white/8"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-tight text-white/50 ml-1">
                    Project Description
                  </Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Brief description of project architectural objectives..."
                    className="bg-white/5 border-white/5 text-white rounded-xl text-sm min-h-[100px] px-4 py-3 focus:ring-1 focus:ring-primary/30 transition-all hover:bg-white/8 resize-none"
                  />
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-6 p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl">
            <form.Field name="projectTypeHint">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-xs font-bold tracking-tight text-white/50 ml-1">
                    Project Category
                  </Label>
                  <Select
                    value={field.state.value || "none"}
                    onValueChange={(v) =>
                      field.handleChange(v === "none" ? "" : v)
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/5 text-white h-12 rounded-xl text-sm font-medium px-4 transition-all hover:bg-white/8 focus:ring-1 focus:ring-primary/30">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/95 backdrop-blur-2xl border-white/10 text-white rounded-xl shadow-2xl">
                      <SelectItem value="none" className="text-sm py-3">
                        General / Universal
                      </SelectItem>
                      {projectTypes
                        .filter((pt) => pt.isActive)
                        .map((pt) => (
                          <SelectItem
                            key={pt._id}
                            value={pt._id}
                            className="text-sm py-3 focus:bg-primary/20"
                          >
                            {pt.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.values.lineItems]}>
              {([lineItemsVal]) => (
                <PricePreview lineItems={lineItemsVal as LineItemData[]} />
              )}
            </form.Subscribe>
          </div>
        </div>

        {/* Line Items */}
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl">
          <form.Field name="lineItems">
            {(field) => (
              <TemplateLineItemsBuilder
                lineItems={field.state.value}
                onChange={(val: LineItemData[]) => field.handleChange(val)}
                sections={sections as Section[]}
              />
            )}
          </form.Field>
        </div>

        {/* Terms */}
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl">
          <form.Field name="terms">
            {(field) => (
              <div className="space-y-3">
                <Label className="text-xs font-bold tracking-tight text-white/50 ml-1">
                  Terms & Conditions
                </Label>
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Payment architectural terms, delivery timelines, and legal frameworks..."
                  className="bg-white/5 border-white/5 text-white rounded-xl text-sm min-h-[120px] px-4 py-3 focus:ring-1 focus:ring-primary/30 transition-all hover:bg-white/8 resize-none"
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Mobile Submit */}
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            lineItems: state.values.lineItems,
          })}
        >
          {(state) => (
            <div className="lg:hidden pb-8">
              <Button
                type="submit"
                disabled={
                  !state.canSubmit ||
                  state.isSubmitting ||
                  state.lineItems.length === 0
                }
                className="w-full h-12 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-primary/20"
              >
                {state.isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
