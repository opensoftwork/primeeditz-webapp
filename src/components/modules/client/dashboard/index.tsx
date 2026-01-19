"use client";

/**
 * Client Dashboard Component
 *
 * Premium dashboard interface for clients to track projects and request new ones.
 * Refined and condensed design for maximum efficiency while maintaining a luxury feel.
 * Properly modularized for maintainability.
 */

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid, Clock, CheckCircle2 } from "lucide-react";
import { QuotationsSection } from "@/components/modules/client/quotations/quotations-section";
import { StatCard } from "./stat-card";
import { DashboardHeader } from "./dashboard-header";
import { PipelineTable } from "./pipeline-table";

export default function ClientDashboard() {
  const profile = useQuery(api.profiles.getMyProfile);
  const projects = useQuery(
    api.functions.projects.queries.getMyProjectsWithType,
  );

  // Calculate stats
  const totalProjects = projects?.length ?? 0;
  const inProgressCount =
    projects?.filter(
      (p) =>
        p.status === "in_progress" ||
        p.status === "active" ||
        p.status === "pending_review",
    ).length ?? 0;
  const completedCount =
    projects?.filter((p) => p.status === "completed").length ?? 0;

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
      {/* Header Section */}
      <DashboardHeader userName={profile.name} />

      {/* Stats Cards Grid */}
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

      {/* Quotations Section */}
      <QuotationsSection />

      {/* Main Project List Section */}
      <PipelineTable projects={projects as any} />
    </div>
  );
}
