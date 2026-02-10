"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FolderTree,
  HardDrive,
  Link as LinkIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FolderPreview } from "./folder-preview";
import { QuotationSelector } from "./quotation-selector";
import { StorageTierSelector } from "./storage-tier-selector";
import { TemplateSelector } from "./template-selector";

interface FolderTemplate {
  _id: Id<"folderTemplates">;
  name: string;
  folders: {
    name: string;
    path: string;
    description?: string;
    isRequired?: boolean;
  }[];
}

interface StorageTier {
  _id: Id<"storageTiers">;
  name: string;
  sizeGB: number;
}

interface QuotationOption {
  _id: Id<"quotations">;
  code: string;
  status: string;
  total: number;
  approvedAt?: number;
  linkedProjectCount: number;
  storageInfo: {
    totalGB: number;
    allocatedGB: number;
    remainingGB: number;
  };
}

interface FolderSetupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: Id<"projects">;
  projectCode: string;
  projectName?: string;
  projectTypeId: Id<"projectTypes">;
  studioId?: Id<"profiles">;
  linkedQuotationId?: Id<"quotations">;
  onSuccess?: () => void;
}

export function FolderSetupDrawer({
  open,
  onOpenChange,
  projectId,
  projectCode,
  projectName,
  projectTypeId,
  studioId,
  linkedQuotationId,
  onSuccess,
}: FolderSetupDrawerProps) {
  const [selectedQuotation, setSelectedQuotation] =
    useState<QuotationOption | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<FolderTemplate | null>(null);
  const [selectedTier, setSelectedTier] = useState<StorageTier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setupFolders = useMutation(
    api.functions.folders.mutations.setupProjectFolders,
  );
  const linkProject = useMutation(
    api.functions.projects.mutations.linkProjectToQuotation,
  );

  // Check if project already has a linked approved quotation
  const hasLinkedQuotation = !!linkedQuotationId;
  const needsQuotationStep = !hasLinkedQuotation && !!studioId;

  // Calculate step numbers based on whether quotation selection is needed
  const getStepNumber = (baseStep: number) => {
    return needsQuotationStep ? baseStep : baseStep - 1;
  };

  const handleSubmit = async () => {
    // Validate based on flow
    if (needsQuotationStep && !selectedQuotation) {
      toast.error("Please select a quotation");
      return;
    }
    if (!selectedTemplate) {
      toast.error("Please select a folder template");
      return;
    }
    if (!selectedTier) {
      toast.error("Please select a storage tier");
      return;
    }

    // Validate storage allocation against quotation pool
    if (
      selectedQuotation &&
      selectedTier.sizeGB > selectedQuotation.storageInfo.remainingGB
    ) {
      toast.error(
        `Cannot allocate ${selectedTier.sizeGB} GB. Only ${selectedQuotation.storageInfo.remainingGB} GB remaining in quotation.`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Link quotation if needed
      if (needsQuotationStep && selectedQuotation) {
        await linkProject({
          projectId,
          quotationId: selectedQuotation._id,
        });
      }

      // Step 2: Create folders
      const result = await setupFolders({
        projectId,
        templateId: selectedTemplate._id,
        storageTierId: selectedTier._id,
      });

      toast.success(
        `Created ${result.foldersCreated} folders with ${selectedTier.sizeGB} GB storage`,
      );
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to setup folders");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedQuotation(null);
      setSelectedTemplate(null);
      setSelectedTier(null);
      onOpenChange(false);
    }
  };

  // Determine if can submit
  const canSubmit =
    (!needsQuotationStep || selectedQuotation) &&
    selectedTemplate &&
    selectedTier &&
    !isSubmitting;

  return (
    <Drawer open={open} onOpenChange={handleClose} direction="right">
      <DrawerContent className="bg-zinc-950 border-white/10 h-full sm:max-w-2xl ml-auto rounded-none flex flex-col">
        <DrawerHeader className="border-b border-white/5 py-8">
          <DrawerTitle className="text-3xl font-black text-white uppercase tracking-tighter">
            Setup Project Folders
          </DrawerTitle>
          <DrawerDescription className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            {needsQuotationStep
              ? "Link quotation, configure folder structure and storage"
              : "Configure folder structure and storage allocation"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Project Info Banner */}
          <div className="p-4 rounded-xl bg-linear-to-br from-white/5 to-white/2 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-white font-bold">
                  {projectName || projectCode}
                </p>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                  {projectCode}
                </p>
              </div>
            </div>
          </div>

          {/* Step 0: Quotation Selection (if needed) */}
          {needsQuotationStep && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-xs font-black">1</span>
                </div>
                <h3 className="text-white font-black uppercase tracking-tight text-sm">
                  Link to Quotation
                </h3>
                {selectedQuotation && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                )}
              </div>
              <QuotationSelector
                studioId={studioId}
                selectedQuotationId={selectedQuotation?._id ?? null}
                onSelect={setSelectedQuotation}
              />
            </div>
          )}

          {/* Linked Quotation Info (if already linked) */}
          {hasLinkedQuotation && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20">
                  <LinkIcon className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-emerald-400 font-bold text-sm">
                    Quotation Linked
                  </p>
                  <p className="text-white/40 text-xs">
                    This project is linked to an approved quotation
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500 ml-auto" />
              </div>
            </div>
          )}

          {/* Step 1/2: Template Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-black">
                  {getStepNumber(2)}
                </span>
              </div>
              <h3 className="text-white font-black uppercase tracking-tight text-sm">
                Select Folder Template
              </h3>
              {selectedTemplate && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
              )}
            </div>
            <TemplateSelector
              projectTypeId={projectTypeId}
              selectedTemplateId={selectedTemplate?._id ?? null}
              onSelect={setSelectedTemplate}
            />
          </div>

          {/* Step 2/3: Storage Tier Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-black">
                  {getStepNumber(3)}
                </span>
              </div>
              <h3 className="text-white font-black uppercase tracking-tight text-sm">
                Select Storage Tier
              </h3>
              {selectedTier && (
                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
              )}
            </div>
            <StorageTierSelector
              selectedTierId={selectedTier?._id ?? null}
              onSelect={setSelectedTier}
              maxGB={selectedQuotation?.storageInfo.remainingGB}
            />

            {/* Storage warning if quotation selected */}
            {selectedQuotation &&
              selectedTier &&
              selectedTier.sizeGB >
                selectedQuotation.storageInfo.remainingGB && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-400 text-xs">
                    Selected tier exceeds quotation's remaining storage (
                    {selectedQuotation.storageInfo.remainingGB} GB)
                  </span>
                </div>
              )}
          </div>

          {/* Step 3/4: Preview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-black">
                  {getStepNumber(4)}
                </span>
              </div>
              <h3 className="text-white font-black uppercase tracking-tight text-sm">
                Preview Structure
              </h3>
            </div>
            <div className="p-4 rounded-xl bg-white/3 border border-white/5">
              <FolderPreview
                folders={selectedTemplate?.folders ?? []}
                projectCode={projectCode}
              />
            </div>
          </div>

          {/* Summary */}
          {canSubmit && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">
                    Ready to Create
                  </p>
                  <p className="text-white/60 text-xs">
                    {needsQuotationStep && selectedQuotation && (
                      <>Link to {selectedQuotation.code}, then </>
                    )}
                    {selectedTemplate?.folders.length} folders will be created
                    with {selectedTier?.sizeGB} GB storage allocation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/5 p-6 space-y-3">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-14 bg-primary text-primary-foreground font-black uppercase tracking-[0.3em] text-[10px] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 group"
          >
            <div className="flex items-center gap-3">
              {isSubmitting ? (
                "Creating Folders..."
              ) : (
                <>
                  {needsQuotationStep
                    ? "Link & Create Folders"
                    : "Create Folders"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </div>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-full h-12 text-white/40 hover:text-white font-black uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
