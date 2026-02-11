"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FolderTree, Layout } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TemplateActions } from "./template-actions";
import type { AdminFolderTemplate } from "./types";

export function getColumns(
  onEdit: (template: AdminFolderTemplate) => void,
  onDelete: (id: string, name: string) => void,
): ColumnDef<AdminFolderTemplate>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Template Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
            <FolderTree className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight text-white uppercase group-hover:text-primary transition-colors">
              {row.getValue("name")}
            </span>
            {row.original.isDefault && (
              <span className="text-[8px] font-black text-primary uppercase tracking-widest mt-0.5">
                Default Template
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "projectTypeName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Project Type" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary/60">
          <Layout className="h-3 w-3" />
          {row.getValue("projectTypeName") || "N/A"}
        </div>
      ),
    },
    {
      id: "folderCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Folders" />
      ),
      cell: ({ row }) => (
        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">
          {row.original.folders.length.toString().padStart(2, "0")} VOLUMES
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge
            className={cn(
              "font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full",
              isActive
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-white/5 text-white/40 border-white/5",
            )}
          >
            {isActive ? "ACTIVE" : "INACTIVE"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <TemplateActions
          template={row.original}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
