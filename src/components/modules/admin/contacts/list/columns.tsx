"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Trash2 } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import type { AdminContact } from "./types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const columns: ColumnDef<AdminContact>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="text-sm font-black tracking-tight text-white uppercase">
        {row.getValue("name")}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-white/60">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "service",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Service" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-white/60">{row.getValue("service")}</span>
    ),
  },
  {
    accessorKey: "_creationTime",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-white/40">
        {format(row.getValue("_creationTime"), "MMM dd, yyyy")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <ContactActions item={row.original} />,
  },
];

function ContactActions({ item }: { item: AdminContact }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/40 hover:text-white"
        onClick={() => router.push(`/contacts/${item._id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}
