"use client";

import { useProjectTypeWizard } from "../wizard-context";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pencil,
  FolderTree,
  Tag,
  Loader2,
  Save,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import type { FolderLevel1, FolderLevel2, FolderLevel3 } from "@convex/schema";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function Step3Review() {
  const {
    step1Data,
    folders,
    goToStep,
    handleSubmit,
    saveDraft,
    isSubmitting,
    isSavingDraft,
    isEditing,
  } = useProjectTypeWizard();

  // Get category name
  const categories = useQuery(
    api.functions.projectCategories.queries.getActiveCategories,
  );
  const categoryName = useMemo(() => {
    if (!categories || !step1Data?.categoryId) return "—";
    return categories.find((c) => c._id === step1Data.categoryId)?.name || "—";
  }, [categories, step1Data?.categoryId]);

  const folderStats = useMemo(() => calculateFolderStats(folders), [folders]);

  const isLoading = isSubmitting || isSavingDraft;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Step Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 rounded-full bg-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
            Step 03
          </span>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-white">
          Review & Finalize
        </h2>
        <p className="text-sm text-white/40 font-medium leading-relaxed max-w-lg">
          Double check your project type configuration and folder structure
          before committing to the system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Project Type Summary Card */}
        <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle shadow-2xl shadow-black/50">
          <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-white/5 bg-white/3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <Tag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tighter text-white">
                  Type Identity
                </CardTitle>
                <p className="text-[10px] uppercase tracking-widest text-white/20 font-black">
                  Basic Information
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(1)}
              disabled={isLoading}
              className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-2 transition-all active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <SummaryField label="Type Name" value={step1Data?.name || "—"} />
              <SummaryField label="Category" value={categoryName} />
              <div className="sm:col-span-2">
                <SummaryField
                  label="Description"
                  value={step1Data?.description || "No description provided."}
                />
              </div>
              <SummaryField
                label="Icon Reference"
                value={step1Data?.icon || "Default Icon"}
              />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                  Initial Status
                </span>
                <div>
                  {step1Data?.isActive ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                        Active Type
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-500/10 border border-zinc-500/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Inactive
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Folder Structure Summary Card */}
        <Card className="bg-zinc-900/40 border-white/5 rounded-[32px] overflow-hidden glass-subtle shadow-2xl shadow-black/50">
          <CardHeader className="flex flex-row items-center justify-between p-8 border-b border-white/5 bg-white/3">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tighter text-white">
                  Directory Layout
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">
                    {folderStats.total} Folders
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/10" />
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-black">
                    {folderStats.levels} Level Hierarchy
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(2)}
              disabled={isLoading}
              className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 rounded-xl gap-2 transition-all active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-1 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {folders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border border-dashed border-white/5 rounded-2xl bg-white/2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    No folders configured
                  </p>
                </div>
              ) : (
                folders.map((folder, idx) => (
                  <FolderPreviewItem key={idx} folder={folder} level={0} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-12 border-t border-white/5">
        <Button
          variant="outline"
          onClick={saveDraft}
          disabled={isLoading}
          className="h-14 px-8 rounded-2xl border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 font-black uppercase tracking-widest text-[10px] gap-3 transition-all active:scale-95"
        >
          {isSavingDraft ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Persisting Progress...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Progress as Draft
            </>
          )}
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || folders.length === 0}
          className="h-14 px-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 gap-3 transition-all hover:scale-[1.02] active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Synchronizing Updates..." : "Initializing Type..."}
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              {isEditing
                ? "Apply Configuration Changes"
                : "Confirm & Finalize Creation"}
              <ChevronRight className="h-4 w-4 ml-1 opacity-50" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Summary Field Component
function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
        {label}
      </p>
      <p className="text-sm font-bold text-white tracking-tight leading-relaxed">
        {value}
      </p>
    </div>
  );
}

// Folder Preview Item (Read-only recursive tree view)
function FolderPreviewItem({
  folder,
  level,
}: {
  folder: FolderLevel1 | FolderLevel2 | FolderLevel3;
  level: number;
}) {
  const indent = level * 16;

  return (
    <div>
      <div
        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/5 transition-all group"
        style={{ paddingLeft: `${indent + 12}px` }}
      >
        <div className="flex items-center gap-2">
          {level > 0 && <ChevronRight className="h-2.5 w-2.5 text-white/10" />}
          <FolderTree
            className={cn(
              "h-3.5 w-3.5",
              level === 0 ? "text-primary/60" : "text-white/20",
            )}
          />
        </div>
        <span
          className={cn(
            "text-[11px] font-bold tracking-wide uppercase transition-colors",
            level === 0
              ? "text-white/90"
              : "text-white/40 group-hover:text-white/70",
          )}
        >
          {folder.name}
        </span>
        {folder.isRequired && (
          <div className="h-1 w-1 rounded-full bg-amber-500/50" />
        )}
      </div>
      {(folder as any).children?.map((child: any, idx: number) => (
        <FolderPreviewItem key={idx} folder={child} level={level + 1} />
      ))}
    </div>
  );
}

// Helper function
function calculateFolderStats(folders: FolderLevel1[]) {
  let total = 0;
  let maxDepth = 0;

  function countFolders(items: any[], depth: number) {
    if (!items) return;
    total += items.length;
    maxDepth = Math.max(maxDepth, depth);
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        countFolders(item.children, depth + 1);
      }
    });
  }

  if (folders && folders.length > 0) {
    countFolders(folders, 1);
  }

  return { total, levels: maxDepth };
}
