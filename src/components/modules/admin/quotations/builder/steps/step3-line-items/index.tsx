"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotationBuilder } from "../../quotation-builder-context";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

import {
  LibraryItemsDrawer,
  type LibraryDisplayItem,
} from "./library-items-drawer";
import { LineItemDrawer } from "./line-item-drawer";
import { ProjectSectionItems } from "./project-section-items";
import type { QuotationLineItem, Project, Section } from "../../types";

export function Step3LineItems() {
  const {
    formData,
    addLineItem,
    updateLineItem,
    removeLineItem,
    nextStep,
    setSubmitTrigger,
    projects,
  } = useQuotationBuilder();

  // Access step4 for lineItems (Calculate Worth)
  const { lineItems } = formData.step4;
  // Access step2 for projectIds (Project Selection)
  const selectedProjectIds = formData.step2.projectIds;
  const filteredProjects =
    (projects as Project[])?.filter((p) =>
      selectedProjectIds.includes(p._id),
    ) || [];

  const sections =
    (useQuery(api.functions.quotations.sections.queries.getSections, {
      activeOnly: true,
    }) as Section[]) || [];

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
    let changed = false;
    // We using functional update to access latest state without adding it to deps if possible,
    // but better to just compare with current state logic
    const newSeen = new Set(seenProjectsRef.current);

    // Check for new projects
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

  // Register submit trigger
  useEffect(() => {
    setSubmitTrigger(nextStep);
    return () => setSubmitTrigger(null);
  }, [nextStep, setSubmitTrigger]);

  // Open library for specific section/project
  const openLibrary = useCallback(
    (sectionId: string | null = null, projectId?: string) => {
      setTargetSectionId(sectionId);
      setTargetProjectId(projectId);
      setLibraryOpen(true);
    },
    [],
  );

  // Open drawer to add new item (with project and optional section)
  const openAddItemDrawer = useCallback(
    (projectId?: string, sectionId?: string) => {
      setEditingItem(null);
      // Use provided projectId or default to first project if only one
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
      // Use the projectId from the library drawer, or fallback
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

  // Handle save from drawer (add or update)
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

  return (
    <div className="w-full flex flex-col h-full">
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase text-white">
              Calculate Worth
            </h2>
            <p className="text-sm text-white/40 font-medium">
              Define the line items and pricing for this quotation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => openLibrary()}
              disabled={!hasProjects}
              className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BookOpen className="h-4 w-4 mr-2 text-primary" />
              Library
            </Button>
            <Button
              type="button"
              onClick={() => openAddItemDrawer()}
              disabled={!hasProjects}
              className="h-10 px-4 rounded-xl font-bold uppercase tracking-widest text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Project-based Items Display */}
        <div className="mt-6 p-5 rounded-2xl bg-white/2 border border-white/5">
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
