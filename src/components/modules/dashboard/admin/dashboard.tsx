"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { type ColumnDef, type CellContext } from "@tanstack/react-table";
import {
  Users,
  FolderKanban,
  AlertCircle,
  ArrowRight,
  Settings,
  UserCog,
  Database,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/ui/data-table";
import { format, formatDistanceToNow } from "date-fns";

export default function AdminDashboard() {
  const profile = useQuery(api.profiles.getMyProfile);
  const dashboardStats = useQuery(api.admin.getAdminDashboardStats);
  const pendingProjects = useQuery(api.admin.getPendingProjects);

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
                <Database className="h-2.5 w-2.5" />
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
      accessorKey: "clientName",
      header: "Client",
      cell: ({ row }: CellContext<any, any>) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-white/80">
            {row.getValue("clientName")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }: CellContext<any, any>) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
          {formatDistanceToNow(new Date(row.getValue("createdAt")), {
            addSuffix: true,
          })}
        </span>
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

  if (!profile || !dashboardStats || !pendingProjects) {
    return (
      <div className="w-full space-y-8 p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-32 rounded-3xl bg-white/5" />
          <Skeleton className="h-32 rounded-3xl bg-white/5" />
          <Skeleton className="h-32 rounded-3xl bg-white/5" />
        </div>
        <Skeleton className="h-96 rounded-[2.5rem] bg-white/5" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 p-6 md:p-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-cyan-400 shadow-[0_0_10px_#22d3ee] rounded-full" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-cyan-400">
              Administrative Command
            </span>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              G'day, {profile.name.split(" ")[0]}
              <Badge
                variant="outline"
                className="border-cyan-400/40 text-cyan-400 uppercase text-[8px] tracking-[0.2em] font-black py-0.5 px-2"
              >
                ADMIN ACCESS
              </Badge>
            </h1>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Live Operations Tracker • {format(new Date(), "MMMM dd, yyyy")}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Pending"
          value={dashboardStats.pendingRequestsCount}
          description="Awaiting Review"
          index={0}
          color="text-amber-400"
          glowColor="shadow-amber-400/20"
        />
        <StatCard
          icon={<FolderKanban className="h-4 w-4" />}
          label="Active"
          value={dashboardStats.activeProjectsCount}
          description="Total Production"
          index={1}
          color="text-cyan-400"
          glowColor="shadow-cyan-400/20"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Team"
          value={dashboardStats.totalEmployeesCount}
          description="Active Personnel"
          index={2}
          color="text-emerald-400"
          glowColor="shadow-emerald-400/20"
        />
      </div>

      {/* Quick Operations Component */}
      <div className="p-6 rounded-[1.5rem] bg-white/2 border border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[40px_40px]" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60">
              Quick Operations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton
              href="/projects?status=pending_review"
              icon={<AlertCircle className="h-4 w-4" />}
              label="Review Pending"
              sublabel="Process incoming requests"
            />
            <ActionButton
              href="/settings/project-types"
              icon={<Settings className="h-4 w-4" />}
              label="Project Types"
              sublabel="Configure system forms"
              disabled
            />
            <ActionButton
              href="/settings/employees"
              icon={<UserCog className="h-4 w-4" />}
              label="Team Access"
              sublabel="Manage role permissions"
              disabled
            />
          </div>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
            Upcoming Administrative modules are currently in development
          </p>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Database className="h-4 w-4" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 font-mono">
              Pending Requisitions
            </h3>
          </div>
          <Button
            variant="link"
            className="text-[9px] font-black uppercase tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors"
            asChild
          >
            <Link href="/projects?status=pending_review">View Full List</Link>
          </Button>
        </div>

        {pendingProjects.length === 0 ? (
          <div className="py-20 text-center space-y-6 rounded-[2.5rem] border border-white/5 bg-white/2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-grid-white/[0.01] bg-size-[30px_30px]" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="p-4 rounded-full bg-white/5 border border-white/10 mb-4 group-hover:scale-110 transition-transform duration-500">
                <CheckCircle2 className="h-10 w-10 text-emerald-500/40" />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-white/50">
                Operations Fluid
              </h3>
              <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest mt-2">
                All incoming requests have been processed.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <DataTable
              columns={columns}
              data={pendingProjects.slice(0, 5)}
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
  color,
  glowColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
  index: number;
  color: string;
  glowColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className={cn(
        "p-6 rounded-[1.5rem] bg-white/3 border border-white/5 relative group hover:bg-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden shadow-2xl",
        "before:absolute before:inset-0 before:bg-linear-to-b before:from-white/2 before:to-transparent"
      )}
    >
      <div
        className={cn(
          "absolute -top-4 -right-4 p-6 opacity-[0.03] group-hover:opacity-[0.07] group-hover:rotate-12 transition-all duration-700",
          color
        )}
      >
        <div className="scale-[3]">{icon}</div>
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between space-y-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "p-1.5 rounded-lg bg-white/5 border border-white/10 shadow-lg transition-transform duration-500 group-hover:scale-110",
              color,
              glowColor
            )}
          >
            {icon}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            {label}
          </span>
        </div>

        <div className="space-y-0.5">
          <h4 className="text-3xl font-black text-white tracking-tighter">
            {value.toString().padStart(2, "0")}
          </h4>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ActionButton({
  href,
  icon,
  label,
  sublabel,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-auto flex-col items-start gap-4 p-6 rounded-2xl border border-white/5 bg-white/2 transition-all duration-300 w-full group/act overflow-hidden relative",
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-white/5 hover:border-white/10 hover:-translate-y-1 shadow-lg"
      )}
      asChild={!disabled}
      disabled={disabled}
    >
      {disabled ? (
        <div className="w-full text-left">
          <InnerContent icon={icon} label={label} sublabel={sublabel} />
        </div>
      ) : (
        <Link href={href} className="w-full">
          <InnerContent icon={icon} label={label} sublabel={sublabel} />
          <ArrowRight className="absolute bottom-6 right-6 h-4 w-4 text-white/20 group-hover/act:text-primary group-hover/act:translate-x-1 transition-all" />
        </Link>
      )}
    </Button>
  );
}

function InnerContent({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <>
      <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white group-hover/act:text-primary transition-colors">
        {icon}
      </div>
      <div className="space-y-1 text-left">
        <div className="text-[13px] font-black uppercase tracking-tight text-white">
          {label}
        </div>
        <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">
          {sublabel}
        </div>
      </div>
    </>
  );
}
