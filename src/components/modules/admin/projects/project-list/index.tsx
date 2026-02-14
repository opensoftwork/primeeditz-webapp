"use client";

import { api } from "@convex/_generated/api";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  Calendar,
  ChevronRight,
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
import { columns } from "./columns";
import { PhaseProgress } from "@/components/modules/projects/phase-progress";
import { StudioStatusBadge } from "@/components/modules/projects/studio-status-badge";
import type { AdminProject } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

// ============================================================================
// Project Card Component (for card view)
// ============================================================================

function ProjectCard({ project }: { project: AdminProject }) {
  const router = useRouter();

  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        whileHover={{ y: -3 }}
        className="group relative p-4 rounded-2xl bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-3 flex-1 flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-primary/40" />
                <span className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tighter truncate">
                  {project.code}
                </span>
              </div>
              <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em]">
                {project.projectTypeName}
              </div>
            </div>
            <StudioStatusBadge status={project.actionState} />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/20 transition-colors">
              <User className="h-2.5 w-2.5 text-white/40 group-hover:text-primary transition-colors" />
            </div>
            <span className="font-black text-white uppercase tracking-tight text-[18px] truncate">
              {project.studioName}
            </span>
          </div>

          <div className="space-y-0.5">
            <h3 className="text-[10px] font-black text-white/60 leading-tight uppercase tracking-tight truncate">
              {project.eventName || "General Project"}
            </h3>
            {project.eventDate && (
              <div className="flex items-center gap-1 text-[9px] font-bold text-white/20 uppercase tracking-widest">
                <Calendar className="h-2.5 w-2.5" />
                {new Date(project.eventDate).toLocaleDateString()}
              </div>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-white/5">
            <PhaseProgress currentPhase={project.phase} compact={true} />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <div className="flex items-center gap-1 text-[8px] font-black text-primary/60 group-hover:text-primary transition-colors uppercase tracking-[0.15em]">
              View <ChevronRight className="h-2 w-2" />
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
    studioName?: string | null;
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
            Draft Project in Progress
          </h3>
          <p className="text-xs text-white/60 leading-relaxed mb-4">
            You have an incomplete project draft{" "}
            <span className="font-mono font-bold text-primary">
              {draft.code}
            </span>
            {draft.studioName && (
              <>
                {" "}
                for client{" "}
                <span className="font-bold text-white/80">
                  {draft.studioName}
                </span>
              </>
            )}
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

export default function ProjectList() {
  const router = useRouter();
  const [pageSize, setPageSize] = useState(15);
  const [actionStateFilter, setActionStateFilter] = useState<
    string | undefined
  >(undefined);
  const [typeFilter, setTypeFilter] = useState<any>(undefined);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  //@ts-ignore
  const projectTypes = useQuery(api.admin.getProjectTypes);

  // Query for existing admin draft
  const existingDraft = useQuery(
    api.functions.projects.queries.getAdminActiveDraft,
  );
  const deleteDraftMutation = useMutation(
    api.functions.projects.mutations.deleteDraft,
  );

  const query = useSimplePaginatedQuery(
    api.admin.getAdminProjectsPaginated,
    {
      actionState: actionStateFilter as any,
      projectTypeId: typeFilter,
    },
    { initialNumItems: pageSize },
  );

  const projects: AdminProject[] = useMemo(() => {
    if (query.status === "loaded") {
      const results = query as {
        status: "loaded";
        currentResults: { page: AdminProject[] };
      };
      return results.currentResults.page;
    }
    return [];
  }, [query]);

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Awaiting Quotation", value: "awaiting_quotation" },
    { label: "Quotation Sent", value: "quotation_sent" },
    { label: "Quotation Approved", value: "quotation_approved" },
    { label: "Quote Rejected", value: "quotation_rejected" },
    { label: "Awaiting Onboarding", value: "awaiting_onboarding" },
    { label: "Awaiting Uploads", value: "awaiting_uploads" },
    { label: "Work In Progress", value: "work_in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
  ];

  const typeOptions = useMemo(() => {
    if (!projectTypes) return [];
    return projectTypes.map((t) => ({
      label: t.name,
      value: t._id,
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

  // The handleInitiateProject function is currently unused as the button is commented out.

  if (query.status === "loading" && !projects.length) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 bg-white/5" />
            <Skeleton className="h-12 w-64 bg-white/5" />
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/5" />
        </div>
        <DataTableSkeleton rows={6} columns={6} viewMode="cards" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-120px)] w-full flex-col px-8 pt-10 pb-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            Project Vault
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
          ) : null}
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
        className="flex-1"
        columns={columns}
        data={projects}
        isLoading={query.isLoading}
        emptyTitle="No Projects Found"
        emptyDescription="No projects match your current filters. Try adjusting your search criteria."
        renderCard={(project) => <ProjectCard project={project} />}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "studioName",
            placeholder: "Search by client or code...",
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Draft Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the draft project{" "}
              <span className="font-mono font-bold text-primary">
                {existingDraft?.code}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDiscarding}>
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
