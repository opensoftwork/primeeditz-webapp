"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FolderKanban,
  Settings,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { ActionButton } from "./action-button";
import { columns } from "./columns";
import { DashboardHeader } from "./dashboard-header";
import { PendingQuotationsSection } from "./pending-quotations-section";
import { StatCard } from "./stat-card";

export default function AdminDashboard() {
  const profile = useQuery(api.profiles.getMyProfile);
  const dashboardStats = useQuery(api.admin.getAdminDashboardStats);
  const pendingProjects = useQuery(api.admin.getPendingProjects);

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
      <DashboardHeader userName={profile.name} />

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

      {/* Pending Quotations Section - Story 15.2 */}
      <PendingQuotationsSection />

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
            <Link href="/projects?actionState=awaiting_quotation">
              View Full List
            </Link>
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
