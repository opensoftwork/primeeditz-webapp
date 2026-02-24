"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { format } from "date-fns";
import { useQuotationBuilder } from "../../quotation-builder-context";
import {
  LineItemsSection,
  PricingSummary,
  StudioProjectInfo,
  TermsConditions,
} from "../../../detail/components";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Receipt,
  Send,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { SendQuotationDrawer } from "../../../send/send-quotation-drawer";
import { DownloadQuotation } from "../../../preview";
import type { Id } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { ProjectSectionItems } from "../shared/project-section-items";
import { LineItemDrawer } from "../shared/line-item-drawer";
import { Project, QuotationLineItem } from "../../types";

export function Step5ReviewSend() {
  const {
    formData,
    setFormData,
    subtotal,
    taxAmount,
    grandTotal,
    projects: contextProjects,
    sections: contextSections,
    selectedStudio,
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
  const [savedQuotationId, setSavedQuotationId] = useState<string | null>(
    quotationId,
  );

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

  // Auto-expand projects that have items on mount
  useEffect(() => {
    if (contextProjects && formData.step4.lineItems.length > 0) {
      const activeIds = new Set<string>();
      formData.step4.lineItems.forEach((item) => {
        if (item.projectId) activeIds.add(item.projectId);
      });
      setExpandedProjects(activeIds);
    }
  }, [contextProjects === undefined]); // Run once when projects load

  // Fetch real quotation data to get current status
  const savedQuotation = useQuery(
    // @ts-ignore - Deep instantiation error due to recursive sub-item schema inference
    api.functions.quotations.queries.getQuotation,
    savedQuotationId
      ? { quotationId: savedQuotationId as Id<"quotations"> }
      : "skip",
  );

  // Update savedQuotationId when quotationId changes
  useEffect(() => {
    if (quotationId) {
      setSavedQuotationId(quotationId);
    }
  }, [quotationId]);

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock quotation object for components
  const mockQuotation: any = {
    _id: savedQuotationId || "new",
    code: quotationId ? `QT-${quotationId.slice(-6).toUpperCase()}` : "DRAFT",
    status: "draft",
    studioName: selectedStudio?.name || "Not Selected",
    validUntil: formData.step1.validUntil?.getTime(),
    version: 1,
    lineItems: formData.step4.lineItems,
    taxRate: formData.step5.taxRate / 100,
    discountAmount: formData.step5.discountAmount,
    terms: formData.step4.terms,
    _creationTime: Date.now(),
  };

  // Prepare projects list with eventName
  const projects = (contextProjects || []).map((p: any) => ({
    ...p,
    eventName: p.eventName || p.endClientName || p.code || "Untitled Project",
  }));

  // Logic to group items by project (same as detail view)
  const groupedByProject = projects
    .map((project: any) => {
      const projectItems = formData.step4.lineItems.filter(
        (item: any) => item.projectId === project._id,
      );

      const sectionGroups =
        contextSections
          ?.map((section) => ({
            section,
            items: projectItems.filter(
              (item: any) => item.sectionId === section._id,
            ),
          }))
          .filter((g) => g.items.length > 0) || [];

      // Unsectioned items
      const unsectionedItems = projectItems.filter(
        (item: any) =>
          !item.sectionId ||
          !contextSections?.some((s) => s._id === item.sectionId),
      );

      if (unsectionedItems.length > 0) {
        sectionGroups.push({
          section: {
            _id: "unsectioned",
            name: "Standard Services",
            color: "zinc",
            isActive: true,
          } as any,
          items: unsectionedItems,
        });
      }

      return {
        project,
        sectionGroups,
      };
    })
    .filter((pg) => pg.sectionGroups.length > 0);

  // Group by section only (for items without project)
  const generalItems = formData.step4.lineItems.filter(
    (item: any) =>
      !item.projectId || !projects.find((p) => p._id === item.projectId),
  );

  const groupedBySection =
    contextSections
      ?.map((section) => ({
        section,
        items: generalItems.filter(
          (item: any) => item.sectionId === section._id,
        ),
      }))
      .filter((g) => g.items.length > 0) || [];

  const globalUnsectioned = generalItems.filter(
    (item: any) =>
      !item.sectionId ||
      !contextSections?.some((s) => s._id === item.sectionId),
  );

  if (globalUnsectioned.length > 0) {
    groupedBySection.push({
      section: {
        _id: "unsectioned",
        name: "Standard Services",
        color: "zinc",
        isActive: true,
      } as any,
      items: globalUnsectioned,
    });
  }

  // Handle Save as Draft (Finalize) - saves and navigates to quotations list
  const handleSaveAsDraft = async () => {
    try {
      await saveQuotation();
      router.push("/quotations");
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  // Handle Send to Studio - save first, then open drawer
  const handleSendToStudio = async () => {
    setIsSavingForSend(true);
    try {
      // Save quotation and get the ID without navigating
      const resultId = await saveQuotationAndReturn();

      if (resultId) {
        setSavedQuotationId(resultId);
        // Open the send drawer
        setIsSendDrawerOpen(true);
      }
    } catch (error) {
      console.error("Failed to save for sending", error);
      toast.error("Failed to save quotation");
    } finally {
      setIsSavingForSend(false);
    }
  };

  // Handle drawer close - navigate to quotations list
  const handleDrawerClose = () => {
    setIsSendDrawerOpen(false);
    router.push("/quotations");
  };

  // Handle Line Item Actions
  const handleAddItem = (projectId: string, sectionId?: string) => {
    setEditingItem(null);
    setTargetProjectId(projectId);
    setTargetSectionId(sectionId);
    setDrawerOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditingItem(item);
    setDrawerOpen(true);
  };

  const handleSaveItem = (data: any) => {
    if (editingItem && editingItem.originalIdx !== undefined) {
      updateLineItem(editingItem.originalIdx, data);
    } else {
      addLineItem(data);
    }
    setDrawerOpen(false);
  };

  const handleUpdateItem = (item: any) => {
    if (item.originalIdx !== undefined) {
      updateLineItem(item.originalIdx, item);
    }
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  // Preparation for ProjectSectionItems
  const itemsWithIdx = formData.step4.lineItems.map((item, idx) => ({
    ...item,
    originalIdx: idx,
  }));

  // Handle Preview - save first, then navigate to preview page
  const handlePreview = async () => {
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
  };

  // Register submit trigger for the Finalize button in footer
  useEffect(() => {
    setSubmitTrigger(handleSaveAsDraft);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header Section - matching detail view */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-black text-white uppercase tracking-tight">
                {mockQuotation.code}
              </h1>
              <span className="text-[8px] font-black uppercase tracking-widest text-primary/60 bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded">
                v{mockQuotation.version}
              </span>
            </div>
            <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">
              Preview • {format(new Date(), "MMM dd, yyyy")}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Draft Badge */}
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl border",
              "bg-zinc-400/10 border-zinc-400/20 text-zinc-400",
            )}
          >
            <FileText className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              Draft
            </span>
          </div>

          {/* Preview Button */}
          <Button
            variant="outline"
            className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-white font-bold text-xs hover:bg-white/10"
            onClick={handlePreview}
            disabled={isLoading || isSavingForSend || isPreviewLoading}
          >
            {isPreviewLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            )}
          </Button>

          {/* Download PDF Button */}
          <DownloadQuotation
            quotation={mockQuotation}
            sections={contextSections || []}
            projects={projects}
            variant="default"
            size="sm"
            className="h-10 px-4 rounded-xl font-bold text-xs"
          />

          {/* Send to Studio Button */}
          <Button
            onClick={handleSendToStudio}
            disabled={isLoading || isSavingForSend}
            className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 text-zinc-950 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSavingForSend ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to Studio
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        {/* Left Column: Scrollable Details */}
        <div className="flex-1 lg:overflow-y-auto lg:custom-scrollbar lg:pr-4 space-y-6 pb-8">
          <StudioProjectInfo quotation={mockQuotation} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40">
                Service Breakdown
              </h3>
              <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">
                Edit items inline below
              </p>
            </div>
            <ProjectSectionItems
              projects={projects as Project[]}
              sections={contextSections || []}
              items={itemsWithIdx}
              expandedProjects={expandedProjects}
              onToggleProject={toggleProject}
              onEditItem={handleEditItem}
              onUpdateItem={handleUpdateItem}
              onRemoveItem={removeLineItem}
              onAddItem={handleAddItem}
              onAddFromLibrary={() => {}} // Library not yet integrated here
            />
          </div>

          <TermsConditions terms={formData.step4.terms} />
        </div>

        {/* Right Column: Fixed Actions & Summary */}
        <div className="lg:w-[380px] lg:shrink-0 space-y-6">
          {/* Review Protocol Card - matching detail view style */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-4xl bg-amber-400/5 border border-amber-400/10 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white">
                  Review Protocol
                </h3>
                <p className="text-[10px] font-bold text-amber-400/50 uppercase tracking-widest">
                  Finalize before saving
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-white/40 leading-relaxed">
                Review all details including line items, taxes, and terms. Once
                saved, this quotation will be created as a draft. You can also
                directly send it to the studio.
              </p>

              {/* Quick Actions */}
              <div className="space-y-2">
                {/* Send to Studio Button */}
                <Button
                  onClick={handleSendToStudio}
                  disabled={isLoading || isSavingForSend}
                  className="w-full justify-start h-11 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[10px] hover:bg-primary/90 transition-all"
                >
                  {isSavingForSend ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Preparing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to Studio
                    </>
                  )}
                </Button>

                {/* Save as Draft Button */}
                <Button
                  onClick={handleSaveAsDraft}
                  disabled={isLoading || isSavingForSend}
                  variant="outline"
                  className="w-full justify-start h-11 rounded-xl bg-white/5 border-white/10 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2 text-white/40" />
                      Save as Draft
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Pricing Summary */}
          <PricingSummary
            subtotal={subtotal}
            discountAmount={formData.step5.discountAmount}
            taxRate={formData.step5.taxRate / 100}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Line Item Drawer */}
      <LineItemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        item={editingItem}
        sections={contextSections || []}
        projects={projects as Project[]}
        defaultProjectId={targetProjectId}
        defaultSectionId={targetSectionId}
        onSave={handleSaveItem}
      />

      {/* Send Quotation Drawer */}
      {savedQuotationId && (
        <SendQuotationDrawer
          isOpen={isSendDrawerOpen}
          onClose={handleDrawerClose}
          quotation={{
            _id: savedQuotationId as Id<"quotations">,
            code: savedQuotation?.code || mockQuotation.code,
            total: grandTotal,
            studioId: formData.step1.studioId,
            studioName: selectedStudio?.name,
            status: savedQuotation?.status || "draft",
          }}
        />
      )}
    </div>
  );
}
