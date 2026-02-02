"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  Save,
  Loader2,
  Layout,
  FolderTree,
  Info,
  ChevronRight,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  ProjectTypeWizardProvider,
  useProjectTypeWizard,
} from "../wizard/wizard-context";
import { Step1Identity } from "../wizard/steps/step-1-identity";
import { Step2Folders } from "../wizard/steps/step-2-folders";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ProjectTypeEditorProps {
  projectTypeId: Id<"projectTypes">;
}

export default function ProjectTypeEditor({
  projectTypeId,
}: ProjectTypeEditorProps) {
  return (
    <ProjectTypeWizardProvider projectTypeId={projectTypeId}>
      <EditorContent projectTypeId={projectTypeId} />
    </ProjectTypeWizardProvider>
  );
}

function EditorContent({
  projectTypeId,
}: {
  projectTypeId: Id<"projectTypes">;
}) {
  const { handleSubmit, isSubmitting, step1Data, folders, isEditing, isValid } =
    useProjectTypeWizard();

  if (isEditing && !step1Data) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 gap-6">
          <Skeleton className="h-[250px] rounded-[24px] bg-white/5" />
          <Skeleton className="h-[400px] rounded-[24px] bg-white/5" />
        </div>
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
                Engine Configuration
              </span>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                System Core
              </span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white xl:text-4xl leading-none">
              {step1Data?.name || "Project Type"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="h-12 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                <span>Save Identity</span>
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* 2. Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 pb-24 overflow-y-auto bg-white/2">
        <div className="flex flex-col gap-8">
          {/* Identity Section - Now the primary focus of this editor */}
          <section className="bg-zinc-950/40 rounded-4xl overflow-hidden group hover:bg-white/5 transition-all glass-subtle shadow-2xl">
            <div className="p-8 bg-white/3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-primary/5 group-hover:scale-105 transition-transform">
                  <Layout className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-white">
                    Engine Identity
                  </h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 leading-none mt-1">
                    System classification & metadata
                  </p>
                </div>
              </div>
            </div>
            <div className="p-10">
              <Step1Identity compact={true} />
            </div>
          </section>
        </div>
      </main>

      {/* Global CSS to clean up nested components */}
      <style
        key="editor-styles"
        dangerouslySetInnerHTML={{
          __html: `
        /* Hide step numbers and redundant headers */
        .identity-step-indicator,
        .folder-step-indicator,
        .shrink-0.flex.items-center.gap-4.pb-4,
        header.shrink-0.flex.items-center.gap-4.pb-4 {
          display: none !important;
        }

        /* Compact form elements */
        form.flex-1.flex.flex-col.gap-6 { gap: 1rem !important; }
        .grid.grid-cols-1.md\\:grid-cols-2.gap-6 { gap: 1rem !important; }
        .space-y-3 { space-y: 0.5rem !important; }
        
        /* Compact FolderTree */
        .space-y-8 { space-y: 1.5rem !important; }
        .flex.flex-col.gap-4.border-b.pb-6 { pb: 1rem !important; mb: 1rem !important; }
      `,
        }}
      />
    </div>
  );
}
