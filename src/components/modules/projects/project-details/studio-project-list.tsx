"use client";

import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Calendar,
  Eye,
  FileEdit,
  Hash,
  Loader2,
  Trash2,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSimplePaginatedQuery } from "@/hooks/use-simple-paginated-query";
import { PhaseProgress } from "../phase-progress";
import { StudioStatusBadge } from "../studio-status-badge";
import { columns } from "./columns";
import type { StudioProject } from "./types";

// ============================================================================
// Project Card Component (for card view)
// ============================================================================

function ProjectCard({ project }: { project: StudioProject }) {
  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-6 rounded-3xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden h-full flex flex-col"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative flex-1 flex flex-col space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-primary/40" />
                <span className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors">
                  {project.code}
                </span>
              </div>
              <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                {project.projectTypeName}
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/20 transition-colors">
              <User className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors" />
            </div>
            <span className="font-black text-white/80 uppercase tracking-tight text-sm">
              My Project
            </span>
          </div>

          {project.eventName && (
            <div className="pt-3 border-t border-white/5">
              <div className="font-bold text-white/50 truncate text-[13px]">
                {project.eventName}
              </div>
              {project.eventDate && (
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.eventDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Progress Bar */}
          <div className="pt-4 mt-auto border-t border-white/5">
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          <div className="pt-3 flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary/60 group-hover:text-primary transition-colors">
              VIEW DETAILS <Eye className="h-3 w-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================================================
// Draft Banner Component
// ============================================================================

function DraftBanner({
  draft,
  onResume,
  onDiscard,
  isDiscarding,
}: {
  draft: {
    _id: string;
    code: string;
    eventName?: string;
  };
  onResume: () => void;
  onDiscard: () => void;
  isDiscarding: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 backdrop-blur-sm"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-1">
            Project Draft in Progress
          </h3>
          <p className="text-xs text-white/60 leading-relaxed mb-4">
            You have an incomplete project draft{" "}
            <span className="font-mono font-bold text-primary">
              {draft.code}
            </span>
            {draft.eventName && <> ({draft.eventName})</>}. Complete or discard
            it before creating a new project.
          </p>
          <div className="flex items-center gap-3">
            <Button
              onClick={onResume}
              className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              <FileEdit className="h-3.5 w-3.5" />
              Resume Draft
            </Button>
            <Button
              onClick={onDiscard}
              disabled={isDiscarding}
              variant="outline"
              className="h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 gap-2"
            >
              {isDiscarding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              Discard Draft
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function StudioProjectList() {
  const router = useRouter();
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<any>(undefined);
  const [typeFilter, setTypeFilter] = useState<any>(undefined);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const projectTypes = useQuery(api.functions.projects.queries.getProjectTypes);

  // Query for existing studio draft
  const existingDraft = useQuery(
    api.functions.projects.queries.getMyActiveDraft,
  );
  const deleteDraftMutation = useMutation(
    api.functions.projects.mutations.deleteDraft,
  );

  const query = useSimplePaginatedQuery(
    api.functions.projects.queries.getStudioProjectsPaginated,
    {
      actionState: statusFilter,
      projectTypeId: typeFilter,
    },
    { initialNumItems: pageSize },
  );

  const projects: StudioProject[] = useMemo(() => {
    if (query.status === "loaded") {
      const results = query as {
        status: "loaded";
        currentResults: { page: StudioProject[] };
      };
      return results.currentResults.page;
    }
    return [];
  }, [query]);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Awaiting Quotation", value: "awaiting_quotation" },
    { label: "Quotation Sent", value: "quotation_sent" },
    { label: "Quote Approved", value: "quotation_approved" },
    { label: "Quote Rejected", value: "quotation_rejected" },
    { label: "Awaiting Uploads", value: "awaiting_uploads" },
    { label: "Work In Progress", value: "work_in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
  ];

  const typeOptions = useMemo(() => {
    if (!projectTypes) return [];
    return projectTypes.map((t) => ({
      label: t.name,
      value: t.name, // DataTable faceted filter uses the displayed value from the row
    }));
  }, [projectTypes]);

  const handleResumeDraft = () => {
    if (existingDraft) {
      router.push("/projects/new");
    }
  };

  const handleDiscardDraft = async () => {
    if (!existingDraft) return;

    setIsDiscarding(true);
    try {
      await deleteDraftMutation({ projectId: existingDraft._id as any });
      toast.success("Draft discarded successfully");
      setShowDiscardDialog(false);
    } catch (error) {
      toast.error("Failed to discard draft");
      console.error("Failed to discard draft:", error);
    } finally {
      setIsDiscarding(false);
    }
  };

  if (query.status === "loading" && !projects.length) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              OVERVIEW
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              My Projects
            </h1>
          </motion.div>
        </div>
        <DataTableSkeleton rows={6} columns={5} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            OVERVIEW
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            My Projects
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {existingDraft ? (
            <Button
              onClick={handleResumeDraft}
              className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-amber-500 text-amber-950 hover:bg-amber-400 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-amber-500/20 gap-2"
            >
              <FileEdit className="h-4 w-4" />
              RESUME DRAFT
            </Button>
          ) : (
            <Link href="/projects/new">
              <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
                NEW PROJECT
              </Button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Draft Banner - Show when there's an existing draft */}
      {existingDraft && (
        <DraftBanner
          draft={existingDraft}
          onResume={handleResumeDraft}
          onDiscard={() => setShowDiscardDialog(true)}
          isDiscarding={isDiscarding}
        />
      )}

      <DataTable
        columns={columns}
        data={projects}
        isLoading={query.isLoading}
        emptyTitle="No Projects Found"
        emptyDescription="You haven't submitted any projects yet or no projects match your filters."
        renderCard={(project) => <ProjectCard project={project} />}
        defaultView="table"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "code",
            placeholder: "Search by project code...",
          },
          filters: [
            {
              column: "actionState",
              title: "Status",
              options: statusOptions,
            },
            ...(typeOptions.length > 0
              ? [
                  {
                    column: "projectTypeName",
                    title: "Type",
                    options: typeOptions,
                  },
                ]
              : []),
          ],
        }}
        serverPagination={{
          loadNext: query.loadNext,
          loadPrev: query.loadPrev,
          currentPage: query.currentPageNum,
          isLoading: query.isLoading,
          hasNextPage:
            query.status === "loaded" ? query.nextCursor !== null : false,
          setPageSize: (size) => {
            setPageSize(size);
            query.setPageSize(size);
          },
          pageSize,
        }}
      />

      {/* Discard Draft Confirmation Dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="bg-zinc-950 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white font-black uppercase tracking-tight">
              Discard Draft Project?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete your project draft{" "}
              <strong className="text-primary">{existingDraft?.code}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isDiscarding}
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardDraft}
              disabled={isDiscarding}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDiscarding ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Discarding...
                </>
              ) : (
                "Discard Draft"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
