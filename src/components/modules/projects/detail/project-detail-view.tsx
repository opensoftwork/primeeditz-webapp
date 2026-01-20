"use client";

/**
 * Project Detail View Component
 *
 * Displays comprehensive details of a submitted project for clients.
 * Refactored into modular sub-components for better maintainability.
 */

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { type Id } from "@convex/_generated/dataModel";
import { motion } from "motion/react";

// Modular Components
import { ProjectHeader } from "./header";
import { ProjectSpecifications } from "./specifications";
import { ReferenceMaterials } from "./reference-materials";
import { AssetsSection } from "./assets-section";
import { DetailSidebar } from "./sidebar";

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const project = useQuery(api.functions.projects.queries.getProject, {
    projectId: projectId as Id<"projects">,
  });

  const fields = useQuery(
    api.functions.projectTypeFields.queries.getFieldsByProjectType,
    project?.projectTypeId ? { projectTypeId: project.projectTypeId } : "skip",
  );

  if (project === undefined) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="p-6 rounded-full bg-white/5 border border-white/10">
          <Database className="h-12 w-12 text-white/20" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
          Project Not Found
        </h2>
        <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
          The project you are looking for does not exist or you don't have
          access.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-xl border-white/10 bg-white/2 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
        >
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-12 p-6 md:p-12 relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <ProjectHeader
          code={project.code}
          eventName={project.eventName}
          endClientName={project.endClientName}
          status={project.actionState}
        />
      </motion.div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-8 space-y-12"
        >
          <ProjectSpecifications project={project} fields={fields} />
          <ReferenceMaterials files={project.referenceFiles} />

          {project.phase !== "setup" && <AssetsSection projectId={projectId} />}
        </motion.div>

        {/* Sidebar Column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="lg:col-span-4"
        >
          <DetailSidebar project={project} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Internal Components
// ============================================================================

function ProjectDetailSkeleton() {
  return (
    <div className="w-full space-y-10 p-6 md:p-12">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-48 bg-white/5" />
        <Skeleton className="h-8 w-32 bg-white/5 rounded-lg" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-24 bg-white/5" />
        <Skeleton className="h-12 w-3/4 bg-white/5 rounded-xl" />
        <Skeleton className="h-4 w-48 bg-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12">
          <Skeleton className="h-[400px] w-full bg-white/5 rounded-[2.5rem]" />
          <Skeleton className="h-[300px] w-full bg-white/5 rounded-[2.5rem]" />
        </div>
        <div className="lg:col-span-4 space-y-10">
          <Skeleton className="h-[500px] w-full bg-white/5 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
