"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useAction, useQuery } from "convex/react";
import { Package } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PhaseProgress } from "@/components/modules/projects/phase-progress";
import { FilesVaultDrawer } from "@/components/shared/files-vault/drawer";
import { Button } from "@/components/ui/button";
import { useBreadcrumbStore } from "@/store/breadcrumb-store";
import { FolderSetupDrawer, ProjectFoldersList } from "../folder-setup";
import { StatusUpdateDrawer } from "../status-update/status-update-drawer";
import { AdminActionBanner } from "./admin-action-banner";
import { AwaitingActorBanner } from "./awaiting-actor-banner";
import { ProjectHeader } from "./project-header";
import { ProjectHistory } from "./project-history";
import { ProjectReferenceFiles } from "./project-reference-files";
import { ProjectSpecs } from "./project-specs";
import { ProjectDetailSkeleton } from "./skeleton";
import { StudioCard } from "./studio-card";
import { SystemControls } from "./system-controls";

interface ProjectDetailProps {
  projectId: string;
}

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getDeliveryPhaseLabel } from "@/lib/status-display";
import { QuotationCard } from "./quotation-card";
import type { AdminProjectDetail } from "./types";

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const { setOverride, removeOverride } = useBreadcrumbStore();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isFolderSetupOpen, setIsFolderSetupOpen] = useState(false);
  const [isStatusUpdateOpen, setIsStatusUpdateOpen] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string | null>>(
    {},
  );

  const project = useQuery(api.admin.getAdminProject, {
    projectId: projectId as Id<"projects">,
  }) as AdminProjectDetail | null | undefined;

  useEffect(() => {
    if (project?.eventName) {
      setOverride(projectId, project.eventName);
    }
    return () => removeOverride(projectId);
  }, [projectId, project?.eventName, setOverride, removeOverride]);

  const deliveryLabel = useMemo(() => {
    return getDeliveryPhaseLabel(project?.deliveryConfig);
  }, [project?.deliveryConfig]);

  const folderSetupStatus = useQuery(
    api.functions.folders.queries.canSetupFolders,
    project ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const getSignedUrlsAction = useAction(
    api.functions.storage.actions.getSignedFileUrls,
  );

  useEffect(() => {
    async function fetchUrls() {
      if (project?.referenceFiles && project.referenceFiles.length > 0) {
        const keys = project.referenceFiles
          .map((f: { storageKey?: string }) => f.storageKey)
          .filter((k: string | undefined): k is string => !!k);

        if (keys.length > 0) {
          try {
            const urls = await getSignedUrlsAction({ storageKeys: keys });
            setSignedUrls(urls);
          } catch (error) {
            console.error("Error fetching signed URLs:", error);
          }
        }
      }
    }
    fetchUrls();
  }, [project?.referenceFiles, getSignedUrlsAction]);

  const vaultFiles = useMemo(() => {
    if (!project?.referenceFiles) return [];

    return project.referenceFiles.map((file: any) => ({
      id: file.fileId,
      name: file.fileName,
      size: file.fileSize,
      type: file.fileType,
      url: file.storageKey
        ? signedUrls[file.storageKey] || undefined
        : undefined,
    }));
  }, [project?.referenceFiles, signedUrls]);

  const handleFolderSetupSuccess = useCallback(() => {
    toast.success("Project folders configured successfully!");
  }, []);

  const handleViewFolders = useCallback(() => {
    router.push(`/projects/${projectId}/folders`);
  }, [projectId, router]);

  if (project === undefined) return <ProjectDetailSkeleton />;

  if (project === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="p-6 rounded-full bg-white/5 border border-white/5">
          <Package className="h-12 w-12 text-white/20" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            Project Not Found
          </h2>
          <p className="text-sm text-white/40 mt-2 uppercase tracking-widest">
            The requested project ID does not exist or has been removed.
          </p>
        </div>
        <Button
          variant="outline"
          asChild
          className="rounded-xl border-white/10 hover:bg-white/5"
        >
          <Link href="/projects">RETURN TO LISTING</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-10 p-8 md:p-12 w-full transition-all duration-700 animate-in fade-in slide-in-from-bottom-5">
      <ProjectHeader
        code={project.code}
        phase={project.phase}
        actionState={project.actionState}
        deliveryLabel={deliveryLabel}
        onUpdateStatus={() => setIsStatusUpdateOpen(true)}
      />

      {/* Phase Progress Bar */}
      <div className="max-w-[1600px] mx-auto">
        <PhaseProgress currentPhase={project.phase} />
      </div>

      <div className="max-w-[1600px] mx-auto">
        <AdminActionBanner
          project={project}
          onSetIsFolderSetupOpen={setIsFolderSetupOpen}
          onViewFolders={handleViewFolders}
          onOpenAssignEmployee={() =>
            router.push(`/projects/${projectId}/assign`)
          }
        />
        <AwaitingActorBanner project={project} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            <ProjectSpecs project={project} />
            <ProjectReferenceFiles
              referenceFilesCount={project.referenceFiles?.length || 0}
              vaultFiles={vaultFiles}
              onOpenVault={() => setIsVaultOpen(true)}
            />

            {/* Project Folders Section */}
            {folderSetupStatus?.hasFolders && (
              <div id="project-folders-section">
                <ProjectFoldersList projectId={projectId as Id<"projects">} />
              </div>
            )}

            <ProjectHistory history={project.statusHistory} />
          </div>

          <div className="lg:col-span-4 space-y-10">
            <StudioCard
              studioName={project.studioName}
              studioEmail={project.studioEmail}
              submittedAt={project._creationTime}
            />
            <QuotationCard
              quotation={project.quotation}
              projectId={project._id}
            />
            <div id="system-controls-section">
              <SystemControls
                storageAllocated={project.storageAllocated}
                actionState={project.actionState}
                awaitingActorRole={project.awaitingActorRole}
                canSetupFolders={folderSetupStatus?.canSetup ?? false}
                hasFolders={folderSetupStatus?.hasFolders ?? false}
                folderSetupReason={folderSetupStatus?.reason}
                onSetupFolders={() => setIsFolderSetupOpen(true)}
                onViewFolders={handleViewFolders}
                onAssignTeam={() =>
                  router.push(`/projects/${projectId}/assign`)
                }
              />
            </div>
          </div>
        </div>
      </div>

      <FilesVaultDrawer
        open={isVaultOpen}
        onOpenChange={setIsVaultOpen}
        title="Reference Vault"
        subtitle={`Viewing secure reference materials for ${project.code}`}
        files={vaultFiles}
        primaryColor="amber-500"
      />

      {/* Folder Setup Drawer */}
      <FolderSetupDrawer
        open={isFolderSetupOpen}
        onOpenChange={setIsFolderSetupOpen}
        projectId={projectId as Id<"projects">}
        projectCode={project.code}
        projectName={project.eventName}
        projectTypeId={project.projectTypeId}
        studioId={project.studioId}
        onSuccess={handleFolderSetupSuccess}
      />

      <StatusUpdateDrawer
        open={isStatusUpdateOpen}
        onOpenChange={setIsStatusUpdateOpen}
        projectId={projectId as Id<"projects">}
        currentStatus={project.actionState}
        projectCode={project.code}
        projectName={project.eventName}
      />
    </div>
  );
}
