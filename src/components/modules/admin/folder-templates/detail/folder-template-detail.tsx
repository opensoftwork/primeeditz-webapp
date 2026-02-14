"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Loader2,
  FolderTree,
  Edit3,
  ChevronLeft,
  Layout,
  Tag,
  Info,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { FolderTree as FolderTreeComponent } from "@/components/modules/admin/folder-templates/builder/folder-tree";
import { Badge } from "@/components/ui/badge";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useEffect } from "react";

interface FolderTemplateDetailProps {
  projectTypeId: Id<"projectTypes">;
  templateId: Id<"folderTemplates">;
}

export default function FolderTemplateDetail({
  projectTypeId,
  templateId,
}: FolderTemplateDetailProps) {
  const projectType = useQuery(api.functions.projectTypes.queries.getById, {
    id: projectTypeId,
  });
  const template = useQuery(api.functions.folderTemplates.queries.get, {
    id: templateId,
  });

  const { setOverride, removeOverride } = useBreadcrumbStore();

  useEffect(() => {
    if (projectType?.name) {
      setOverride(projectTypeId, projectType.name);
    }
    if (template?.name) {
      setOverride(templateId, template.name);
    }
    return () => {
      removeOverride(projectTypeId);
      removeOverride(templateId);
    };
  }, [
    projectType?.name,
    projectTypeId,
    template?.name,
    templateId,
    setOverride,
    removeOverride,
  ]);

  if (template === undefined || projectType === undefined) {
    return (
      <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-10 w-64 bg-white/5" />
          </div>
        </div>
        <Skeleton className="h-[500px] rounded-[32px] bg-white/5" />
      </div>
    );
  }

  if (template === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="p-4 rounded-full bg-red-500/10 mb-4">
          <FolderTree className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight">
          Template Not Found
        </h2>
        <Button
          asChild
          variant="outline"
          className="mt-6 rounded-xl border-white/10"
        >
          <Link href={`/settings/project-types/${projectTypeId}`}>
            Back to Project Type
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-transparent text-white selection:bg-primary/20">
      {/* 1. Page Header Area */}
      <div className="px-6 py-6 lg:px-10 lg:py-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 bg-white/1">
        <div className="flex items-center gap-5">
          <Link href={`/settings/project-types/${projectTypeId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border border-white/10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">
                Template Preview
              </span>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                {projectType?.name}
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white xl:text-4xl leading-none">
              {template.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 rounded-2xl border-white/10 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link
              href={`/settings/project-types/${projectTypeId}/folder-templates/${templateId}/edit`}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4 text-primary" />
              <span>Edit Structure</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 pb-24 overflow-y-auto">
        <div className="w-full mx-auto flex flex-col gap-8">
          {/* Template Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/3 border border-white/5 rounded-4xl p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5">
                <Layout className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                  Project Type
                </span>
                <p className="text-white font-black uppercase tracking-tight">
                  {projectType?.name}
                </p>
              </div>
            </div>
            <div className="bg-white/3 border border-white/5 rounded-4xl p-6 flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-xl shadow-blue-500/5">
                <Tag className="h-6 w-6 text-blue-400" />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                  Variant / Category
                </span>
                <p className="text-white font-black uppercase tracking-tight">
                  {template.variant || "Standard Architecture"}
                </p>
              </div>
            </div>
          </div>

          {/* Description if any */}
          {template.description && (
            <div className="p-8 rounded-4xl bg-white/2 border border-white/5">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20 mb-4">
                <Info className="h-3.5 w-3.5 text-primary" />
                Architecture Notes
              </div>
              <p className="text-white/50 font-medium leading-relaxed">
                {template.description}
              </p>
            </div>
          )}

          {/* Structure Preview Section */}
          <section className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden glass-subtle min-h-[500px]">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <FolderTree className="h-5 w-5 text-white/60" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight text-white">
                      Blueprint Architecture
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-1">
                      Immutable structure preview
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-xl border-white/5 bg-white/5 text-white/40 text-[10px] font-black px-4 py-2 uppercase tracking-widest"
                >
                  {template.folders.length} Root Volumes
                </Badge>
              </div>

              <FolderTreeComponent
                folders={template.folders}
                readOnly={true}
                onAddRoot={() => {}}
                onAddChild={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
                onDeleteBulk={() => {}}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
