export interface Section {
  _id: string;
  name: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface TemplateLineItem {
  sectionId: string;
  description: string;
  unit: string;
  unitPrice: number;
  defaultQuantity: number;
  subItems?: {
    description: string;
    unit: string;
    unitPrice: number;
    defaultQuantity: number;
  }[];
}

export interface Template {
  _id: string;
  _creationTime: number;
  name: string;
  description?: string;
  lineItems: TemplateLineItem[];
  terms?: string;
  projectTypeHint?: string;
  isActive: boolean;
  createdBy: string;
  updatedAt: number;
}
