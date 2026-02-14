"use client";

import type { Id } from "@convex/_generated/dataModel";
import { ArrowLeft, Layout, Loader2, Save } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProjectTypeWizardProvider,
  useProjectTypeWizard,
} from "../wizard/wizard-context";
import { Step1Identity } from "../wizard/steps/step-1-identity";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

interface ProjectTypeEditViewProps {
  projectTypeId: Id<"projectTypes">;
}

export default function ProjectTypeEditView({
  projectTypeId,
}: ProjectTypeEditViewProps) {
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
  const { handleSubmit, isSubmitting, step1Data, isEditing, isValid } =
    useProjectTypeWizard();

  if (isEditing && !step1Data) {
    return <EditSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-8 p-6 md:p-12 relative min-h-screen bg-transparent"
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col gap-8 border-b border-white/5 pb-8"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <Link href={`/settings/project-types/${projectTypeId}`}>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 border-white/10 shrink-0 transition-all hover:scale-105"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-125 group-hover:bg-primary/30 transition-all opacity-50" />
                <div className="relative w-14 h-14 rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all shadow-xl shadow-primary/10">
                  <Layout className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/60">
                    System Configuration
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/20" />
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                    ID: {step1Data?.name || "..."}
                  </span>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                  Edit Project Type
                </h1>
                <p className="text-[11px] font-bold text-white/40 uppercase tracking-wide">
                  Configure core identity and system behavior
                </p>
              </div>
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
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="w-full"
      >
        <Step1Identity compact={true} />
      </motion.div>
    </motion.div>
  );
}

function EditSkeleton() {
  return (
    <div className="w-full space-y-10 p-6 md:p-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-8 w-64 bg-white/5" />
          </div>
        </div>
        <Skeleton className="h-12 w-32 rounded-2xl bg-white/5" />
      </div>
      <div className="space-y-6 w-full">
        <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
        <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
          <Skeleton className="h-12 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
