"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AdminQuotation } from "./list-types";
import { QuotationStatusBadge } from "@/components/modules/client/quotations/shared/quotation-status-badge";
import { format } from "date-fns";
import { Eye, Receipt, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const columns: ColumnDef<AdminQuotation>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      const quotation = row.original;
      return (
        <Link 
          href={`/quotations/${quotation._id}`}
          className="flex items-center gap-2 group/link"
        >
          <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 group-hover/link:bg-primary/10 group-hover/link:border-primary/20 transition-colors">
            <Receipt className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-black text-white group-hover/link:text-primary transition-colors uppercase tracking-tight">
            {quotation.code}
          </span>
        </Link>
      );
    },
  },
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => {
      const name = row.getValue("clientName") as string;
      return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <User className="h-3 w-3 text-white/40" />
            </div>
            <span className="font-bold text-white/50 truncate max-w-[150px] block">
                {name || "Guest"}
            </span>
        </div>
      );
    },
  },
  {
    accessorKey: "projectName",
    header: "Project",
    cell: ({ row }) => {
      const name = row.getValue("projectName") as string;
      return (
        <span className="font-bold text-white/30 truncate max-w-[200px] block text-xs uppercase tracking-tight">
          {name || "General"}
        </span>
      );
    },
  },
  {
    accessorKey: "total",
    header: "Total Amount",
    cell: ({ row }) => {
      const amount = row.getValue("total") as number;
      return (
        <div className="flex flex-col">
          <span className="font-black text-white tracking-tight">
            ₹{amount.toLocaleString("en-IN")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as AdminQuotation["status"];
      return <QuotationStatusBadge status={status} />;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "_creationTime",
    header: "Created",
    cell: ({ row }) => {
      return (
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
          {format(row.getValue("_creationTime"), "MMM dd, yyyy")}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const quotation = row.original;
      return (
        <div className="flex justify-end">
          <Link href={`/quotations/${quotation._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-white/20 hover:text-primary hover:bg-primary/10"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      );
    },
  },
];
