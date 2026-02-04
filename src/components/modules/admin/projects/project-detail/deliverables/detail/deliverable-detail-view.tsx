"use client";

import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { DeliverableHeader } from "./deliverable-header";
import { DeliverablePreview } from "./deliverable-preview";
import { DeliverableActions } from "./deliverable-actions";
import { DeliverableMetaCard } from "./deliverable-meta-card";
import { RevisionDialog } from "./revision-dialog";
import { VersionHistory } from "./version-history";

interface DeliverableDetailViewProps {
  projectId?: string;
  deliverableId?: string;
}

export function DeliverableDetailView({ 
  projectId: propProjectId, 
  deliverableId: propDeliverableId 
}: DeliverableDetailViewProps = {}) {
  const params = useParams();
  const router = useRouter();
  
  const projectId = propProjectId || (params.projectId as string);
  const deliverableIdString = propDeliverableId || (params.deliverableId as string);
  const deliverableId = deliverableIdString as Id<"deliverables">;

  // Role check
  const myProfile = useQuery(api.functions.profiles.queries.getMyProfile);
  const isAdmin = myProfile?.role === "admin";

  // Queries
  const deliverable = useQuery(
    api.functions.deliverables.queries.getDeliverable,
    deliverableId ? { deliverableId } : "skip"
  );

  const versions = useQuery(
    api.functions.deliverables.queries.getDeliverableVersions,
    deliverable
      ? { projectId: deliverable.projectId, name: deliverable.name }
      : "skip"
  );

  // Mutations
  const approveDeliverable = useMutation(
    api.functions.deliverables.mutations.approveDeliverable
  );
  const requestRevision = useMutation(
    api.functions.deliverables.mutations.requestRevision
  );
  const sendToStudio = useMutation(
    api.functions.deliverables.mutations.sendToStudio
  );

  // Actions
  const getSignedUrlAction = useAction(
    api.functions.storage.actions.getSignedFileUrl
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
      <DeliverableHeader
        name={deliverable.name}
        version={deliverable.version}
        sizeBytes={deliverable.sizeBytes}
        createdAt={deliverable._creationTime}
        hasMultipleVersions={versions !== undefined && versions !== null && versions.length > 1}
        versionCount={versions?.length || 0}
        showVersionHistory={showVersionHistory}
        onToggleVersionHistory={() => setShowVersionHistory(!showVersionHistory)}
        onBack={() => router.back()}
        downloadUrl={fileUrl}
      />

      {showVersionHistory && versions && versions.length > 1 && (
        <VersionHistory
          versions={versions}
          currentId={deliverableId}
          projectId={projectId}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <DeliverablePreview
            url={fileUrl}
            fileName={deliverable.name}
            mimeType={deliverable.mimeType}
            description={deliverable.description}
            rejectionNotes={deliverable.rejectionNotes}
          />
        </div>

        <div className="space-y-6">
          <DeliverableMetaCard
            status={deliverable.status}
            uploadedByName={deliverable.uploadedByName}
          />
          {isAdmin && (
            <DeliverableActions
              canApprove={canApprove}
              canRequestRevision={canRequestRevision}
              canSendToStudio={canSendToStudio}
              isSubmitting={isSubmitting}
              onApprove={handleApprove}
              onRequestRevision={() => setShowRevisionDialog(true)}
              onSendToStudio={handleSendToStudio}
            />
          )}
        </div>
      </div>

      <RevisionDialog
        open={showRevisionDialog}
        onOpenChange={setShowRevisionDialog}
        revisionNotes={revisionNotes}
        onNotesChange={setRevisionNotes}
        onSubmit={handleRequestRevision}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
