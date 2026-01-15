/**
 * Quotation Builder Step 2: Template Selection
 */

"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Layout, ChevronRight } from "lucide-react";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { Template } from "../../types";

export function Step2TemplateSelection() {
  const { templates, applyTemplate, nextStep, setFormData, setSubmitTrigger } =
    useQuotationBuilder();

  const handleStartFromScratch = () => {
    setFormData("step2", { templateId: "" });
    nextStep();
  };

  const handleSelectTemplate = (templateId: string) => {
    applyTemplate(templateId);
  };

  // Register submit trigger - for this step, just move to next
  useEffect(() => {
    setSubmitTrigger(() => handleStartFromScratch);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger]);

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1">
        <div className="mb-8 space-y-1">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Template Selection
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Choose a pre-configured template or build from scratch
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Start from Scratch */}
          <button
            type="button"
            onClick={handleStartFromScratch}
            className="p-8 rounded-[2rem] border border-dashed border-white/10 bg-white/2 hover:bg-white/4 transition-all text-center group"
          >
            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-primary/40 group-hover:bg-primary/5">
              <Plus className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">
              Start from Scratch
            </h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest px-4">
              Begin with a completely empty canvas
            </p>
          </button>

          {/* Template Cards */}
          {templates?.map((template: Template) => (
            <button
              key={template._id}
              type="button"
              onClick={() => handleSelectTemplate(template._id)}
              className="p-8 rounded-[2rem] border border-white/5 bg-white/2 hover:border-primary/20 hover:bg-primary/5 transition-all text-left flex flex-col items-start group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layout className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">
                {template.name}
              </h3>
              <p className="text-[10px] text-white/40 font-medium line-clamp-2 leading-relaxed">
                {template.description || "Pre-configured package template"}
              </p>
              {template.lineItems.length > 0 && (
                <span className="mt-3 text-[8px] font-black uppercase tracking-widest text-primary/60">
                  {template.lineItems.length} items included
                </span>
              )}
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
