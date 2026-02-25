import { useCallback, useMemo } from "react";
import { QuotationFormData } from "../constants";
import { QuotationSubItem } from "../types";

export function useQuotationCalculations(formData: QuotationFormData) {
  // Recursive total calculation for 3-level nesting (1 → 1.1 → 1.1.1)
  const calculateItemTotal = useCallback(
    (item: {
      rate: number;
      quantity: number;
      subItems?: QuotationSubItem[];
    }): number => {
      const self = item.rate * item.quantity;
      const subTotal = (item.subItems || []).reduce((sum, sub) => {
        const subSelf = sub.rate * sub.quantity;
        const subSubTotal = (sub.subItems || []).reduce(
          (s, ss) => s + ss.rate * ss.quantity,
          0,
        );
        return sum + subSelf + subSubTotal;
      }, 0);
      return self + subTotal;
    },
    [],
  );

  const subtotal = useMemo(() => {
    return formData.step3.lineItems.reduce(
      (acc, item) => acc + calculateItemTotal(item),
      0,
    );
  }, [formData.step3.lineItems, calculateItemTotal]);

  const taxAmount =
    (subtotal - formData.step3.discountAmount) * (formData.step3.taxRate / 100);
  const grandTotal = subtotal - formData.step3.discountAmount + taxAmount;

  return {
    calculateItemTotal,
    subtotal,
    taxAmount,
    grandTotal,
  };
}
