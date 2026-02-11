"use client";

import { Edit3, Trash2 } from "lucide-react";
import {
  DataTableRowActions,
  type RowAction,
} from "@/components/shared/data-table";
import type { AdminFolderTemplate } from "./types";

interface TemplateActionsProps {
  template: AdminFolderTemplate;
  onEdit: (template: AdminFolderTemplate) => void;
  onDelete: (id: string, name: string) => void;
}

export function TemplateActions({
  template,
  onEdit,
  onDelete,
}: TemplateActionsProps) {
  const actions: RowAction<AdminFolderTemplate>[] = [
    {
      label: "Edit Template",
      icon: Edit3,
      onClick: () => onEdit(template),
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      separator: true,
      onClick: () => onDelete(template._id, template.name),
    },
  ];

  return <DataTableRowActions row={template} actions={actions} />;
}
