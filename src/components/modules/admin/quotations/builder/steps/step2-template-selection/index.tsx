/**
 * Quotation Builder Step 2: Template Selection
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Layout, ChevronRight, Check, ChevronDown } from "lucide-react";
import { useQuotationBuilder } from "../../quotation-builder-context";
import { cn } from "@/lib/utils";
import type { Template, Project } from "../../types";

export function Step2TemplateSelection() {
  const {
    templates,
    applyTemplate,
    nextStep,
    setSubmitTrigger,
    projects,
    formData,
  } = useQuotationBuilder();

  // Get selected projects
  const selectedProjectIds = formData.step2.projectIds;
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id)
    ) || [];

  // Active project tab
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    filteredProjects[0]?._id || null
  );

  // State to toggle template list visibility
  const [isBrowsingTemplates, setIsBrowsingTemplates] = useState(false);

  // Sync active project if selection changes or initially null
  useEffect(() => {
    if (!activeProjectId && filteredProjects.length > 0) {
      setActiveProjectId(filteredProjects[0]._id);
    } else if (
      activeProjectId &&
      !selectedProjectIds.includes(activeProjectId)
    ) {
      setActiveProjectId(filteredProjects[0]?._id || null);
    }
  }, [selectedProjectIds, filteredProjects, activeProjectId]);

  // Determine active selection type for current project
  const selectedTemplateId = activeProjectId
    ? formData.step3.projectTemplates[activeProjectId]
    : undefined;

  // Sync browsing state with selection
  useEffect(() => {
    if (selectedTemplateId && selectedTemplateId !== "") {
      setIsBrowsingTemplates(true);
    } else if (selectedTemplateId === "") {
        setIsBrowsingTemplates(false);
    } else {
        setIsBrowsingTemplates(false);
    }
  }, [selectedTemplateId, activeProjectId]);

  const handleSelectTemplate = (templateId: string) => {
    if (!activeProjectId) return;
    applyTemplate(templateId, activeProjectId);
    
    // Auto-advance to next project
    const currentIndex = filteredProjects.findIndex(p => p._id === activeProjectId);
    if (currentIndex < filteredProjects.length - 1) {
       // Optional: small delay or immediate
       setTimeout(() => {
          setActiveProjectId(filteredProjects[currentIndex + 1]._id);
       }, 500); 
    }
  };

  const handleStartFromScratch = () => {
    if (!activeProjectId) return;
    setIsBrowsingTemplates(false);
    applyTemplate("", activeProjectId); // Explicitly clear template for this project
    
    // Auto-advance
    const currentIndex = filteredProjects.findIndex(p => p._id === activeProjectId);
    if (currentIndex < filteredProjects.length - 1) {
         setTimeout(() => {
            setActiveProjectId(filteredProjects[currentIndex + 1]._id);
         }, 300);
    }
  };

  const handleBrowseTemplates = () => {
    setIsBrowsingTemplates(true);
  };

  const handleNext = () => {
    nextStep();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, nextStep]);

  if (!activeProjectId) {
    return (
      <div className="flex items-center justify-center h-full text-white/40">
        No projects selected. Go back to select projects.
      </div>
    );
  }

  const isScratchSelected = selectedTemplateId === "";
  const isTemplateSelected = !!selectedTemplateId && selectedTemplateId !== "";

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="flex-1 space-y-8 pb-10">
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Template Selection
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Choose a template for each project
          </p>
        </div>

        {/* Project Tabs */}
        {filteredProjects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 noscroll">
            {filteredProjects.map((project) => {
              const isConfigured = !!formData.step3.projectTemplates[project._id];
              const isActive = activeProjectId === project._id;
              
              return (
                <button
                  key={project._id}
                  onClick={() => setActiveProjectId(project._id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  {isConfigured && (
                    <div className={cn("h-1.5 w-1.5 rounded-full", isActive ? "bg-white" : "bg-primary")} />
                  )}
                  {project.eventName || project.code}
                </button>
              );
            })}
          </div>
        )}
        
        {/* Helper text for current project */}
         <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                 Select template for: <span className="text-primary">{filteredProjects.find(p => p._id === activeProjectId)?.eventName ||  "Selected Project"}</span>
            </span>
             <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">
                {isScratchSelected ? "Starting from Scratch" : isTemplateSelected ? "Template Selected" : "No Selection"}
            </span>
         </div>

         {/* Top Level Choices */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Option 1: Start from Scratch */}
            <button
              type="button"
              onClick={handleStartFromScratch}
              className={cn(
                "p-8 rounded-[2rem] border transition-all text-center group relative overflow-hidden",
                isScratchSelected
                   ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                   : "border-white/10 bg-white/2 hover:bg-white/4 hover:border-white/20"
              )}
            >
               {isScratchSelected && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                  </div>
              )}
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                <Plus className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">
                Start from Scratch
              </h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest px-4">
                Begin with a completely empty canvas
              </p>
            </button>

             {/* Option 2: Select Template */}
            <button
              type="button"
              onClick={handleBrowseTemplates}
              className={cn(
                "p-8 rounded-[2rem] border transition-all text-center group relative overflow-hidden",
                 isBrowsingTemplates || isTemplateSelected
                   ? "bg-primary/10 border-primary shadow-lg shadow-primary/10" 
                   : "border-white/10 bg-white/2 hover:bg-white/4 hover:border-white/20"
              )}
            >
               {(isBrowsingTemplates || isTemplateSelected) && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      {isTemplateSelected ? <Check className="h-3 w-3 text-white" /> : <ChevronDown className="h-3 w-3 text-white" />}
                  </div>
              )}
              <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                <Layout className="h-6 w-6 text-white/20 group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">
                 Select a Template
              </h3>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest px-4">
                Choose from pre-configured packages
              </p>
            </button>
         </div>

        {/* Templates Grid (Revealed) */}
        <AnimatePresence>
          {isBrowsingTemplates && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
            >
                <div className="pt-4 border-t border-white/5 mt-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Available Templates</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {templates?.map((template: Template) => {
                        const isSelected = selectedTemplateId === template._id;
                        return (
                        <button
                            key={template._id}
                            type="button"
                            onClick={() => handleSelectTemplate(template._id)}
                            className={cn(
                            "p-6 rounded-[1.5rem] border transition-all text-left flex flex-col items-start group relative overflow-hidden",
                            isSelected
                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                                : "border-white/5 bg-white/2 hover:border-primary/20 hover:bg-primary/5"
                            )}
                        >
                            {isSelected && (
                            <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center z-10">
                                <Check className="h-3 w-3 text-white" />
                            </div>
                            )}
                             {!isSelected && (
                                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-5 w-5 text-primary" />
                                </div>
                             )}
                            
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Layout className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                     <h3 className="text-xs font-black text-white uppercase tracking-widest">
                                        {template.name}
                                    </h3>
                                    {template.lineItems.length > 0 && (
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60">
                                            {template.lineItems.length} items
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <p className="text-[9px] text-white/40 font-medium line-clamp-2 leading-relaxed">
                            {template.description || "Pre-configured package template"}
                            </p>
                        </button>
                        )})}
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
