"use client";

import { api } from "@convex/_generated/api";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "convex/react";
import { Calendar, Eye, Hash, User } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { useSimplePaginatedQuery } from "@/hooks/use-simple-paginated-query";
import { columns } from "./columns";
import { StatusBadge } from "./status-badge";
import type { AdminProject } from "./types";

// ============================================================================
// Project Card Component (for card view)
// ============================================================================

function ProjectCard({ project }: { project: AdminProject }) {
  return (
    <Link href={`/projects/${project._id}`}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="group p-6 rounded-[1.5rem] bg-white/3 border border-white/5 hover:bg-white/5 hover:border-primary/20 transition-all duration-300 cursor-pointer relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full translate-x-16 -translate-y-16 group-hover:bg-primary/10 transition-colors" />

        <div className="relative space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Hash className="h-3.5 w-3.5 text-primary/40" />
                <span className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors">
                  {project.code}
                </span>
              </div>
              <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest">
                {project.projectTypeName}
              </span>
            </div>
            <StatusBadge status={project.status} />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/20 transition-colors">
              <User className="h-3.5 w-3.5 text-white/40 group-hover:text-primary transition-colors" />
            </div>
            <span className="font-black text-white/80 uppercase tracking-tight text-sm">
              {project.clientName}
            </span>
          </div>

          {project.eventName && (
            <div className="pt-3 border-t border-white/5">
              <div className="font-bold text-white/50 truncate">
                {project.eventName}
              </div>
              {project.eventDate && (
                <div className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1.5 mt-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.eventDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
            >
              View <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ProjectList() {
  const [pageSize, setPageSize] = useState(15);
  const [statusFilter, setStatusFilter] = useState<
    "draft" | "pending_review" | "active" | "in_progress" | "completed" | "archived" | undefined
  >(undefined);
  const [typeFilter, setTypeFilter] = useState<any>(undefined);

  const projectTypes = useQuery(api.admin.getProjectTypes);

  const query = useSimplePaginatedQuery(
    api.admin.getAdminProjectsPaginated,
    {
      status: statusFilter,
      projectTypeId: typeFilter,
    },
    { initialNumItems: pageSize }
  );

  const projects: AdminProject[] = useMemo(() => {
    if (query.status === "loaded") {
      const results = query as {
        status: "loaded";
        currentResults: { page: AdminProject[] };
      };
      return results.currentResults.page;
    }
    return [];
  }, [query]);

  const statusOptions = [
    { label: "Pending Review", value: "pending_review" },
    { label: "Active", value: "active" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Archived", value: "archived" },
    { label: "Draft", value: "draft" },
  ];

  const typeOptions = useMemo(() => {
    if (!projectTypes) return [];
    return projectTypes.map((t) => ({
      label: t.name,
      value: t.name,
    }));
  }, [projectTypes]);

  if (query.status === "loading" && !projects.length) {
    return (
      <div className="flex-1 p-8 md:p-12 w-full">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              ADMINISTRATIVE CONTROL
            </span>
            <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
              Project Vault
            </h1>
          </motion.div>
        </div>
        <DataTableSkeleton rows={6} columns={6} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 md:p-12 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
            ADMINISTRATIVE CONTROL
          </span>
          <h1 className="text-4xl xl:text-5xl font-black uppercase tracking-tighter text-white">
            Project Vault
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link href="/projects/new">
            <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20">
              INITIATE PROJECT
            </Button>
          </Link>
        </motion.div>
      </div>

      <DataTable
        columns={columns}
        data={projects}
        isLoading={query.isLoading}
        emptyTitle="No Projects Found"
        emptyDescription="No projects match your current filters. Try adjusting your search criteria."
        renderCard={(project) => <ProjectCard project={project} />}
        defaultView="table"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "clientName",
            placeholder: "Search by client or code...",
          },
          filters: [
            {
              column: "status",
              title: "Status",
              options: statusOptions,
            },
            ...(typeOptions.length > 0
              ? [
                {
                  column: "projectTypeName",
                  title: "Type",
                  options: typeOptions,
                },
              ]
              : []),
          ],
        }}
        serverPagination={{
          loadNext: query.loadNext,
          loadPrev: query.loadPrev,
          currentPage: query.currentPageNum,
          isLoading: query.isLoading,
          hasNextPage:
            query.status === "loaded" ? query.nextCursor !== null : false,
          setPageSize: (size) => {
            setPageSize(size);
            query.setPageSize(size);
          },
          pageSize,
        }}
      />
    </div>
  );
}
