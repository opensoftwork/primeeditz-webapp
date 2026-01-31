"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  Boxes,
  Save,
  Loader2,
  Layout,
  FolderTree,
  Info,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ProjectTypeWizardProvider,
  useProjectTypeWizard,
} from "../wizard/wizard-context";
import { Step1Identity } from "../wizard/steps/step-1-identity";
import { Step2Folders } from "../wizard/steps/step-2-folders";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ProjectTypeEditorProps {
  projectTypeId: Id<"projectTypes">;
}

export default function ProjectTypeEditor({
  projectTypeId,
}: ProjectTypeEditorProps) {
  return (
    <ProjectTypeWizardProvider projectTypeId={projectTypeId}>
      <EditorContent />
    </ProjectTypeWizardProvider>
  );
}

function EditorContent() {
  const router = useRouter();
  const { handleSubmit, isSubmitting, step1Data, folders, isEditing } =
    useProjectTypeWizard();

  // We can't easily reuse Step1Identity because it has its own "Next Stage" logic
  // and form submission. We'll create a version that's more suitable for this page
  // or just use them if we can intercept the submission.

  // Actually, let's create a custom layout for this page.

  if (isEditing && !step1Data) {
    return (
      <div className="h-screen bg-zinc-950 p-12 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-48 bg-white/5" />
          <Skeleton className="h-10 w-24 bg-white/5" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[600px] rounded-[32px] bg-white/5" />
          <Skeleton className="h-[600px] rounded-[32px] bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white selection:bg-primary/20 flex flex-col">
      {/* 1. Editor Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/settings/project-types">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Engine Configuration
                </span>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  {step1Data?.name || "Loading..."}
                </span>
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter text-white mt-0.5">
                Edit Project Type
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/settings/project-types")}
              className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(var(--primary),0.2)] hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-[1600px] mx-auto">
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Identity & Metadata (4 cols) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-10">
              <section className="relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-primary/20 to-purple-500/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative bg-white/3 border border-white/5 rounded-[32px] overflow-hidden">
                  <div className="p-8 border-b border-white/5 bg-white/2">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Layout className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black uppercase tracking-tight text-white">
                          Identity & Info
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                          Basic project engine parameters
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* We'll use a modified version of Step1Identity here that doesn't 
                        handle its own submission or we'll just let it update context */}
                    <Step1Identity />
                  </div>
                </div>
              </section>

              {/* Tips/Documentation Section */}
              <section className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                    Configuration Tips
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Keep names descriptive for studio portal selection.",
                    "Icons help in visual identification across the dashboard.",
                    "Descriptions are shown to clients during project initialization.",
                    "Status determines visibility in the active service catalog.",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ChevronRight className="h-3 w-3 text-primary/40 mt-0.5 shrink-0" />
                      <p className="text-[11px] font-medium text-white/60 leading-relaxed uppercase tracking-wider">
                        {tip}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Right Column: Hierarchy & Workflow (8 cols) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-10 h-full flex flex-col">
              <section className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500/20 to-primary/20 rounded-[40px] opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative h-full bg-white/3 border border-white/5 rounded-[32px] flex flex-col overflow-hidden">
                  <div className="p-8 border-b border-white/5 bg-white/2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                          <FolderTree className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <h2 className="text-lg font-black uppercase tracking-tight text-white">
                            Folder Template
                          </h2>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                            Pre-defined delivery directory structure
                          </p>
                        </div>
                      </div>

                      {folders.length > 0 && (
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {folders.length} Root Directories
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-8 flex-1 min-h-[600px] overflow-hidden">
                    <Step2Folders />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* 3. Global Action Footer (Optional, since we have header) */}
      <footer className="shrink-0 border-t border-white/5 bg-zinc-950/50 backdrop-blur-md px-12 py-6 flex items-center justify-end">
        <p className="mr-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">
          Draft changes are automatically synced to the engine context.
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-14 px-12 rounded-2xl bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-widest text-[10px] transition-all shadow-[0_10px_40px_rgba(255,255,255,0.1)] group flex items-center gap-3"
        >
          {isSubmitting ? "Processing..." : "Finalize Update"}
          {!isSubmitting && (
            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          )}
        </Button>
      </footer>

      {/* Hide the Step Header in the components since we have our own headers */}
      <style jsx global>{`
        .shrink-0.flex.items-center.gap-4.pb-4,
        .shrink-0.flex.items-center.justify-between.pb-4 {
          display: none !important;
        }

        /* Make Step1Identity form take natural height */
        .Step1Identity-form {
          flex: none !important;
        }

        /* Adjust FolderTree container in this page */
        .flex-1.min-h-0.bg-zinc-950/30.rounded-2xl {
          height: auto !important;
          max-height: 800px;
        }
      `}</style>
    </div>
  );
}
