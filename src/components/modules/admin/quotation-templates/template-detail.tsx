/**
 * Template Detail Page
 *
 * Full-page view for quotation template specifications.
 * Moving from drawer implementation to dedicated page for better clarity.
 */

"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Edit3,
  Loader2,
  Settings2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Id } from "@convex/_generated/dataModel";
import { TemplateLineItem } from "../quotation-sections/types";
import { TemplateLineItemsTable } from "./components/template-line-items-table";
import { PricePreview } from "./price-preview";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useEffect } from "react";

interface TemplateDetailProps {
  templateId: string;
}

export function TemplateDetail({ templateId }: TemplateDetailProps) {
  const router = useRouter();

  const template = useQuery(
    api.functions.quotations.templates.queries.getTemplate,
    { templateId: templateId as Id<"quotationTemplates"> },
  );

  const setOverride = useBreadcrumbStore((state) => state.setOverride);
  const removeOverride = useBreadcrumbStore((state) => state.removeOverride);

  useEffect(() => {
    if (template?.name) {
      setOverride(templateId, template.name);
    }
    return () => {
      removeOverride(templateId);
    };
  }, [templateId, template?.name, setOverride, removeOverride]);

  const sections = useQuery(
    api.functions.quotations.sections.queries.getSections,
    { activeOnly: false },
  );

  if (template === undefined || sections === undefined) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-6 w-6 animate-spin text-white/20" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <p className="text-white/40 font-bold uppercase tracking-widest text-xs">
          Framework Not Found
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/settings/quotation-templates")}
          className="rounded-xl border-white/10 text-white"
        >
          Back to Templates
        </Button>
      </div>
    );
  }

  // Group line items by section for the table view
  const groupedItems = sections
    .map((section) => ({
      section,
      items: (template.lineItems as TemplateLineItem[])
        .map((item, idx) => ({ ...item, originalIdx: idx }))
        .filter((item) => item.sectionId === section._id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="min-h-screen pb-20">
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
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black text-white uppercase tracking-tight">
                    {template.name}
                  </h1>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                      template.isActive
                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                        : "bg-white/5 text-white/40 border-white/10",
                    )}
                  >
                    {template.isActive ? "Active" : "Draft"}
                  </span>
                </div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                  Pricing Framework
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() =>
                router.push(`/settings/quotation-templates/${templateId}/edit`)
              }
              className="h-9 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-widest text-[9px] rounded-lg transition-all gap-2"
            >
              <Edit3 className="h-3.5 w-3.5 text-primary" />
              Edit Framework
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 space-y-6">
        {/* Core Info - Mimicking Editor Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6 p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] pointer-events-none">
              <FileText className="h-32 w-32 -rotate-12" />
            </div>

            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                  Template Nomenclature
                </span>
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-sm font-bold text-white uppercase tracking-tight">
                  {template.name}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                  Service Strategy / Description
                </span>
                <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-sm font-medium text-white/50 leading-relaxed min-h-[100px]">
                  {template.description ||
                    "No tactical strategy defined for this framework."}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
                Primary Category
              </span>
              <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-sm font-bold text-white uppercase tracking-tight">
                {template.projectTypeHint
                  ? "Service Specific"
                  : "Universal Framework"}
              </div>
            </div>

            <PricePreview lineItems={template.lineItems as any} />
          </div>
        </div>

        {/* Deliverables Architecture - Mimicking Editor Table */}
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl space-y-8">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                Framework Architecture
              </h3>
            </div>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
              Standard Deliverables Breakdown
            </span>
          </div>

          <div className="space-y-12">
            {groupedItems.map((group) => (
              <div key={group.section._id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "h-6 w-1 rounded-full",
                      group.section.color === "blue"
                        ? "bg-blue-500"
                        : group.section.color === "purple"
                          ? "bg-purple-500"
                          : group.section.color === "green"
                            ? "bg-emerald-500"
                            : "bg-zinc-500",
                    )}
                  />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60">
                    {group.section.name}
                  </h4>
                </div>

                <TemplateLineItemsTable
                  items={group.items}
                  section={group.section}
                  readOnly={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="p-6 rounded-2xl bg-white/2 border border-white/5 shadow-xl">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">
              Governance / Terms & Conditions
            </span>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 text-xs font-medium text-white/40 leading-relaxed min-h-[120px] whitespace-pre-wrap">
              {template.terms ||
                "Standard operational terms apply to this framework."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
