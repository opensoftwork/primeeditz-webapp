"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  FileText, 
  MapPin, 
  Tag, 
  User,
  ShieldAlert,
  Loader2,
  Send
} from "lucide-react";
import { motion } from "motion/react";
import { useQuotationBuilder } from "../../quotation-builder-context";
import {
  PricingSummary,
  TermsConditions,
} from "../../../detail/components";
import { toast } from "sonner";
import { SendQuotationDrawer } from "../../../send/send-quotation-drawer";
import type { Id } from "@convex/_generated/dataModel";
import { ProjectSectionItems } from "../shared/project-section-items";
import { LineItemDrawer } from "../shared/line-item-drawer";
import type { Project, QuotationData, QuotationLineItem } from "../../types";
import { ReviewHeader } from "./review-header";
import { ReviewProtocolCard } from "./review-protocol-card";

// Module-level currency formatter — no per-render allocation
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export function Step3ReviewSend() {
  const {
    formData,
    subtotal,
    taxAmount,
    grandTotal,
    projects: contextProjects,
    sections: contextSections,
    selectedStudio,
    templates,
    saveQuotation,
    saveQuotationAndReturn,
    isLoading,
    setSubmitTrigger,
    quotationId,
    addLineItem,
    updateLineItem,
    removeLineItem,
  } = useQuotationBuilder();

  const router = useRouter();
  const [isSendDrawerOpen, setIsSendDrawerOpen] = useState(false);
  const [isSavingForSend, setIsSavingForSend] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  // Track the ID returned from save-for-send (needed since quotationId
  // from context may not be set yet for brand-new quotations)
  const [sendQuotationId, setSendQuotationId] = useState<string | null>(null);

  // Expanded projects state
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

  // Line Item Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (QuotationLineItem & { originalIdx?: number }) | null
  >(null);
  const [targetProjectId, setTargetProjectId] = useState<string | undefined>();
  const [targetSectionId, setTargetSectionId] = useState<string | undefined>();

  // Auto-expand projects/packages that have items on mount
  useEffect(() => {
    if (formData.step3.lineItems.length === 0 && formData.step2.packageIds.length === 0) return;
    const activeIds = new Set<string>();
    // Expand all selected package IDs from Step 2
    formData.step2.packageIds.forEach((pkgId) => activeIds.add(pkgId));
    // Also expand from items' own sourcePackageId
    formData.step3.lineItems.forEach((item) => {
      if (item.projectId) activeIds.add(item.projectId);
      if (item.sourcePackageId) activeIds.add(item.sourcePackageId as string);
    });
    // Also add __no_package__ if any items lack sourcePackageId and projectId
    if (formData.step3.lineItems.some((item) => !item.projectId && !item.sourcePackageId)) {
      activeIds.add("__no_package__");
    }
    setExpandedProjects(activeIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextProjects, templates]); // Re-run when projects/templates resolve

  // Prepare projects list with eventName fallback
  const projects = useMemo(
    () =>
      (contextProjects || []).map((p: any) => ({
        ...p,
        eventName:
          p.eventName || p.endClientName || p.code || "Untitled Project",
      })),
    [contextProjects],
  );

  // Compute projectIds from line items (derive, don't store)
  const derivedProjectIds = useMemo(() => {
    const ids = new Set<string>();
    formData.step3.lineItems.forEach((item) => {
      if (item.projectId) ids.add(item.projectId);
    });
    return Array.from(ids);
  }, [formData.step3.lineItems]);

  // Resolve first project for StudioProjectInfo display
  const firstProject = useMemo(() => {
    if (derivedProjectIds.length === 0 || !projects.length) return null;
    return projects.find(
      (p: Project) => p._id === derivedProjectIds[0],
    ) as Project | undefined;
  }, [derivedProjectIds, projects]);

  // Build properly-typed review quotation data (replaces mockQuotation)
  const reviewQuotation = useMemo((): QuotationData & {
    studioName?: string;
    endClientName?: string;
    projectId?: string;
    projectName?: string;
    projectCode?: string;
  } => {
    const code = quotationId
      ? `QT-${quotationId.slice(-6).toUpperCase()}`
      : "DRAFT";

    return {
      code,
      version: 1,
      status: "draft",
      studioId: formData.step1.studioId || undefined,
      projectIds: derivedProjectIds.length > 0 ? derivedProjectIds : undefined,
      lineItems: formData.step3.lineItems,
      terms: formData.step3.terms || undefined,
      validUntil: formData.step1.validUntil?.getTime(),
      taxRate: formData.step3.taxRate / 100,
      discountAmount: formData.step3.discountAmount,
      _creationTime: Date.now(),
      // Extra fields used for display
      studioName: selectedStudio?.name || "Not Selected",
      endClientName:
        firstProject?.eventName ||
        firstProject?.endClientName ||
        selectedStudio?.name ||
        "N/A",
      projectId: (firstProject?._id as string) || undefined,
      projectName:
        firstProject?.eventName || firstProject?.code || undefined,
      projectCode: firstProject?.code || undefined,
    };
  }, [
    quotationId,
    formData.step1.studioId,
    formData.step1.validUntil,
    formData.step3.lineItems,
    formData.step3.terms,
    formData.step3.taxRate,
    formData.step3.discountAmount,
    derivedProjectIds,
    selectedStudio,
    firstProject,
  ]);

  // Handle Save as Draft (Finalize) - saves and navigates to quotations list
  const handleSaveAsDraft = useCallback(async () => {
    try {
      await saveQuotation();
      router.push("/quotations");
    } catch (error) {
      console.error("Failed to save", error);
      toast.error("Failed to save changes");
    }
  }, [saveQuotation, router]);

  // Handle Send to Studio - save first, then open drawer
  const handleSendToStudio = useCallback(async () => {
    setIsSavingForSend(true);
    try {
      const resultId = await saveQuotationAndReturn();
      if (resultId) {
        setSendQuotationId(resultId);
        setIsSendDrawerOpen(true);
      }
    } catch (error) {
      console.error("Failed to save for sending", error);
      toast.error("Failed to save quotation");
    } finally {
      setIsSavingForSend(false);
    }
  }, [saveQuotationAndReturn]);

  // Handle drawer close - navigate to quotations list
  const handleDrawerClose = useCallback(() => {
    setIsSendDrawerOpen(false);
    router.push("/quotations");
  }, [router]);

  // Handle Line Item Actions
  const handleAddItem = useCallback(
    (projectId: string, sectionId?: string) => {
      setEditingItem(null);
      setTargetProjectId(projectId);
      setTargetSectionId(sectionId);
      setDrawerOpen(true);
    },
    [],
  );

  const handleEditItem = useCallback((item: any) => {
    setEditingItem(item);
    setDrawerOpen(true);
  }, []);

  const handleSaveItem = useCallback(
    (data: any) => {
      if (editingItem && editingItem.originalIdx !== undefined) {
        updateLineItem(editingItem.originalIdx, data);
      } else {
        addLineItem(data);
      }
      setDrawerOpen(false);
    },
    [editingItem, updateLineItem, addLineItem],
  );

  const handleUpdateItem = useCallback(
    (item: any) => {
      if (item.originalIdx !== undefined) {
        updateLineItem(item.originalIdx, item);
      }
    },
    [updateLineItem],
  );

  const toggleProject = useCallback(
    (projectId: string) => {
      setExpandedProjects((prev) => {
        const next = new Set(prev);
        if (next.has(projectId)) {
          next.delete(projectId);
        } else {
          next.add(projectId);
        }
        return next;
      });
    },
    [],
  );

  // Preparation for ProjectSectionItems
  const itemsWithIdx = useMemo(
    () =>
      formData.step3.lineItems.map((item, idx) => ({
        ...item,
        originalIdx: idx,
      })),
    [formData.step3.lineItems],
  );

  // Handle Preview - save first, then navigate to preview page
  const handlePreview = useCallback(async () => {
    setIsPreviewLoading(true);
    try {
      const resultId = await saveQuotationAndReturn();
      if (resultId) {
        router.push(`/quotations/${resultId}/preview`);
      }
    } catch (error) {
      console.error("Failed to save for preview", error);
      toast.error("Failed to save quotation");
    } finally {
      setIsPreviewLoading(false);
    }
  }, [saveQuotationAndReturn, router]);

  // Register submit trigger for the Finalize button in footer
  useEffect(() => {
    setSubmitTrigger(handleSaveAsDraft);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, handleSaveAsDraft]);

  // Resolve the quotation ID for the send drawer (prefer context, fallback to save result)
  const activeQuotationId = quotationId || sendQuotationId;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <ReviewHeader
        quotation={reviewQuotation}
        sections={contextSections || []}
        projects={projects as Project[]}
        isPreviewLoading={isPreviewLoading}
        isLoading={isLoading}
        isSavingForSend={isSavingForSend}
        onPreview={handlePreview}
        onSendToStudio={handleSendToStudio}
      />

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Left Column: Scrollable Details */}
        <div className="flex-1 lg:overflow-y-auto lg:custom-scrollbar lg:pr-4 space-y-12 pb-10">
          {/* Section 01: Project Details */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                01. Project Details
              </h3>
              <div className="h-px w-full bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Studio / Client */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-white/20">
                  <User className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Studio Partner
                  </span>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                  {selectedStudio?.name || "Independent"}
                </p>
              </div>

              {/* Identity / Project Name */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-white/20">
                  <Tag className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Project / Client
                  </span>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                  {reviewQuotation.endClientName || "Not Specified"}
                </p>
              </div>

              {/* Validity / Date */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-white/20">
                  <Calendar className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Proposal Validity
                  </span>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-wider">
                  {reviewQuotation.validUntil
                    ? new Date(reviewQuotation.validUntil).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "Not Set"}
                </p>
              </div>

              {/* Info / Project Type */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-white/20">
                  <MapPin className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">
                    Project Location
                  </span>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-wider truncate">
                  {firstProject?.projectTypeName || "Universal Production"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 02: Itemized Breakdown */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                02. Itemized Breakdown
              </h3>
              <div className="h-px w-full bg-white/10" />
            </div>

            <ProjectSectionItems
              projects={projects as Project[]}
              sections={contextSections || []}
              items={itemsWithIdx}
              templates={templates}
              packageIds={formData.step2.packageIds}
              expandedProjects={expandedProjects}
              onToggleProject={toggleProject}
              onEditItem={handleEditItem}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={removeLineItem}
              onAddItem={handleAddItem}
              onAddFromLibrary={() => {}} // Library not yet integrated here
            />
          </div>

          {/* Terms & Conditions */}
          {formData.step3.terms && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.4em] whitespace-nowrap flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  03. Terms & Conditions
                </h3>
                <div className="h-px w-full bg-white/10" />
              </div>

              <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3 mb-4 opacity-40">
                  <FileText className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Standard Working Protocols
                  </span>
                </div>
                <TermsConditions terms={formData.step3.terms} />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Actions */}
        <div className="w-full lg:w-[320px] space-y-6">
          <ReviewProtocolCard
            grandTotal={grandTotal}
            isLoading={isLoading}
            isSavingForSend={isSavingForSend}
            onSendToStudio={handleSendToStudio}
            onSaveAsDraft={handleSaveAsDraft}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-3 opacity-40 px-1">
              <div className="w-1 h-3 bg-primary rounded-full" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white">
                Financial Architecture
              </h4>
            </div>
            <PricingSummary
              subtotal={subtotal}
              discountAmount={formData.step3.discountAmount}
              taxRate={formData.step3.taxRate / 100}
              taxAmount={taxAmount}
              grandTotal={grandTotal}
              formatCurrency={formatCurrency}
            />
          </div>
        </div>
      </div>

      <LineItemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={editingItem}
        onSave={handleSaveItem}
        sections={contextSections || []}
        projects={projects as Project[]}
        defaultProjectId={targetProjectId}
        defaultSectionId={targetSectionId}
      />

      {activeQuotationId && (
        <SendQuotationDrawer
          isOpen={isSendDrawerOpen}
          onClose={handleDrawerClose}
          quotation={{
            _id: activeQuotationId as Id<"quotations">,
            code: reviewQuotation.code,
            total: grandTotal,
            studioId: formData.step1.studioId as Id<"profiles">,
            studioName: selectedStudio?.name || "Studio",
            status: "draft",
          }}
        />
      )}
    </div>
  );
}
