"use client";

import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { ArrowUpDown, Building, Mail, Phone, Search, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type PaginationInfo,
  StudioTablePagination,
} from "@/components/modules/projects/wizard/steps/step-0-studio-selection/studio-table-pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type Studio = Doc<"profiles">;

interface StudioDataTableProps {
  onSelect?: (studio: Studio) => void;
  selectedId?: string;
  pageSize?: number;
  /** If true, only shows studios that have at least one project */
  onlyWithProjects?: boolean;
}

export function StudioDataTable({
  onSelect,
  selectedId,
  pageSize: initialPageSize = 10,
  onlyWithProjects = false,
}: StudioDataTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const allStudios = useQuery(api.admin.getStudios, {});
  const studiosWithProjects = useQuery(api.admin.getStudiosWithProjects);

  // Use the appropriate studio list based on the prop
  const studios = onlyWithProjects ? studiosWithProjects : allStudios;

  const columns: ColumnDef<Studio>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent p-0 flex items-center gap-2"
          >
            Name
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white uppercase tracking-tight">
                {row.original.name}
              </span>
              <span className="text-[10px] text-white/30 font-medium tracking-wider">
                ID: {row.original._id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-white/50">
            <Mail className="h-3 w-3" />
            <span className="text-xs font-medium">{row.original.email}</span>
          </div>
        ),
      },
      {
        accessorKey: "company",
        header: "Company",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Building className="h-3 w-3 text-white/20" />
            <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
              {row.original.company || "Individual"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-white/40">
            <Phone className="h-3 w-3" />
            <span className="text-xs font-mono">
              {row.original.phone || "N/A"}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        header: "Onboarding",
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className={cn(
              "text-[8px] font-black uppercase tracking-widest",
              row.original.onboardingComplete
                ? "border-green-500/20 text-green-500 bg-green-500/5"
                : "border-amber-500/20 text-amber-500 bg-amber-500/5",
            )}
          >
            {row.original.onboardingComplete ? "Complete" : "Pending"}
          </Badge>
        ),
      },
    ],
    [],
  );

  const filteredData = useMemo(() => {
    if (!studios) return [];
    if (!search) return studios;
    const lowerSearch = search.toLowerCase();
    return studios.filter(
      (s: Studio) =>
        s.name.toLowerCase().includes(lowerSearch) ||
        s.email.toLowerCase().includes(lowerSearch) ||
        s.company?.toLowerCase().includes(lowerSearch),
    );
  }, [studios, search]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Reset to page 1 if current page exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginationInfo: PaginationInfo = {
    currentPage,
    totalPages,
    totalItems: filteredData.length,
    startIndex,
    endIndex,
    pageSize,
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (studios === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-white/5 animate-pulse rounded-xl" />
        <div className="h-64 w-full bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/10 group-focus-within:text-primary group-focus-within:scale-110 transition-all duration-300" />
        <Input
          placeholder="Filter by name, email or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 h-14 bg-white/2 border-white/5 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:bg-white/5 focus:border-primary/30 transition-all shadow-inner"
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        onRowClick={onSelect}
        className={cn(
          "border-white/5",
          selectedId && "ring-1 ring-primary/20 bg-primary/1",
        )}
      />

      {/* Pagination Controls */}
      <StudioTablePagination
        pagination={paginationInfo}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20]}
        itemName="studios"
      />
    </div>
  );
}
