"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { ExternalLink, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SpawnedProjectsListProps {
  quotationId: string;
  isAdmin?: boolean;
}

/**
 * Component to display projects that were spawned from a specific quotation.
 * Typically shown on the Quotation Detail page once approved.
 */
export function SpawnedProjectsList({
  quotationId,
  isAdmin = false,
}: SpawnedProjectsListProps) {
  const projects = useQuery(api.functions.projects.queries.getByQuotationId, {
    quotationId: quotationId as Id<"quotations">,
  });

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 pt-8 mt-8 border-t border-white/5">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Rocket className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase tracking-tight text-white mb-0.5">
            Generated Projects
          </h3>
          <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
            {projects.length} project{projects.length !== 1 ? "s" : ""}{" "}
            initialized from this quotation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project._id}
            className="flex items-center justify-between p-4 rounded-3xl bg-white/2 border border-white/5 group hover:border-primary/20 hover:bg-white/5 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 blur-2xl rounded-full translate-x-12 -translate-y-12" />

            <div className="flex flex-col relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-0.5">
                {project.code}
              </span>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate max-w-[180px]">
                {project.eventName || project.projectTypeName}
              </h4>
              <div className="flex items-center gap-2 mt-1.5">
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                    "bg-white/5 text-white/40 border border-white/5",
                  )}
                >
                  {project.phase}
                </div>
                <span className="text-[9px] font-medium text-white/20 uppercase tracking-widest">
                  {project.actionState.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all relative z-10"
            >
              <Link href={`/projects/${project._id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
