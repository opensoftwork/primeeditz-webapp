"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  CheckCheck,
  ChevronLeft,
  FolderOpen,
  MessageSquare,
  Shield,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectSpecs } from "@/components/modules/admin/projects/project-detail/project-specs";
import { ReferenceMaterials } from "@/components/modules/projects/detail/reference-materials";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FinalizeWorkDrawer } from "./finalize-work-drawer";
import { SquadMemberCard } from "./squad-member-card";

interface EmployeeProjectDetailProps {
  projectId: string;
}

export default function EmployeeProjectDetail({
  projectId,
}: EmployeeProjectDetailProps) {
  const router = useRouter();
  const [isFinalizeOpen, setIsFinalizeOpen] = useState(false);

  const project = useQuery(api.employees.getEmployeeProject, {
    projectId: projectId as Id<"projects">,
  });

  if (project === undefined) return <EmployeeProjectDetailSkeleton />;

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <h2 className="text-2xl font-black uppercase text-white">
          Project Not Found
        </h2>
        <Button onClick={() => router.back()}>GO BACK</Button>
      </div>
    );
  }

  const { squad, projectTypeName, currentMemberRole, isLead } = project;

  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full animate-in fade-in slide-in-from-bottom-5">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-0 hover:bg-transparent text-white/40 hover:text-white flex items-center gap-2 group mb-2"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Back to Dashboard
            </span>
          </Button>
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
              <Shield className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
                  {project.eventName}
                </h1>
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest mt-1">
                  {currentMemberRole}
                </span>
              </div>
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mt-2">
                PROJECT: {project.code} — {projectTypeName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            className="rounded-2xl h-14 border-white/5 bg-white/2 gap-3 px-6 hover:bg-white/5"
            onClick={() => setIsFinalizeOpen(true)}
          >
            <CheckCheck className="h-4 w-4 text-white/40" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Finalize Work
            </span>
          </Button>

          <Button
            variant="outline"
            className="rounded-2xl h-14 border-white/5 bg-white/2 gap-3 px-6 hover:bg-white/5"
          >
            <MessageSquare className="h-4 w-4 text-white/40" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Squad Chat
            </span>
          </Button>
          <Button
            className="rounded-2xl h-14 bg-indigo-600 hover:bg-indigo-500 text-white gap-3 px-8 shadow-lg shadow-indigo-600/20"
            onClick={() => router.push(`/assigned-work/${projectId}/folders`)}
          >
            <FolderOpen className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Open Assets
            </span>
          </Button>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Production Feed */}
          <div className="lg:col-span-8 space-y-12">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/50 border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Shield className="h-24 w-24" />
              </div>
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                    Production Live
                  </h4>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                  Active Stage: {project.actionState.replace(/_/g, " ")}
                </h2>
                <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed max-w-md">
                  You are currently in the product feed. Use the control center
                  in the header to manage transitions or finalize your work.
                </p>
              </div>
            </div>
          </div>

          {/* Squad Sidebar */}
          <div className="lg:col-span-4 space-y-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-white">
                    Project Squad
                  </h3>
                </div>
                <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                  {squad.length} Members
                </span>
              </div>

              <div className="space-y-4">
                {squad.map((member) => (
                  <SquadMemberCard key={member._id} member={member} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Project Specs */}
        <ProjectSpecs project={project as any} />

        {/* Standardized Project Reference - Full Width with signing capability */}
        <ReferenceMaterials files={project.referenceFiles as any} />
      </div>

      <FinalizeWorkDrawer
        open={isFinalizeOpen}
        onOpenChange={setIsFinalizeOpen}
        projectId={projectId}
        projectName={project.eventName || project.code}
      />
    </div>
  );
}

function EmployeeProjectDetailSkeleton() {
  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full">
      <Skeleton className="h-32 w-full rounded-3xl bg-white/5" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <Skeleton className="h-64 w-full rounded-[2.5rem] bg-white/5" />
          <Skeleton className="h-64 w-full rounded-[2.5rem] bg-white/5" />
        </div>
        <div className="lg:col-span-4 space-y-10">
          <Skeleton className="h-96 w-full rounded-[2.5rem] bg-white/5" />
        </div>
      </div>
    </div>
  );
}
