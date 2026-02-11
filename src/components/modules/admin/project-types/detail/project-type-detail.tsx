"use client";

import { useEffect } from "react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Loader2,
  Layout,
  Settings,
  ArrowLeft,
  Tag,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FolderTemplatesList } from "../folder-templates";
import { format } from "date-fns";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";

interface ProjectTypeDetailProps {
  projectTypeId: Id<"projectTypes">;
}

export default function ProjectTypeDetail({
  projectTypeId,
}: ProjectTypeDetailProps) {
  const projectType = useQuery(api.functions.projectTypes.queries.getById, {
    id: projectTypeId,
  });

  const { setOverride, removeOverride } = useBreadcrumbStore();

  useEffect(() => {
    if (projectType?.name) {
      setOverride(projectTypeId, projectType.name);
    }
    return () => {
      removeOverride(projectTypeId);
    };
  }, [projectType?.name, projectTypeId, setOverride, removeOverride]);

  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const category = categories?.find((c) => c._id === projectType?.categoryId);

  if (projectType === undefined) {
    return (
      <div className="p-8 md:p-12 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-10 w-64 bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-3xl bg-white/5 md:col-span-2" />
          <Skeleton className="h-32 rounded-3xl bg-white/5" />
        </div>
        <Skeleton className="h-[400px] rounded-[32px] bg-white/5" />
      </div>
    );
  }

  if (projectType === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-4 rounded-full bg-red-500/10 mb-4">
          <Layout className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Project Type Not Found
        </h2>
        <p className="text-white/40 mt-2">
          The project type you are looking for does not exist or has been
          removed.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-xl border-white/10"
        >
          <Link href="/settings/project-types">Back to Project Types</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-transparent text-white selection:bg-primary/20">
      {/* 1. Integrated Hero Area - Clean & Borderless */}
      <section className="px-8 md:px-12 pt-6 md:pt-8 pb-0 flex flex-col gap-8">
        {/* Navigation & Core Identification Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              asChild
              className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0"
            >
              <Link href="/settings/project-types">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-all opacity-50" />
                <div className="relative w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all shadow-xl shadow-primary/10">
                  <DynamicIcon
                    name={projectType.icon || "Package"}
                    className="h-5 w-5 text-primary"
                  />
                </div>
              </div>

              <div className="space-y-0">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary/60">
                    Engine View • ID: {projectTypeId.slice(0, 8)}...
                  </span>
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                  {projectType.name}
                </h1>
                <h4 className="text-[11px] font-black text-white/30 uppercase tracking-tight">
                  {category?.name || "General Engine"}
                </h4>
              </div>
            </div>
          </div>

          <Link href={`/settings/project-types/${projectTypeId}/edit`}>
            <Button className="h-10 px-5 rounded-lg bg-zinc-950/40 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] transition-all hover:bg-white/5 active:scale-95 flex items-center gap-2">
              <Settings className="h-3.5 w-3.5 text-primary" />
              <span>Modify Configuration</span>
            </Button>
          </Link>
        </div>

        {/* Visual Identity & Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Badge
              className={cn(
                "font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg",
                projectType.isActive
                  ? "bg-green-500/10 text-green-500 border-green-500/20"
                  : "bg-white/5 text-white/40 border-white/5",
              )}
            >
              {projectType.isActive ? "System Active" : "System Offline"}
            </Badge>
            <div className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[9px] font-black text-white/30 uppercase tracking-widest">
              v1.0.0 Stable
            </div>
          </div>
        </div>
      </section>

      {/* 2. Folder Templates Section */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <FolderTemplatesList projectTypeId={projectTypeId} minimal={true} />
      </main>
    </div>
  );
}
