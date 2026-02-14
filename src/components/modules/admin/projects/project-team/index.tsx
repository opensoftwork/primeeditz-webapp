"use client";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import {
  type ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/shared/data-table";
import type { AdminProjectDetail } from "../project-detail/types";
import type { EmployeeWithWorkload } from "./columns";
import { getTeamColumns, type TeamMember } from "./team-columns";
import { AddEmployeeDrawer } from "./add-employee-drawer";

interface ProjectTeamContainerProps {
  projectId: string;
}

export default function ProjectTeamContainer({
  projectId,
}: ProjectTeamContainerProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ------ Data Queries ------
  //@ts-ignore
  const project = useQuery(api.admin.getAdminProject, {
    projectId: projectId as Id<"projects">,
  }) as AdminProjectDetail | null | undefined;

  const allEmployees =
    (useQuery(api.admin.listEmployeesWithWorkload) as EmployeeWithWorkload[]) ||
    [];

  const currentSquad = useQuery(api.admin.getProjectSquad, {
    projectId: projectId as Id<"projects">,
  });

  // ------ Local team state ------
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync from server on first load
  useEffect(() => {
    if (currentSquad && allEmployees.length > 0 && !hasInitialized) {
      const members: TeamMember[] = currentSquad.map((sq) => {
        const emp = allEmployees.find((e) => e._id === sq.profileId);
        return {
          profileId: sq.profileId,
          name: sq.profile?.name || emp?.name || "Unknown",
          email: sq.profile?.email || emp?.email || "",
          role: sq.role || "Editor",
          designation: sq.profile?.designation || emp?.designation,
          image: sq.profile?.image || emp?.image,
          isLead: sq.isLead ?? false,
          activeProjects: emp?.activeProjects ?? 0,
          maxCapacity: emp?.maxCapacity ?? 5,
          assignedAt: sq.assignedAt,
        };
      });
      setTeamMembers(members);
      setHasInitialized(true);
    }
  }, [currentSquad, allEmployees, hasInitialized]);

  // ------ Mutations ------
  const assignSquad = useMutation(api.admin.assignSquad);

  // ------ Handlers ------
  const handleRemoveMember = useCallback((profileId: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.profileId !== profileId));
  }, []);

  const handleAddEmployee = useCallback(
    (employee: EmployeeWithWorkload) => {
      // Avoid duplicates
      if (teamMembers.some((m) => m.profileId === employee._id)) {
        toast.info(`${employee.name} is already on the team`);
        return;
      }

      const newMember: TeamMember = {
        profileId: employee._id,
        name: employee.name,
        email: employee.email,
        role: employee.designation || "Editor",
        designation: employee.designation,
        image: employee.image,
        isLead: teamMembers.length === 0, // First member becomes lead
        activeProjects: employee.activeProjects,
        maxCapacity: employee.maxCapacity,
      };

      setTeamMembers((prev) => [...prev, newMember]);
      toast.success(`${employee.name} added to the team`);
    },
    [teamMembers],
  );

  const handleSaveTeam = useCallback(async () => {
    if (teamMembers.length === 0) {
      toast.error("Please add at least one team member");
      return;
    }

    setIsSaving(true);
    try {
      await assignSquad({
        projectId: projectId as Id<"projects">,
        members: teamMembers.map((m, i) => ({
          profileId: m.profileId as Id<"profiles">,
          role: m.role,
          isLead: i === 0,
        })),
        notes: "Team updated via Project Team view.",
      });

      toast.success("Project team saved successfully!");
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save team",
      );
    } finally {
      setIsSaving(false);
    }
  }, [teamMembers, projectId, assignSquad, router]);

  // ------ Table config ------
  const teamColumns = useMemo(
    () => getTeamColumns(handleRemoveMember),
    [handleRemoveMember],
  );

  const table = useReactTable({
    data: teamMembers,
    columns: teamColumns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.profileId,
  });

  // Detect if team changed from server state
  const hasChanges = useMemo(() => {
    if (!currentSquad || !hasInitialized) return false;
    const serverIds = currentSquad
      .map((s) => s.profileId)
      .sort()
      .join(",");
    const localIds = teamMembers
      .map((m) => m.profileId)
      .sort()
      .join(",");
    return serverIds !== localIds;
  }, [currentSquad, teamMembers, hasInitialized]);

  const existingMemberIds = useMemo(
    () => teamMembers.map((m) => m.profileId),
    [teamMembers],
  );

  if (!project) return null;

  return (
    <div className="flex-1 p-8 md:p-12 flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
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
                Project Team
              </h1>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-2">
                Project: {project.code} — {project.eventName}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <Button
              onClick={handleSaveTeam}
              disabled={isSaving}
              className="rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest gap-2 h-11 px-6 transition-all hover:scale-[1.02]"
            >
              {isSaving ? (
                <div className="animate-spin h-4 w-4 border-2 border-black/20 border-t-black rounded-full" />
              ) : (
                "Save Changes"
              )}
            </Button>
          )}
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest gap-2 h-11 px-6 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-white/30">
          <Users className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""}{" "}
            assigned
          </span>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80">
              Unsaved changes
            </span>
          </div>
        )}
      </div>

      {/* Team Table */}
      {teamMembers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl">
          <div className="p-6 rounded-full bg-white/5 border border-white/5 mb-6">
            <Users className="h-10 w-10 text-white/10" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white/30 mb-2">
            No Team Members Yet
          </h3>
          <p className="text-xs font-bold text-white/20 uppercase tracking-widest mb-6 max-w-sm text-center">
            Click "Add Employee" to assign professionals to this project.
          </p>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest gap-2"
          >
            <Plus className="h-4 w-4" />
            Add First Member
          </Button>
        </div>
      ) : (
        <DataTable
          table={table}
          columns={teamColumns}
          data={teamMembers}
          isLoading={!hasInitialized}
          getRowId={(row) => row.profileId}
          className="flex-1 min-h-0"
          toolbar={{
            search: {
              column: "name",
              placeholder: "SEARCH TEAM MEMBERS...",
            },
          }}
        />
      )}

      {/* Add Employee Drawer */}
      <AddEmployeeDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        employees={allEmployees}
        existingMemberIds={existingMemberIds}
        onAddEmployee={handleAddEmployee}
      />
    </div>
  );
}
