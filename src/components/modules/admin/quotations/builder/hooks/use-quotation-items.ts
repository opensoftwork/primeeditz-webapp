import { useCallback } from "react";
import { QuotationFormData } from "../constants";
import { QuotationLineItem, QuotationSubItem } from "../types";

export function useQuotationItems(
  updateFormData: (updater: (prev: QuotationFormData) => QuotationFormData) => QuotationFormData
) {
  const addLineItem = useCallback((data?: Partial<QuotationLineItem>) => {
    const newItem: QuotationLineItem = {
      id: crypto.randomUUID(),
      description: "",
      rate: 0,
      quantity: 1,
      unit: "ea",
      ...data,
    } as QuotationLineItem;
    
    updateFormData((prev) => ({
      ...prev,
      step3: {
        ...prev.step3,
        lineItems: [...prev.step3.lineItems, newItem],
      },
    }));
  }, [updateFormData]);

  const updateLineItem = useCallback(
    (idx: number, updates: Partial<QuotationLineItem>) => {
      updateFormData((prev) => {
        const newItems = [...prev.step3.lineItems];
        newItems[idx] = { ...newItems[idx], ...updates };
        return {
          ...prev,
          step3: { ...prev.step3, lineItems: newItems },
        };
      });
    },
    [updateFormData],
  );

  const removeLineItem = useCallback((idx: number) => {
    updateFormData((prev) => {
      const newItems = [...prev.step3.lineItems];
      newItems.splice(idx, 1);
      return {
        ...prev,
        step3: { ...prev.step3, lineItems: newItems },
      };
    });
  }, [updateFormData]);

  const addSubItem = useCallback(
    (parentIdx: number, subItem: QuotationSubItem, subParentIdx?: number) => {
      updateFormData((prev) => {
        const newItems = [...prev.step3.lineItems];
        const item = { ...newItems[parentIdx] };

        if (subParentIdx !== undefined) {
          const subItems = [...(item.subItems || [])];
          const subItemToUpdate = { ...subItems[subParentIdx] };
          subItemToUpdate.subItems = [
            ...(subItemToUpdate.subItems || []),
            subItem,
          ];
          subItems[subParentIdx] = subItemToUpdate;
          item.subItems = subItems;
        } else {
          item.subItems = [...(item.subItems || []), subItem];
        }

        newItems[parentIdx] = item;
        return {
          ...prev,
          step3: { ...prev.step3, lineItems: newItems },
        };
      });
    },
    [updateFormData],
  );

  const updateSubItem = useCallback(
    (
      parentIdx: number,
      subIdx: number,
      updates: Partial<QuotationSubItem>,
      subSubIdx?: number,
    ) => {
      updateFormData((prev) => {
        const newItems = [...prev.step3.lineItems];
        const item = { ...newItems[parentIdx] };
        const subItems = [...(item.subItems || [])];

        if (subSubIdx !== undefined) {
          const subItemToUpdate = { ...subItems[subIdx] };
          const subSubItems = [...(subItemToUpdate.subItems || [])];
          subSubItems[subSubIdx] = { ...subSubItems[subSubIdx], ...updates };
          subItemToUpdate.subItems = subSubItems;
          subItems[subIdx] = subItemToUpdate;
        } else {
          subItems[subIdx] = { ...subItems[subIdx], ...updates };
        }

        item.subItems = subItems;
        newItems[parentIdx] = item;
        return {
          ...prev,
          step3: { ...prev.step3, lineItems: newItems },
        };
      });
    },
    [updateFormData],
  );

  const removeSubItem = useCallback(
    (parentIdx: number, subIdx: number, subSubIdx?: number) => {
      updateFormData((prev) => {
        const newItems = [...prev.step3.lineItems];
        const item = { ...newItems[parentIdx] };
        const subItems = [...(item.subItems || [])];

        if (subSubIdx !== undefined) {
          const subItemToUpdate = { ...subItems[subIdx] };
          const subSubItems = [...(subItemToUpdate.subItems || [])];
          subSubItems.splice(subSubIdx, 1);
          subItemToUpdate.subItems = subSubItems;
          subItems[subIdx] = subItemToUpdate;
        } else {
          subItems.splice(subIdx, 1);
        }

        item.subItems = subItems;
        newItems[parentIdx] = item;
        return {
          ...prev,
          step3: { ...prev.step3, lineItems: newItems },
        };
      });
    },
    [updateFormData],
  );

  return {
    addLineItem,
    updateLineItem,
    removeLineItem,
    addSubItem,
    updateSubItem,
    removeSubItem,
  };
}
