"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Star } from "lucide-react";
import { DataTableColumnHeader } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AdminFeedback } from "./types";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<AdminFeedback>[] = [
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
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-black gap-1">
          {rating} <Star className="h-3 w-3 fill-current" />
        </Badge>
      );
    },
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
    cell: ({ row }) => <FeedbackActions item={row.original} />,
  },
];

function FeedbackActions({ item }: { item: AdminFeedback }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/40 hover:text-white"
        onClick={() => router.push(`/feedbacks/${item._id}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
}
