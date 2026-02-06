"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Calendar, ChevronRight, Eye, Hash, Users } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { DataTableSkeleton } from "@/components/shared/data-table";
import { PhaseProgress } from "../phase-progress";
import { StudioStatusBadge } from "../studio-status-badge";

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
  const router = useRouter();
  const needsOnboarding = project.actionState === "awaiting_onboarding";

  return (
    <Link
      href={
        needsOnboarding
          ? `/projects/${project._id}/onboarding`
          : `/projects/${project._id}`
      }
    >
      <motion.div
        whileHover={{ y: -2 }}
        className="group relative p-4 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Hash className="h-2.5 w-2.5 text-primary/40" />
                <span className="text-[13px] font-black text-white group-hover:text-primary transition-colors tracking-tighter truncate">
                  {project.code}
                </span>
              </div>
              <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.15em]">
                {project.projectTypeName}
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          <div className="space-y-0.5">
            <h3 className="text-[14px] font-black text-white leading-tight uppercase tracking-tight truncate">
              {project.eventName || "General Project"}
            </h3>
            {project.eventDate && (
              <div className="flex items-center gap-1 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                <Calendar className="h-2.5 w-2.5" />
                {new Date(project.eventDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-white/5">
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5">
              From Quotation
            </span>
            <div className="flex items-center gap-1 text-[8px] font-black text-primary/60 group-hover:text-primary transition-colors uppercase tracking-[0.15em]">
              View <ChevronRight className="h-2 w-2" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
