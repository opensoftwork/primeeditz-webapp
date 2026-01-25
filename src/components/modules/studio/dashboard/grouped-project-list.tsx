"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User,
  ChevronRight,
  Clock,
  Calendar,
  Layers,
  Zap,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { StudioStatusBadge } from "../../projects/studio-status-badge";
import { PhaseProgress } from "../../projects/phase-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GroupedProjectList() {
  const groupedProjects = useQuery(
    api.functions.projects.queries.getMyProjectsGroupedByEndClient,
  );

  if (groupedProjects === undefined) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-48 bg-white/5" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-48 rounded-4xl bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groupedProjects.length === 0) {
    return (
      <div className="py-20 text-center space-y-6 rounded-[2.5rem] border border-white/5 bg-white/2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-grid-white/[0.01] mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-4 rounded-3xl bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-500">
            <Zap className="h-10 w-10 text-white/20" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-white/50">
            No Production History
          </h3>
          <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-2 max-w-xs mx-auto">
            Once you request an engagement and it's approved, your projects will
            appear here grouped by end client.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {groupedProjects.map((group, groupIdx) => (
        <motion.section
          key={group.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIdx * 0.1 }}
          className="space-y-8"
        >
          {/* Group Header */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <User className="h-6 w-6 text-white/40" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                  {group.name}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                    {group.count} Project{group.count > 1 ? "s" : ""}
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Last update{" "}
                    {new Date(group.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/projects?client=${encodeURIComponent(group.name)}`}
              className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              Client History
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Project List / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {group.projects.map((project: any, pIdx: number) => (
              <ProjectCard key={project._id} project={project} index={pIdx} />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}

function ProjectCard({ project, index }: { project: any; index: number }) {
  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative h-full bg-white/3 border border-white/5 rounded-[2.5rem] p-8 hover:bg-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col"
      >
        {/* Hover Highlight Effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[80px] rounded-full translate-x-24 -translate-y-24 group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-6 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                {project.eventName || project.projectTypeName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                  {project.code}
                </span>
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em]">
                  {project.projectTypeName}
                </span>
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
            {project.eventDate && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Calendar className="h-3.5 w-3.5 text-white/20" />
                {new Date(project.eventDate).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              <Layers className="h-3.5 w-3.5 text-white/20" />
              {project.phase}
            </div>
          </div>

          <div className="flex-1" />

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
                Production Progress
              </span>
              <span className="text-[9px] font-black text-primary uppercase">
                {project.phase}
              </span>
            </div>
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          {/* Onboarding Action (Story 11C.4 & 11C.5) */}
          {(project.phase === "setup" || project.phase === "onboarding") && (
            <div className="pt-6">
              <Link href={`/projects/${project._id}/onboarding`}>
                <Button className="w-full h-11 rounded-2xl bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 gap-2">
                  <Rocket className="h-4 w-4" />
                  Resume Onboarding
                </Button>
              </Link>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-white/5 mt-auto flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest leading-none">
              {project.phase === "setup" ? "Approved" : "Started"}{" "}
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-all">
              Details{" "}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
