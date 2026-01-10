"use client";

/**
 * Client Dashboard Component
 *
 * Premium dashboard interface for clients to track projects and request new ones.
 * Refined and condensed design for maximum efficiency while maintaining a luxury feel.
 * Uses TanStack Data Table for production queue management.
 */

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import {
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  LayoutGrid,
  Database,
  Tag,
  Zap,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { format } from "date-fns";

export default function ClientDashboard() {
  const profile = useQuery(api.profiles.getMyProfile);
  const projects = useQuery(
    api.functions.projects.queries.getMyProjectsWithType
  );

  // Calculate stats
  const totalProjects = projects?.length ?? 0;
  const inProgressCount =
    projects?.filter(
      (p) =>
        p.status === "in_progress" ||
        p.status === "active" ||
        p.status === "pending_review"
    ).length ?? 0;
  const completedCount =
    projects?.filter((p) => p.status === "completed").length ?? 0;

  // Table Column Definitions
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "eventName",
      header: "Project Details",
      cell: ({ row }: CellContext<any, any>) => {
        const project = row.original;
        return (
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-500 shrink-0">
              <Sparkles className="h-4 w-4 text-white/30 group-hover:text-primary transition-colors" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-black uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                {project.eventName || "Untitled Project"}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Tag className="h-2.5 w-2.5" />
                {project.projectTypeName}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "code",
      header: "Project ID",
      cell: ({ row }: CellContext<any, any>) => (
        <span className="font-mono text-[10px] font-bold text-white/60 bg-white/5 py-1 px-2 rounded-md border border-white/5">
          {row.getValue("code")}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Current Status",
      cell: ({ row }: CellContext<any, any>) => (
        <StatusBadge status={row.getValue("status")} />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: CellContext<any, any>) => (
        <div className="flex justify-end pr-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg border border-white/5 bg-white/2 hover:bg-primary hover:text-black transition-all group/btn"
            asChild
          >
            <Link href={`/projects/${row.original._id}`}>
              <span className="text-[10px] font-black uppercase tracking-widest mr-2">
                Details
              </span>
              <ArrowRight className="h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  if (!profile) {
    return (
      <div className="w-full space-y-8 p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl bg-white/5" />
          <Skeleton className="h-28 rounded-2xl bg-white/5" />
          <Skeleton className="h-28 rounded-2xl bg-white/5" />
        </div>
        <Skeleton className="h-96 rounded-[2.5rem] bg-white/5" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-12 p-6 md:p-12">
      {/* Header Section - Condensed */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.6)]" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
              Management Portal
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              G'day, {profile.name.split(" ")[0]}
              <Badge
                variant="outline"
                className="border-primary/40 text-primary uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2"
              >
                PRO ACCOUNT
              </Badge>
            </h1>
            <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
              Live Production Tracker • {format(new Date(), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>

        <Button
          asChild
          className="group h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest text-[10px] transition-all duration-300 shadow-[0_10px_30px_rgba(var(--primary),0.2)] hover:-translate-y-0.5"
        >
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
            New Request
          </Link>
        </Button>
      </div>

      {/* Stats Cards Grid - Condensed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          icon={<LayoutGrid className="h-3.5 w-3.5" />}
          label="History"
          value={totalProjects}
          description="Total engagements"
          index={0}
        />
        <StatCard
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Active"
          value={inProgressCount}
          description="In Production"
          index={1}
          color="text-amber-400"
        />
        <StatCard
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
          label="Finished"
          value={completedCount}
          description="Delivered Assets"
          index={2}
          color="text-emerald-400"
        />
      </div>

      {/* Main Project List Section - Using Data Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/30 text-primary">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
              Production Pipeline
            </h3>
          </div>
          {projects && projects.length > 5 && (
            <Button
              variant="link"
              className="text-[9px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors"
              asChild
            >
              <Link href="/projects">View Archive</Link>
            </Button>
          )}
        </div>

        {projects === undefined ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
            <Skeleton className="h-16 w-full rounded-xl bg-white/5" />
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center space-y-6 rounded-[2rem] border border-white/5 bg-white/2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[30px_30px]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-10 w-10 text-white/20" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white/50">
                Queue is clear
              </h3>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-2">
                No active projects found.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <DataTable
              columns={columns}
              data={projects.slice(0, 5)}
              className="border-white/5"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Internal Components
// ============================================================================

function StatCard({
  icon,
  label,
  value,
  description,
  index,
  color = "text-primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  index: number;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="p-6 rounded-[1.5rem] bg-white/4 border border-white/10 relative group hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300 overflow-hidden shadow-xl"
    >
      <div className="absolute -top-2 -right-2 p-6 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-500">
        <div className={cn("scale-[3]", color)}>{icon}</div>
      </div>
      <div className="flex flex-col h-full justify-between space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-white/5", color)}>{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
            {label}
          </span>
        </div>
        <div>
          <h4 className="text-3xl font-black text-white tracking-tighter mb-0.5">
            {value.toString().padStart(2, "0")}
          </h4>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending_review: {
      label: "Pending",
      className: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    },
    active: {
      label: "Active",
      className: "border-blue-500/40 text-blue-500 bg-blue-500/10",
    },
    in_progress: {
      label: "Process",
      className: "border-purple-500/40 text-purple-500 bg-purple-500/10",
    },
    completed: {
      label: "Done",
      className: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
    },
  };

  const config = statusConfig[status] ?? {
    label: status.replace("_", " "),
    className: "border-white/20 text-white/70 bg-white/10",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2 h-6 rounded-md border-2 whitespace-nowrap",
        config.className
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1 h-1 rounded-full",
            config.label === "Pending"
              ? "animate-pulse bg-amber-500"
              : "bg-current"
          )}
        />
        {config.label}
      </div>
    </Badge>
  );
}
