"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/shared/data-table";
import { columns, type EmployeeWithWorkload } from "./columns";
import { SquadBuilderBar } from "./squad-builder-bar";

interface AssignTeamContainerProps {
  projectId: string;
}

export default function AssignTeamContainer({
  projectId,
}: AssignTeamContainerProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isConfirming, setIsConfirming] = useState(false);

  // Queries
  //@ts-ignore
  const project = useQuery(api.admin.getAdminProject, {
    projectId: projectId as Id<"projects">,
  });
  //@ts-ignore
  const employees = useQuery(api.admin.listEmployeesWithWorkload) || [];

  // Mutations
  const assignSquad = useMutation(api.admin.assignSquad);

  const table = useReactTable({
    data: employees as EmployeeWithWorkload[],
    columns,
    state: {
      rowSelection,
      columnFilters,
      sorting,
      pagination,
    },
    enableRowSelection: true,
    getRowId: (row) => row._id,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const selectedMembers = useMemo(() => {
    return table.getSelectedRowModel().rows.map((row) => ({
      profileId: row.original._id,
      name: row.original.name,
      role: row.original.designation || "Editor",
      image: row.original.image,
    }));
  }, [rowSelection, employees, table]);

  const handleConfirm = async () => {
    if (selectedMembers.length === 0) return;

    setIsConfirming(true);
    try {
      await assignSquad({
        projectId: projectId as Id<"projects">,
        members: selectedMembers.map((m, i) => ({
          profileId: m.profileId as Id<"profiles">,
          role: m.role,
          isLead: i === 0, // First selected is lead by default
        })),
        notes: `Squad assigned via Admin Command Center.`,
      });

      toast.success("Squad assigned successfully!");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign squad",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  if (!project) return null;

  return (
    <div className="flex-1 p-8 md:p-12 flex flex-col space-y-10 h-[calc(100vh-120px)] overflow-hidden">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
                Assign Command Squad
              </h1>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">
                Project: {project.code} — {project.eventName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        columns={columns}
        data={employees}
        isLoading={employees.length === 0}
        getRowId={(row) => row._id}
        onRowSelectionChange={setRowSelection}
        rowSelection={rowSelection}
        className="flex-1 min-h-0"
        toolbar={{
          search: {
            column: "name",
            placeholder: "SEARCH PROFESSIONALS...",
          },
          customActions: null,
        }}
      />

      <SquadBuilderBar
        selectedMembers={selectedMembers}
        onRemove={(id) => {
          setRowSelection((prev) => {
            const next = { ...prev };
            delete next[id];
            return next;
          });
        }}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
      />
    </div>
  );
}
