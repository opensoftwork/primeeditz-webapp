"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Briefcase, FolderOpen, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotationBuilder } from "../../quotation-builder-context";
import { ProjectListingDrawer } from "../step3-line-items/project-list";
import type { Project } from "../../types";

export function Step2ProjectSelection() {
  const {
    formData,
    setFormData,
    projects,
    nextStep,
    setSubmitTrigger,
    selectedClient,
  } = useQuotationBuilder();

  // Selected project IDs come from step2 in the new context
  const selectedProjectIds = formData.step2.projectIds;

  // Filter full project objects
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id)
    ) || [];

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(nextStep);
    return () => setSubmitTrigger(null);
  }, [nextStep, setSubmitTrigger]);

  const handleAddProject = (val: string) => {
    setFormData("step2", {
      projectIds: [...selectedProjectIds, val],
    });
  };

  const handleRemoveProject = (projectId: string) => {
    setFormData("step2", {
      projectIds: selectedProjectIds.filter((id) => id !== projectId),
    });
  };

  return (
    <div className="w-full flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tight uppercase text-white">
            Involved Projects
          </h2>
          <p className="text-sm text-white/40 font-medium">
            Select the projects involved in this quotation for {selectedClient?.name || "the client"}
          </p>
        </div>
        <ProjectListingDrawer
          clientId={formData.step1.clientId}
          selectedProjectIds={selectedProjectIds}
          onAddProject={handleAddProject}
          onRemoveProject={handleRemoveProject}
        >
          <Button
            type="button"
            className="h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Projects
          </Button>
        </ProjectListingDrawer>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wide">
                    {project.eventName || project.code || "Untitled Project"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                      {project.projectTypeName}
                    </span>
                    {/* StartDate removed as it is not present on Project type */}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveProject(project._id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] border border-dashed border-white/10 rounded-2xl bg-white/2">
          <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8 text-white/20" />
          </div>
          <h3 className="text-lg font-black text-white/40 uppercase tracking-widest mb-2">
            No Projects Selected
          </h3>
          <p className="text-sm text-white/30 max-w-xs text-center mb-6">
            Please select at least one project to continue with the quotation process.
          </p>
          <ProjectListingDrawer
            clientId={formData.step1.clientId}
            selectedProjectIds={selectedProjectIds}
            onAddProject={handleAddProject}
            onRemoveProject={handleRemoveProject}
          >
            <Button
              type="button"
              className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Select First Project
            </Button>
          </ProjectListingDrawer>
        </div>
      )}
    </div>
  );
}
