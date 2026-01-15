"use client";

import { motion } from "motion/react";
import { Briefcase, X } from "lucide-react";
import { ProjectListingDrawer } from "./project-list";
import type { Project } from "../../types";

interface InvolvedProjectsProps {
  projects: Project[] | undefined;
  selectedProjectIds: string[];
  filteredProjects: Project[];
  clientId?: string;
  onAddProject: (id: string) => void;
  onRemoveProject: (id: string) => void;
}

export function InvolvedProjects({
  projects,
  selectedProjectIds,
  filteredProjects,
  clientId,
  onAddProject,
  onRemoveProject,
}: InvolvedProjectsProps) {
  return (
    <div className="mb-8 p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
          <Briefcase className="h-3.5 w-3.5 text-primary" /> Involved Projects
        </h3>
        <div className="flex items-center gap-4">
          <ProjectListingDrawer
            clientId={clientId || ""}
            selectedProjectIds={selectedProjectIds}
            onAddProject={onAddProject}
            onRemoveProject={onRemoveProject}
          />
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
              onClick={() => onRemoveProject(project._id)}
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
  );
}
