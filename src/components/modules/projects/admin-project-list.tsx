"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  ArrowUpDown,
  Eye,
} from "lucide-react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { StatusBadge } from "@/components/modules/projects/detail/shared";

export function AdminProjectList() {
  // Filter state
  const [phase, setPhase] = useState<string | undefined>(undefined);
  const [actionState, setActionState] = useState<string | undefined>(undefined);
  const [projectTypeId, setProjectTypeId] = useState<
    Id<"projectTypes"> | undefined
  >(undefined);
  const [clientSearch, setClientSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Fetch projects with filters
  const projectsData = useQuery(api.admin.getAdminProjects, {
    phase: phase as any,
    actionState: actionState as any,
    projectTypeId: projectTypeId,
    clientSearch: debouncedSearch || undefined,
    sortBy: sortBy,
    sortOrder: sortOrder,
    page: page,
    pageSize: 20,
  });

  // Fetch project types for filter
  const projectTypes = useQuery(api.admin.getProjectTypes);

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setClientSearch(value);
    setPage(1);
    // Simple debounce
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 300);
  };

  // Handle filter changes
  const handleActionStateChange = (value: string) => {
    setActionState(value === "all" ? undefined : value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setProjectTypeId(
      value === "all" ? undefined : (value as Id<"projectTypes">),
    );
    setPage(1);
  };

  const handleSortChange = (newSortBy: "date" | "status") => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Loading state
  if (!projectsData || !projectTypes) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { projects, pagination } = projectsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-primary" />
            Projects
          </h1>
          <p className="text-muted-foreground">
            Manage and view all projects ({pagination.totalCount} total)
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by client or code..."
                value={clientSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={actionState ?? "all"}
              onValueChange={handleActionStateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="awaiting_quotation">
                  Awaiting Quotation
                </SelectItem>
                <SelectItem value="work_in_progress">
                  Work In Progress
                </SelectItem>
                <SelectItem value="deliverables_ready">QC Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Project Type Filter */}
            <Select
              value={projectTypeId ?? "all"}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {projectTypes.map((type) => (
                  <SelectItem key={type._id} value={type._id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <Button
                variant={sortBy === "date" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("date")}
                className="flex-1"
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
              </Button>
              <Button
                variant={sortBy === "status" ? "default" : "outline"}
                size="sm"
                onClick={() => handleSortChange("status")}
                className="flex-1"
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Status{" "}
                {sortBy === "status" && (sortOrder === "desc" ? "↓" : "↑")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            Showing {projects.length} of {pagination.totalCount} projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No projects found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                <div>Code</div>
                <div>Client</div>
                <div>Type</div>
                <div>Event</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>

              {/* Table Rows */}
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 px-4 py-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  {/* Code */}
                  <div className="font-mono text-sm font-medium">
                    <span className="md:hidden text-muted-foreground mr-2">
                      Code:
                    </span>
                    {project.code}
                  </div>

                  {/* Client */}
                  <div className="text-sm">
                    <span className="md:hidden text-muted-foreground mr-2">
                      Client:
                    </span>
                    {project.clientName}
                  </div>

                  {/* Type */}
                  <div className="text-sm text-muted-foreground">
                    <span className="md:hidden text-muted-foreground mr-2">
                      Type:
                    </span>
                    {project.projectTypeName}
                  </div>

                  {/* Event */}
                  <div className="text-sm">
                    <span className="md:hidden text-muted-foreground mr-2">
                      Event:
                    </span>
                    {project.eventName || "—"}
                    {project.eventDate && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({new Date(project.eventDate).toLocaleDateString()})
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span className="md:hidden text-muted-foreground mr-2">
                      Status:
                    </span>
                    <StatusBadge
                      status={project.actionState}
                      phase={project.phase}
                      showPhase={false} // List is crowded, maybe just actionState is fine, or small phase
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/projects/${project._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
