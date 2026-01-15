"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Search,
  User,
  Mail,
  Building,
  Phone,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Doc } from "@convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type Client = Doc<"profiles">;

interface ClientDataTableProps {
  onSelect?: (client: Client) => void;
  selectedId?: string;
  pageSize?: number;
  /** If true, only shows clients that have at least one project */
  onlyWithProjects?: boolean;
}

export function ClientDataTable({
  onSelect,
  selectedId,
  pageSize = 10,
  onlyWithProjects = false,
}: ClientDataTableProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const allClients = useQuery(api.admin.getClients);
  const clientsWithProjects = useQuery(api.admin.getClientsWithProjects);
  
  // Use the appropriate client list based on the prop
  const clients = onlyWithProjects ? clientsWithProjects : allClients;


  const columns: ColumnDef<Client>[] = useMemo(
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
                : "border-amber-500/20 text-amber-500 bg-amber-500/5"
            )}
          >
            {row.original.onboardingComplete ? "Complete" : "Pending"}
          </Badge>
        ),
      },
    ],
    []
  );

  const filteredData = useMemo(() => {
    if (!clients) return [];
    if (!search) return clients;
    const lowerSearch = search.toLowerCase();
    return clients.filter(
      (c: Client) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.email.toLowerCase().includes(lowerSearch) ||
        c.company?.toLowerCase().includes(lowerSearch)
    );
  }, [clients, search]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useMemo(() => {
    setCurrentPage(1);
  }, [search]);

  if (clients === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full bg-white/5 animate-pulse rounded-xl" />
        <div className="h-64 w-full bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Filter by name, email or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-12 bg-white/2 border-white/5 rounded-2xl text-sm font-bold placeholder:text-white/10 focus:border-primary/50 transition-all shadow-inner"
        />
      </div>

      <DataTable
        columns={columns}
        data={paginatedData}
        onRowClick={onSelect}
        className={cn("border-white/5", selectedId && "ring-1 ring-primary/20")}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-xs text-white/40 font-medium">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredData.length)}{" "}
            of {filteredData.length} clients
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-3 bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-bold",
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-3 bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-30"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
