import { QuotationLineItem } from "./types";

export type QuotationStepId = 1 | 2 | 3;

export interface QuotationFormData {
  step1: {
    studioId: string;
    validUntil: Date | undefined;
  };
  step2: {
    packageIds: string[];
  };
  step3: {
    projectIds: string[];
    lineItems: QuotationLineItem[];
    terms: string;
    taxRate: number;
    discountAmount: number;
    shareLinkEnabled: boolean;
  };
}

export const INITIAL_FORM_DATA: QuotationFormData = {
  step1: {
    studioId: "",
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  step2: {
    packageIds: [],
  },
  step3: {
    projectIds: [],
    lineItems: [],
    terms: "",
    taxRate: 18,
    discountAmount: 0,
    shareLinkEnabled: true,
  },
};

export const QUOTATION_STEPS = [
  { id: 1 as const, label: "Studio & Context" },
  { id: 2 as const, label: "Package Selection" },
  { id: 3 as const, label: "Review & Send" },
];
