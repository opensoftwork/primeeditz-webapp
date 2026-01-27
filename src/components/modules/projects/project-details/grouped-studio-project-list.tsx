"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Calendar, ChevronRight, Eye, Hash, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo } from "react";
import { StudioStatusBadge } from "../studio-status-badge";
import { PhaseProgress } from "../phase-progress";
import { DataTableSkeleton } from "@/components/shared/data-table";

/**
 * Revamped Studio Projects view: Grouped by End Client.
 * Story 11C.3 implementation.
 */
export function GroupedStudioProjectList() {
  const groupedProjects = useQuery(
    api.functions.projects.queries.getMyProjectsGroupedByEndClient,
  );

  if (groupedProjects === undefined) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        <DataTableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  if (groupedProjects.length === 0) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
          <Users className="h-10 w-10 text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            No Projects Yet
          </h2>
          <p className="text-white/40 max-w-md">
            Your production journey starts with a quotation. Request a quote to
            initiate your first project manifest.
          </p>
        </div>
        <Link href="/quotations/new">
          <button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.05] active:scale-[0.95] transition-all shadow-xl shadow-primary/20">
            REQUEST A QUOTE
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 md:p-12 w-full space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            PRODUCTION CONTEXT
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            My Projects
          </h1>
        </div>
        <Link href="/quotations/new">
          <button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
            NEW REQUEST
          </button>
        </Link>
      </div>

      <div className="space-y-16">
        {groupedProjects.map((group, idx) => (
          <motion.section
            key={group.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-6"
          >
            {/* Group Header */}
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                  {group.name}
                </h2>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                  {group.count} {group.count === 1 ? "Project" : "Projects"} •
                  Last Updated{" "}
                  {new Date(group.lastUpdated).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {group.projects.map((project: any) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  const needsOnboarding = project.actionState === "awaiting_uploads";

  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative p-6 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full translate-x-12 -translate-y-12 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Hash className="h-3 w-3 text-primary/40" />
                <span className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tighter">
                  {project.code}
                </span>
              </div>
              <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                {project.projectTypeName}
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white leading-tight uppercase tracking-tight">
              {project.eventName || "General Project"}
            </h3>
            {project.eventDate && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                <Calendar className="h-3 w-3" />
                {new Date(project.eventDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {needsOnboarding ? (
            <Link
              href={`/projects/${project._id}/onboarding`}
              className="block"
            >
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group/onb">
                <p className="text-[10px] font-bold text-primary leading-relaxed text-center uppercase tracking-widest italic flex items-center justify-center gap-2">
                  Complete Onboarding{" "}
                  <ChevronRight className="h-3 w-3 group-hover/onb:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>
          ) : (
            <div className="h-[52px]" /> /* Spacer to keep layout consistent */
          )}

          <div className="mt-auto pt-6 border-t border-white/5">
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest px-2 py-1 rounded-md bg-white/5">
              Spawned from Quotation
            </span>
            <div className="flex items-center gap-1 text-[10px] font-black text-primary/60 group-hover:text-primary transition-colors uppercase tracking-[0.2em]">
              VIEW Details <ChevronRight className="h-3 w-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
