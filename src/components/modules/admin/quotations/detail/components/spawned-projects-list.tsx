"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ExternalLink, Rocket, Shield, Clock, LayoutGrid } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SpawnedProjectsListProps {
  quotationId: string;
}

export function SpawnedProjectsList({
  quotationId,
}: SpawnedProjectsListProps) {
  const projects = useQuery(api.functions.projects.queries.getByQuotationId, {
    quotationId: quotationId as Id<"quotations">,
  });

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-8 mt-10 border-t border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black uppercase tracking-tight text-white leading-none">
              Generated Projects
            </h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1.5">
              {projects.length} PIPELINE{projects.length !== 1 ? "S" : ""} INITIALIZED
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project: any, index: number) => (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative"
          >
            <Link 
              href={`/projects/${project._id}`}
              className="block relative"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 group-hover:border-indigo-500/30 backdrop-blur-xl transition-all duration-500 overflow-hidden">
                {/* Decorative Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 blur-3xl rounded-full translate-x-12 -translate-y-12 group-hover:bg-indigo-500/10 transition-colors duration-500" />

                <div className="flex items-center gap-4 relative z-10">
                  <div className="h-12 w-12 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all duration-500">
                    <LayoutGrid className="h-5 w-5 text-indigo-400/40 group-hover:text-indigo-400 transition-all duration-500" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/60">
                        {project.code}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-white/10" />
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        {project.projectTypeName || "Project"}
                      </span>
                    </div>
                    
                    <h4 className="text-base font-black text-white uppercase tracking-tight group-hover:text-white transition-colors truncate max-w-[180px]">
                      {project.eventName || "Untitled Project"}
                    </h4>

                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                        "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm"
                      )}>
                        {project.phase}
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] font-bold text-white/20 uppercase tracking-widest">
                        <Clock className="h-3 w-3" />
                        {project.actionState.replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/60 group-hover:bg-transparent group-hover:text-indigo-400 group-hover:border-indigo-500/30 group-hover:-translate-y-1.5 transition-all duration-300 relative z-10 shadow-lg">
                  <ExternalLink className="h-4 w-4" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
