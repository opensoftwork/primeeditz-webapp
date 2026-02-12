import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Project } from "../../types";

export function useQuotationData(data: any | null | undefined) {
  return useMemo(() => {
    if (!data) return null;

    const { quotation, sections, projects: rawProjects = [] } = data;

    // 1. Transform projects
    const projects: Project[] = rawProjects.map((p: any) => ({
      ...p,
      eventName: p.endClientName || p.code,
      projectTypeId: p.projectTypeId,
    }));

    // 2. Calculate totals
    const subtotal = quotation.lineItems.reduce((acc: number, item: any) => {
      const itemTotal = item.rate * item.quantity;
      const subItemsTotal =
        item.subItems?.reduce(
          (s: number, sub: any) => s + sub.rate * sub.quantity,
          0,
        ) ?? 0;
      return acc + itemTotal + subItemsTotal;
    }, 0);

    const discountAmount = quotation.discountAmount || 0;
    const taxRate = quotation.taxRate || 0;
    const taxAmount = (subtotal - discountAmount) * taxRate;
    const grandTotal = subtotal - discountAmount + taxAmount;

    // 3. Group by Project (Preferred)
    const groupedByProject = projects
      .map((project) => {
        const projectItems = quotation.lineItems.filter(
          (item: any) => item.projectId === project._id,
        );

        const sectionGroups = sections
          .map((section: any) => ({
            section,
            items: projectItems.filter(
              (item: any) => item.sectionId === section._id,
            ),
          }))
          .filter((g: any) => g.items.length > 0);

        const unsectionedItems = projectItems.filter(
          (item: any) =>
            !item.sectionId ||
            !sections.some((s: any) => s._id === item.sectionId),
        );

        if (unsectionedItems.length > 0) {
          sectionGroups.push({
            section: {
              _id: "unsectioned" as Id<"quotationSections">,
              _creationTime: 0,
              name: "Standard Services",
              color: "zinc",
              isActive: true,
            } as any,
            items: unsectionedItems,
          });
        }

        return { project, sectionGroups };
      })
      .filter((pg) => pg.sectionGroups.length > 0);

    // 4. Group by Section (Fallback)
    const groupedBySection = sections
      .map((section: any) => ({
        section,
        items: quotation.lineItems.filter(
          (item: any) => item.sectionId === section._id,
        ),
      }))
      .filter((g: any) => g.items.length > 0);

    const globalUnsectioned = quotation.lineItems.filter(
      (item: any) =>
        !item.sectionId || !sections.some((s: any) => s._id === item.sectionId),
    );

    if (globalUnsectioned.length > 0) {
      groupedBySection.push({
        section: {
          _id: "unsectioned" as Id<"quotationSections">,
          _creationTime: 0,
          name: "Standard Services",
          color: "zinc",
          isActive: true,
        } as any,
        items: globalUnsectioned,
      });
    }

    return {
      quotation,
      sections,
      projects,
      subtotal,
      discountAmount,
      taxRate,
      taxAmount,
      grandTotal,
      groupedByProject,
      groupedBySection,
    };
  }, [data]);
}
