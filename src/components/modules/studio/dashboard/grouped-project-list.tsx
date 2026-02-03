"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Calendar,
  ChevronRight,
  Clock,
  Layers,
  Rocket,
  User,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { PhaseProgress } from "../../projects/phase-progress";
import { StudioStatusBadge } from "../../projects/studio-status-badge";

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
        whileHover={{ y: -3 }}
        className={cn(
          "group relative h-full rounded-2xl p-5 transition-all duration-300 overflow-hidden flex flex-col",
          project.actionState === "awaiting_uploads"
            ? "bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40"
            : "bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/30",
        )}
      >
        {/* Hover Highlight Effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative z-10 space-y-4 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <h3 className="text-base font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors truncate">
                {project.eventName || project.projectTypeName}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em]">
                  {project.code}
                </span>
                <div className="h-0.5 w-0.5 rounded-full bg-white/10" />
                <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.15em] truncate">
                  {project.projectTypeName}
                </span>
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 pt-3 border-t border-white/5">
            {project.eventDate && (
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                <Calendar className="h-3 w-3 text-white/20" />
                {new Date(project.eventDate).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-[9px] font-bold text-white/40 uppercase tracking-widest">
              <Layers className="h-3 w-3 text-white/20" />
              {project.phase}
            </div>
          </div>

          <div className="flex-1 min-h-2" />

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
                Progress
              </span>
              <span className="text-[8px] font-black text-primary uppercase">
                {project.phase}
              </span>
            </div>
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          {/* Onboarding Action (Story 11C.4 & 11C.5) */}
          {project.actionState === "awaiting_uploads" ? (
            <div className="pt-4">
              <Link href={`/projects/${project._id}/onboarding`}>
                <Button className="w-full h-9 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[9px] hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 gap-2">
                  <Rocket className="h-3.5 w-3.5" />
                  Complete Onboarding
                </Button>
              </Link>
            </div>
          ) : (
            (project.phase === "setup" || project.phase === "onboarding") && (
              <div className="pt-4">
                <Link href={`/projects/${project._id}/onboarding`}>
                  <Button className="w-full h-9 rounded-xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all gap-2">
                    <Rocket className="h-3.5 w-3.5 opacity-40" />
                    Resume Onboarding
                  </Button>
                </Link>
              </div>
            )
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/5 mt-auto flex items-center justify-between">
            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest leading-none">
              {project.phase === "setup" ? "Approved" : "Started"}{" "}
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-all">
              View{" "}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
