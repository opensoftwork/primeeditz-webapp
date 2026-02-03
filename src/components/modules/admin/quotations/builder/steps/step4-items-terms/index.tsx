/**
 * Quotation Builder Step 4: Items & Terms
 *
 * Combined step for line items, subtotal, and terms & conditions.
 */

"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import {
  AlertCircle,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  Copy,
  FileText,
  IndianRupee,
  Minus,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useQuotationBuilder } from "../../quotation-builder-context";
import type { Project, QuotationLineItem, Section } from "../../types";
import {
  type LibraryDisplayItem,
  LibraryItemsDrawer,
} from "../shared/library-items-drawer";
import { LineItemDrawer } from "../shared/line-item-drawer";
import { ProjectSectionItems } from "../shared/project-section-items";

// Default terms templates
const TERMS_TEMPLATES = [
  {
    id: "standard",
    name: "Standard",
    content: `1. PAYMENT TERMS
• 50% advance payment before project commencement
• 50% upon delivery of final files
• Payment via bank transfer or UPI

2. REVISIONS
• Up to 2 rounds of revisions included
• Additional revisions charged at ₹2,000 per round

3. DELIVERY
• Delivery timeline as per project scope
• Delays due to client feedback not included

4. CANCELLATION
• Advance amount non-refundable after work begins
• 50% cancellation fee if cancelled midway

5. RIGHTS & OWNERSHIP
• Full rights transferred upon complete payment
• Raw files available at additional cost`,
  },
  {
    id: "simple",
    name: "Simple",
    content: `• 50% advance, 50% on delivery
• 2 revision rounds included
• Full rights transferred upon payment
• Advance non-refundable after work starts`,
  },
  {
    id: "detailed",
    name: "Detailed",
    content: `TERMS AND CONDITIONS

1. SCOPE OF WORK
The services covered in this quotation are as specified in the line items above. Any additional work requested will be quoted separately.

2. PAYMENT SCHEDULE
• Booking Amount: 50% of total amount upon confirmation
• Balance Payment: Remaining 50% before final delivery
• Mode: Bank Transfer / UPI / Cheque

3. REVISION POLICY
• Two (2) rounds of revisions are included in this quote
• Additional revisions will be charged at standard hourly rates
• Major scope changes will require a revised quotation

4. PROJECT TIMELINE
• Work will commence upon receipt of advance payment
• Timeline is estimated and may vary based on complexity
• Client delays in feedback will extend delivery timeline

5. CANCELLATION & REFUND
• Booking amount is non-refundable once work has commenced
• 50% of remaining balance due if cancelled after 50% completion
• Full amount due if cancelled after 80% completion

6. INTELLECTUAL PROPERTY
• All rights transfer to client upon full payment
• We retain the right to use work for portfolio/marketing
• Raw/source files available at 20% additional cost

7. CONFIDENTIALITY
Both parties agree to maintain confidentiality of all project materials and business information.

8. VALIDITY
This quotation is valid for 30 days from the date of issue.`,
  },
];

export function Step4ItemsTerms() {
  const {
    formData,
    setFormData,
    addLineItem,
    updateLineItem,
    removeLineItem,
    nextStep,
    setSubmitTrigger,
    projects,
    subtotal,
    taxAmount,
    grandTotal,
  } = useQuotationBuilder();

  // Access step4 for lineItems
  const { lineItems } = formData.step4;
  // Access step3 for projectIds
  const selectedProjectIds = formData.step3.projectIds;
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id),
    ) || [];

  const sections =
    (useQuery(api.functions.quotations.sections.queries.getSections, {
      activeOnly: true,
    }) as Section[]) || [];

  // Terms state
  const [terms, setTerms] = useState(formData.step4.terms);
  const [copied, setCopied] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(true);

  // Library drawer state
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string | undefined>();

  // Line item drawer state
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    (QuotationLineItem & { originalIdx: number }) | null
  >(null);
  const [defaultSectionForDrawer, setDefaultSectionForDrawer] = useState<
    string | undefined
  >();
  const [defaultProjectForDrawer, setDefaultProjectForDrawer] = useState<
    string | undefined
  >();

  // Expanded projects state
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const seenProjectsRef = useRef<Set<string>>(new Set());

  // Auto-expand new projects
  useEffect(() => {
    const newSeen = new Set(seenProjectsRef.current);
    const projectsToExpand: string[] = [];

    filteredProjects.forEach((p) => {
      if (!newSeen.has(p._id)) {
        newSeen.add(p._id);
        projectsToExpand.push(p._id);
      }
    });

    if (projectsToExpand.length > 0) {
      seenProjectsRef.current = newSeen;
      setExpandedProjects((prev) => {
        const next = new Set(prev);
        projectsToExpand.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [filteredProjects]);

  // Sync terms with context
  useEffect(() => {
    if (formData.step4.terms !== terms) {
      setTerms(formData.step4.terms);
    }
  }, [formData.step4.terms]);

  // Update context when terms change
  const handleTermsChange = (value: string) => {
    setTerms(value);
    setFormData("step4", { terms: value });
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = TERMS_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      handleTermsChange(template.content);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(terms);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle project expansion
  const handleToggleProject = useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  }, []);

  // Helper to ensure project is expanded
  const ensureProjectExpanded = useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      if (prev.has(projectId)) return prev;
      const next = new Set(prev);
      next.add(projectId);
      return next;
    });
  }, []);

  // Open library for specific section/project
  const openLibrary = useCallback(
    (sectionId: string | null = null, projectId?: string) => {
      setTargetSectionId(sectionId);
      setTargetProjectId(projectId);
      setLibraryOpen(true);
    },
    [],
  );

  // Open drawer to add new item
  const openAddItemDrawer = useCallback(
    (projectId?: string, sectionId?: string) => {
      setEditingItem(null);
      const effectiveProjectId =
        projectId ||
        (filteredProjects.length === 1 ? filteredProjects[0]._id : undefined);
      const effectiveSectionId = sectionId || sections[0]?._id;

      setDefaultProjectForDrawer(effectiveProjectId);
      setDefaultSectionForDrawer(effectiveSectionId);
      setItemDrawerOpen(true);
    },
    [filteredProjects, sections],
  );

  // Open drawer to edit existing item
  const openEditItemDrawer = useCallback(
    (item: QuotationLineItem & { originalIdx: number }) => {
      setEditingItem(item);
      setDefaultSectionForDrawer(item.sectionId);
      setDefaultProjectForDrawer(item.projectId);
      setItemDrawerOpen(true);
    },
    [],
  );

  const handleSelectFromLibrary = useCallback(
    (item: LibraryDisplayItem, projectId?: string) => {
      const effectiveProjectId =
        projectId ||
        targetProjectId ||
        (filteredProjects.length === 1 ? filteredProjects[0]._id : undefined);

      addLineItem({
        description: item.name,
        unit: item.unit,
        rate: item.unitPrice,
        quantity: 1,
        sectionId: item.sectionId as Id<"quotationSections">,
        projectId: effectiveProjectId,
      });

      if (effectiveProjectId) {
        ensureProjectExpanded(effectiveProjectId);
      }
    },
    [addLineItem, filteredProjects, targetProjectId, ensureProjectExpanded],
  );

  // Handle save from drawer
  const handleSaveItem = useCallback(
    (itemData: Omit<QuotationLineItem, "id">) => {
      if (editingItem) {
        updateLineItem(editingItem.originalIdx, itemData);
      } else {
        addLineItem(itemData);
        if (itemData.projectId) {
          ensureProjectExpanded(itemData.projectId);
        }
      }
      setItemDrawerOpen(false);
      setEditingItem(null);
    },
    [editingItem, addLineItem, updateLineItem, ensureProjectExpanded],
  );

  // All items with originalIdx
  const allItemsWithIdx = useMemo(
    () =>
      lineItems.map((item, originalIdx) => ({
        ...(item as QuotationLineItem),
        originalIdx,
      })),
    [lineItems],
  );

  // Check if projects are selected
  const hasProjects = filteredProjects.length > 0;

  // Handle next step
  const handleNext = () => {
    setFormData("step5", { terms });
    nextStep();
  };

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(handleNext);
    return () => setSubmitTrigger(null);
  }, [setSubmitTrigger, terms]);

  return (
    <div className="w-full flex flex-col h-full overflow-y-auto custom-scrollbar pr-2">
      <div className="flex-1 space-y-8 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Items & Terms
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Define line items, pricing, and terms for this quotation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => openLibrary()}
              disabled={!hasProjects}
              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              <BookOpen className="h-4 w-4 mr-2 text-primary" />
              Library
            </Button>
            <Button
              type="button"
              onClick={() => openAddItemDrawer()}
              disabled={!hasProjects}
              className="h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
          <ProjectSectionItems
            projects={filteredProjects}
            sections={sections}
            items={allItemsWithIdx}
            expandedProjects={expandedProjects}
            onToggleProject={handleToggleProject}
            onEditItem={openEditItemDrawer}
            onRemoveItem={removeLineItem}
            onAddItem={(projectId, sectionId) =>
              openAddItemDrawer(projectId, sectionId)
            }
            onAddFromLibrary={(projectId, sectionId) =>
              openLibrary(sectionId || null, projectId)
            }
          />
        </div>

        {/* Subtotal & Tax Section */}
        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
              Quotation Summary
            </span>
          </div>

          <div className="space-y-3">
            {/* Subtotal */}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-bold text-white/60">Subtotal</span>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4 text-white/40" />
                <span className="text-lg font-black text-white tracking-tight">
                  {subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Discount */}
            <div className="flex items-center justify-between py-2 border-t border-white/5">
              <span className="text-sm font-bold text-white/60">Discount</span>
              <div className="flex items-center gap-1">
                <Minus className="h-4 w-4 text-red-400" />
                <span className="text-sm font-bold text-red-400 tracking-tight">
                  {formData.step5.discountAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Tax */}
            <div className="flex items-center justify-between py-2 border-t border-white/5">
              <span className="text-sm font-bold text-white/60">
                Tax ({formData.step5.taxRate}%)
              </span>
              <div className="flex items-center gap-1">
                <Plus className="h-4 w-4 text-white/40" />
                <span className="text-sm font-bold text-white/60 tracking-tight">
                  {taxAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between py-4 border-t-2 border-primary/30 mt-2">
              <span className="text-sm font-black text-primary uppercase tracking-wider">
                Grand Total
              </span>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="text-2xl font-black text-primary tracking-tight">
                  {grandTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions Section */}
        <div className="p-5 rounded-2xl bg-white/2 border border-white/5">
          <button
            type="button"
            onClick={() => setTermsExpanded(!termsExpanded)}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                Terms & Conditions
              </span>
              {terms && (
                <span className="text-[9px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {terms.length} chars
                </span>
              )}
            </div>
            <motion.div
              animate={{ rotate: termsExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-white/40" />
            </motion.div>
          </button>

          <AnimatePresence>
            {termsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Quick Templates */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                      Quick Templates
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {TERMS_TEMPLATES.map((template) => (
                      <Button
                        key={template.id}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyTemplate(template.id)}
                        className="h-8 px-3 rounded-lg bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {template.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Terms Editor */}
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    Terms of Service
                  </FieldLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!terms}
                    className="h-7 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white/30 hover:text-white disabled:opacity-30"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 mr-1 text-green-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>

                <Textarea
                  value={terms}
                  onChange={(e) => handleTermsChange(e.target.value)}
                  placeholder="Enter your terms and conditions here..."
                  className="min-h-[200px] bg-white/5 border-white/5 rounded-xl p-4 text-white text-sm leading-relaxed focus:ring-primary/20 resize-none font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Library Items Drawer */}
      <LibraryItemsDrawer
        open={libraryOpen}
        onOpenChange={setLibraryOpen}
        initialSectionId={targetSectionId}
        initialProjectId={targetProjectId}
        projects={filteredProjects}
        onSelect={handleSelectFromLibrary}
      />

      {/* Line Item Drawer (Add/Edit) */}
      <LineItemDrawer
        open={itemDrawerOpen}
        onOpenChange={(open) => {
          setItemDrawerOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        sections={sections}
        defaultSectionId={defaultSectionForDrawer}
        projects={filteredProjects}
        defaultProjectId={defaultProjectForDrawer}
        onSave={handleSaveItem}
        requireProject={true}
      />
    </div>
  );
}
