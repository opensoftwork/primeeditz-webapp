"use client";

import { motion } from "motion/react";
import { Briefcase, X, FolderOpen } from "lucide-react";
import { ProjectListingDrawer } from "./project-list";
import type { Project } from "../../types";

interface InvolvedProjectsProps {
  projects: Project[] | undefined;
  selectedProjectIds: string[];
  filteredProjects: Project[];
  studioId?: string;
  onAddProject: (id: string) => void;
  onRemoveProject: (id: string) => void;
}

export function InvolvedProjects({
  projects,
  selectedProjectIds,
  filteredProjects,
  studioId,
  onAddProject,
  onRemoveProject,
}: InvolvedProjectsProps) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-white/2 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FolderOpen className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-white">
              Involved Projects
            </h3>
            <p className="text-[10px] text-white/30 font-medium">
              Link line items to specific client projects
            </p>
          </div>
        </div>
        <ProjectListingDrawer
          studioId={studioId || ""}
          selectedProjectIds={selectedProjectIds}
          onAddProject={onAddProject}
          onRemoveProject={onRemoveProject}
        />
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/20 group"
            >
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[11px] font-bold text-primary">
                  {project.eventName || project.code}
                </span>
                <span className="text-[9px] text-white/30 font-medium uppercase">
                  {project.projectTypeName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveProject(project._id)}
                className="p-0.5 rounded hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </motion.div>
          ))
        ) : (
          <div className="flex items-center gap-2 py-2">
            <Briefcase className="h-3.5 w-3.5 text-white/20" />
            <p className="text-[11px] font-medium text-white/30 italic">
              No projects linked — services will be marked as general
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
