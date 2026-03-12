import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { QuotationFormData, QuotationStepId } from "../constants";
import { Project, Client, Section } from "../types";

interface UseQuotationMutationsProps {
  formDataRef: React.MutableRefObject<QuotationFormData>;
  quotationId: string | null;
  setQuotationId: (id: string | null) => void;
  currentStep: QuotationStepId;
  projects: Project[] | undefined;
  selectedStudio: Client | undefined;
  sections: Section[] | undefined;
  isLocalUpdateRef: React.MutableRefObject<boolean>;
  lastUpdateTimestampRef: React.MutableRefObject<number>;
}

export function useQuotationMutations({
  formDataRef,
  quotationId,
  setQuotationId,
  currentStep,
  projects,
  selectedStudio,
  sections,
  isLocalUpdateRef,
  lastUpdateTimestampRef,
}: UseQuotationMutationsProps) {
  const createQuotation = useMutation(api.functions.quotations.mutations.createQuotation);
  const updateQuotation = useMutation(api.functions.quotations.mutations.updateQuotation);

  const performSave = useCallback(
    async (isAutoSave = false, overrides: any = {}) => {
      const { step1, step2, step3 } = formDataRef.current;

      if (isAutoSave && !step1.studioId) return null;
      if (!isAutoSave && !step1.studioId) throw new Error("Please select a client");

      if (isAutoSave && step3.lineItems.length === 0 && step2.packageIds.length === 0) {
        return null;
      }

      if (!isAutoSave && step3.lineItems.length === 0 && step2.packageIds.length === 0) {
        throw new Error("Please add packages or line items");
      }

      const lineItemsPayload = step3.lineItems.map((item) => {
        const sectionId = item.sectionId || sections?.[0]?._id;
        return {
          id: item.id || crypto.randomUUID(),
          sectionId: sectionId as Id<"quotationSections"> | undefined,
          projectId: item.projectId,
          description: item.description,
          unit: item.unit,
          rate: item.rate,
          quantity: item.quantity,
          spawnsProject: item.spawnsProject,
          projectTypeId: item.projectTypeId as Id<"projectTypes"> | undefined,
          selectedFolderTemplateId: item.selectedFolderTemplateId as Id<"folderTemplates"> | undefined,
          sourcePackageId: (item.sourcePackageId as any) || undefined,
          projectConfigId: item.projectConfigId || undefined,
          subItems: item.subItems?.map((s) => ({
            id: s.id || crypto.randomUUID(),
            description: s.description,
            unit: s.unit,
            rate: s.rate,
            quantity: s.quantity,
            subItems: s.subItems?.map((ss) => ({
              id: ss.id || crypto.randomUUID(),
              description: ss.description,
              unit: ss.unit,
              rate: ss.rate,
              quantity: ss.quantity,
            })),
          })),
        };
      });

      const firstProjectId = step3.projectIds?.[0];
      const associatedProject = (projects as Project[])?.find((p) => p._id === firstProjectId);
      const endClientName = associatedProject?.eventName || selectedStudio?.name || "Untitled Quotation";

      const projectIds = (step3.projectIds && step3.projectIds.length > 0) ? (step3.projectIds as Id<"projects">[]) : undefined;

      const basePayload = {
        studioId: step1.studioId as Id<"profiles">,
        projectIds,
        selectedPackageIds: step2.packageIds as Id<"servicePackages">[],
        lineItems: lineItemsPayload,
        terms: step3.terms,
        taxRate: step3.taxRate / 100,
        discountAmount: step3.discountAmount,
        validUntil: step1.validUntil?.getTime(),
        endClientName,
        lastStep: currentStep,
        ...overrides,
      };

      isLocalUpdateRef.current = true;
      lastUpdateTimestampRef.current = Date.now();

      if (quotationId) {
        await updateQuotation({
          quotationId: quotationId as Id<"quotations">,
          ...basePayload,
        });
        return quotationId;
      } else {
        const res = await createQuotation({
          ...basePayload,
          createdBy: "ADMIN",
        });
        setQuotationId(res);
        if (isAutoSave) {
          window.history.replaceState(null, "", `/quotations/${res}/builder?step=${currentStep}`);
        }
        return res;
      }
    },
    [
      formDataRef,
      sections,
      projects,
      selectedStudio,
      currentStep,
      quotationId,
      updateQuotation,
      createQuotation,
      setQuotationId,
      isLocalUpdateRef,
      lastUpdateTimestampRef,
    ]
  );

  return { performSave };
}
