import { useCallback, useRef, useState } from "react";
import { QuotationFormData, INITIAL_FORM_DATA, QuotationStepId } from "../constants";

export function useQuotationState(initialStep: QuotationStepId = 1) {
  const [formData, setFormDataStateRaw] = useState<QuotationFormData>(INITIAL_FORM_DATA);
  const formDataRef = useRef<QuotationFormData>(INITIAL_FORM_DATA);
  const [currentStep, setCurrentStep] = useState<QuotationStepId>(initialStep);
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback((updater: (prev: QuotationFormData) => QuotationFormData) => {
    const next = updater(formDataRef.current);
    formDataRef.current = next;
    setFormDataStateRaw(next);
    setIsDirty(true);
    return next;
  }, []);

  const setFormData = useCallback(<K extends keyof QuotationFormData>(
    step: K,
    data: Partial<QuotationFormData[K]>
  ) => {
    return updateFormData(prev => ({
      ...prev,
      [step]: { ...prev[step], ...data }
    }));
  }, [updateFormData]);

  return {
    formData,
    formDataRef,
    setFormData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isDirty,
    setIsDirty
  };
}
