import { useCallback, useRef } from "react";
import { QuotationFormData } from "../constants";
import { QuotationLineItem, Template } from "../types";

export function useQuotationPackageLogic(
  formDataRef: React.MutableRefObject<QuotationFormData>,
  updateFormData: (updater: (prev: QuotationFormData) => QuotationFormData) => QuotationFormData,
  templates: Template[] | undefined
) {
  const lastAppliedPackageIds = useRef<string>("");

  const applyPackageItems = useCallback(() => {
    if (!templates || !formDataRef.current) return;

    const { step2, step3 } = formDataRef.current;
    const currentPackagesStr = JSON.stringify(step2.packageIds || []);

    // If package selection hasn't changed AND we already have items, don't overwrite.
    if (
      step3.lineItems.length > 0 &&
      lastAppliedPackageIds.current === currentPackagesStr
    ) {
      return;
    }

    const selectedTemplates = templates.filter((t) =>
      step2.packageIds.includes(t._id),
    );

    const newItems: QuotationLineItem[] = [];

    selectedTemplates.forEach((template) => {
      template.lineItems.forEach((item: any) => {
        newItems.push({
          id: crypto.randomUUID(),
          description: item.description,
          unit: item.unit,
          rate: item.rate,
          quantity: item.quantity,
          sectionId: item.sectionId,
          spawnsProject: item.spawnsProject,
          projectTypeId: item.projectTypeId as string,
          selectedFolderTemplateId: item.selectedFolderTemplateId as string,
          sourcePackageId: template._id,
          projectConfigId: item.projectConfigId,
          subItems: item.subItems?.map((s: any) => ({
            id: s.id || crypto.randomUUID(),
            description: s.description,
            unit: s.unit,
            rate: s.rate,
            quantity: s.quantity,
            subItems: s.subItems?.map((ss: any) => ({
              id: ss.id || crypto.randomUUID(),
              description: ss.description,
              unit: ss.unit,
              rate: ss.rate,
              quantity: ss.quantity,
            })),
          })),
        } as QuotationLineItem);
      });
    });

    const newTerms = selectedTemplates
      .map((t) => t.terms)
      .filter(Boolean)
      .join("\n\n");

    updateFormData((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        lineItems: newItems,
        terms: newTerms || prev.step3.terms,
      },
    }));
    
    lastAppliedPackageIds.current = currentPackagesStr;
  }, [formDataRef, templates, updateFormData]);

  return { applyPackageItems, lastAppliedPackageIds };
}
