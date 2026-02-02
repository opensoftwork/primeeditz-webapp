"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  History,
  Loader2,
  RotateCcw,
  Send,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { FilePreview } from "@/components/shared/file-preview";

export default function DeliverableDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const deliverableId = params.deliverableId as Id<"deliverables">;

  // Queries
  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    deliverableId ? { deliverableId } : "skip",
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    deliverable
      ? { projectId: deliverable.projectId, name: deliverable.name }
      : "skip",
  );

  // Mutations
  const approveDeliverable = useMutation(
    api.functions.deliverables.mutations.approveDeliverable,
  );
  const requestRevision = useMutation(
    api.functions.deliverables.mutations.requestRevision,
  );
  const sendToStudio = useMutation(
    api.functions.deliverables.mutations.sendToStudio,
  );

  // Actions
  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl,
  );

  // Local state
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  useEffect(() => {
    async function fetchUrl() {
      if (deliverable?.minioKey) {
        try {
          const url = await getSignedUrlAction({
            storageKey: deliverable.minioKey,
          });
          setFileUrl(url);
        } catch (error) {
          console.error("Error fetching signed URL:", error);
        }
      }
    }
    fetchUrl();
  }, [deliverable, getSignedUrlAction]);

  if (deliverable === undefined) {
    return (
      <div className="p-12 space-y-8 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-1/3 bg-white/5 rounded-xl" />
        <Skeleton className="h-[400px] w-full bg-white/5 rounded-3xl" />
      </div>
    );
  }

  if (deliverable === null) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-xl font-bold text-white">Deliverable Not Found</h1>
        <Button variant="link" asChild className="mt-4 text-indigo-400">
          <Link href={`/projects/${projectId}`}>Return to Project</Link>
        </Button>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveDeliverable({ deliverableId });
      toast.success("Deliverable approved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      toast.error("Please provide revision notes");
      return;
    }
    setIsSubmitting(true);
    try {
      await requestRevision({
        deliverableId,
        rejectionNotes: revisionNotes,
      });
      toast.success("Revision requested! Employee will be notified.");
      setShowRevisionDialog(false);
      setRevisionNotes("");
    } catch (error: any) {
      toast.error(error.message || "Failed to request revision");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendToStudio = async () => {
    setIsSubmitting(true);
    try {
      await sendToStudio({ deliverableId });
      toast.success("Deliverable sent to studio successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send to studio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canApprove = deliverable.status === "pending_qc";
  const canRequestRevision =
    deliverable.status === "pending_qc" ||
    deliverable.status === "revision_needed";
  const canSendToStudio = deliverable.status === "approved";

  return (
    <div className="p-8 md:p-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-10 w-10 border border-white/5 hover:bg-white/5"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-white/60" />
          </Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              {deliverable.name}
            </h1>
            <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <span>Version {deliverable.version}</span>
              <span>•</span>
              <span>
                {(deliverable.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
              <span>•</span>
              <span>{format(deliverable._creationTime, "PPP p")}</span>
            </div>
          </div>
        </div>

        {/* Version History Toggle */}
        {versions && versions.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className="rounded-xl border-white/10 hover:bg-white/5 gap-2"
          >
            <History className="h-4 w-4" />
            {versions.length} Versions
          </Button>
        )}
      </div>

      {/* Version History Panel */}
      {showVersionHistory && versions && versions.length > 1 && (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-widest text-white/50 mb-4">
            Version History
          </h3>
          <div className="flex flex-wrap gap-2">
            {versions.map((v) => (
              <Link
                key={v._id}
                href={`/projects/${projectId}/deliverables/${v._id}`}
                className={cn(
                  "px-3 py-2 rounded-xl border text-xs font-bold transition-all",
                  v._id === deliverableId
                    ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10",
                )}
              >
                <span>v{v.version}</span>
                <span className="ml-2 text-[10px] text-white/40">
                  {format(v._creationTime, "MMM dd")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[2rem] bg-zinc-900 border border-white/5 overflow-hidden min-h-[500px] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
            <div className="relative z-10 h-full">
              <FilePreview
                url={fileUrl}
                fileName={deliverable.name}
                mimeType={deliverable.mimeType}
              />
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-3xl bg-white/2 border border-white/5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/50 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Description / Notes
            </h3>
            <p className="text-sm text-white/80 leading-relaxed">
              {deliverable.description || "No description provided."}
            </p>
          </div>

          {/* Rejection Notes (if any) */}
          {deliverable.rejectionNotes && (
            <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-400 flex items-center gap-2">
                <XCircle className="h-4 w-4" /> Revision Requested
              </h3>
              <p className="text-sm text-red-200/80 leading-relaxed">
                {deliverable.rejectionNotes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Actions & Meta */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-6">
            {/* Status */}
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Current Status
              </p>
              <div
                className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider",
                  deliverable.status === "approved"
                    ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                    : deliverable.status === "revision_requested"
                      ? "text-red-400 border-red-500/20 bg-red-500/10"
                      : deliverable.status === "revision_needed"
                        ? "text-orange-400 border-orange-500/20 bg-orange-500/10"
                        : "text-amber-400 border-amber-500/20 bg-amber-500/10",
                )}
              >
                {deliverable.status === "approved" && (
                  <CheckCircle className="h-3.5 w-3.5" />
                )}
                {(deliverable.status === "revision_requested" ||
                  deliverable.status === "revision_needed") && (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {deliverable.status === "pending_qc" && (
                  <Clock className="h-3.5 w-3.5" />
                )}
                {deliverable.status.replace(/_/g, " ")}
              </div>
            </div>

            {/* Submitted By */}
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                Submitted By
              </p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <User className="h-4 w-4 text-indigo-400" />
                </div>
                <span className="text-sm font-bold text-white">
                  {deliverable.uploadedByName}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-white/5 space-y-3">
              {/* Send to Studio - Only for approved */}
              {canSendToStudio && (
                <Button
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 gap-2"
                  onClick={handleSendToStudio}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send To Studio
                </Button>
              )}

              {/* Approve / Request Revision */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="rounded-xl border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-bold uppercase tracking-wider text-[10px] h-10"
                  onClick={handleApprove}
                  disabled={!canApprove || isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold uppercase tracking-wider text-[10px] h-10"
                  onClick={() => setShowRevisionDialog(true)}
                  disabled={!canRequestRevision || isSubmitting}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Revise
                </Button>
              </div>
            </div>
          </div>

          {/* QC Info Card */}
          <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex gap-4">
              <ShieldCheck className="h-5 w-5 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">
                  Quality Control
                </h4>
                <p className="text-[10px] font-medium text-indigo-200/60 mt-2 leading-relaxed">
                  Verify technical specs, resolution, and format compliance
                  before sending to studio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent className="bg-zinc-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Request Revision</DialogTitle>
            <DialogDescription className="text-white/60">
              Provide feedback for the employee. They will be notified and
              assigned to rework this deliverable.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe what needs to be changed..."
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowRevisionDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRequestRevision}
              disabled={isSubmitting || !revisionNotes.trim()}
              className="bg-red-600 hover:bg-red-500"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Request Revision
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
