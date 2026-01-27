"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { Briefcase, ChevronLeft, Filter, Search, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { columns, type EmployeeWithWorkload } from "./columns";
import { SquadBuilderBar } from "./squad-builder-bar";

interface AssignTeamContainerProps {
  projectId: string;
}

export default function AssignTeamContainer({
  projectId,
}: AssignTeamContainerProps) {
  const router = useRouter();
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  // Queries
  const project = useQuery(api.admin.getAdminProject, {
    projectId: projectId as Id<"projects">,
  });
  const employees = useQuery(api.admin.listEmployeesWithWorkload) || [];

  // Mutations
  const assignSquad = useMutation(api.admin.assignSquad);

  const table = useReactTable({
    data: employees as EmployeeWithWorkload[],
    columns,
    state: {
      rowSelection,
      globalFilter,
      sorting,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
    <div className="flex-1 p-8 md:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen pb-32">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="p-0 hover:bg-transparent text-white/40 hover:text-white flex items-center gap-2 group mb-2"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Back to Project
            </span>
          </Button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">
                Assign Command Squad
              </h1>
              <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em] mt-1">
                Project: {project.code} — {project.eventName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
            <Input
              placeholder="SEARCH PROFESSIONALS..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-11 h-12 bg-white/5 border-white/5 rounded-xl uppercase text-[10px] font-black tracking-widest placeholder:text-white/10"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 w-12 rounded-xl border-white/5 bg-white/5 p-0"
          >
            <Filter className="h-4 w-4 text-white/40" />
          </Button>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="rounded-[2.5rem] border border-white/5 bg-zinc-900/30 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 bg-white/2 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-white/40">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span>{employees.length} Available Specialists</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-3 w-3" />
              <span>Studio Resource Pool</span>
            </div>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/1">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-white/5 hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-14">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      data-state={row.getIsSelected() && "selected"}
                      className={cn(
                        "h-20 border-white/5 transition-colors group/row",
                        row.getIsSelected()
                          ? "bg-primary/3"
                          : "hover:bg-white/2",
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-64 text-center"
                    >
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Users className="h-12 w-12 text-white/10" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                          No specialists found matching your search.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        <div className="p-6 border-t border-white/5 bg-white/1 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/20">
          <span>
            Showing {table.getRowModel().rows.length} of {employees.length}{" "}
            professionals
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg h-8 border-white/5 bg-white/5"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg h-8 border-white/5 bg-white/5"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <SquadBuilderBar
        selectedMembers={selectedMembers}
        onRemove={(id) => {
          const row = table
            .getRowModel()
            .rows.find((r) => r.original._id === id);
          if (row) row.toggleSelected(false);
        }}
        onConfirm={handleConfirm}
        isConfirming={isConfirming}
      />
    </div>
  );
}
