import type { Id } from "@convex/_generated/dataModel";
import type { FolderLevel1 } from "@convex/schema";

export type WizardStep = 1 | 2 | 3;

export const WIZARD_STEPS = [
  {
    id: 1,
    title: "Identity",
    description: "Define the project type basics",
    icon: "Tag",
  },
  {
    id: 2,
    title: "Folder Structure",
    description: "Design the default folder hierarchy",
    icon: "FolderTree",
  },
  {
    id: 3,
    title: "Review",
    description: "Confirm and create",
    icon: "CheckCircle",
  },
] as const;

export interface Step1Data {
  name: string;
  description?: string;
  categoryId?: Id<"projectCategories">;
  icon?: string;
  isActive: boolean;
}

export interface WizardState {
  step: WizardStep;
  step1Data: Step1Data | null;
  folders: FolderLevel1[];
  folderTemplateName: string;
  isDraft: boolean;
  draftId: Id<"projectTypes"> | null;
  isEditing: boolean;
  editingId: Id<"projectTypes"> | null;
  existingTemplateId: Id<"folderTemplates"> | null;
}
