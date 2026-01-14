import { Doc } from "@convex/_generated/dataModel";

export type Section = Doc<"quotationSections">;
export type Template = Doc<"quotationTemplates">;
export type TemplateLineItem = Template["lineItems"][number];
