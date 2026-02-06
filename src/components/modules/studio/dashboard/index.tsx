"use client";

/**
 * Studio Dashboard Component
 *
 * Premium dashboard interface for studios to track projects and request new ones.
 * Refined and condensed design for maximum efficiency while maintaining a luxury feel.
 * Properly modularized for maintainability.
 */

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2, Clock, LayoutGrid } from "lucide-react";
import { QuotationsSection } from "@/components/modules/studio/quotations/quotations-section";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectOnboardingCard } from "../projects/project-onboarding-card";
import { DashboardHeader } from "./dashboard-header";
import { GroupedProjectList } from "./grouped-project-list";
import { StatCard } from "./stat-card";

export default function StudioDashboard() {
  const profile = useQuery(api.profiles.getMyProfile);
  const projects = useQuery(
    api.functions.projects.queries.getMyProjectsWithType,
  );

  // Calculate stats
  const totalProjects = projects?.length ?? 0;
  const inProgressCount =
    projects?.filter(
      (p) =>
        p.phase !== "completed" &&
        p.phase !== "archived" &&
        p.actionState !== "cancelled",
    ).length ?? 0;
  const completedCount =
    projects?.filter((p) => p.phase === "completed").length ?? 0;

  const projectsAwaitingOnboarding =
    projects?.filter(
      (p) =>
        p.actionState === "awaiting_onboarding" ||
        p.actionState === "awaiting_uploads",
    ) ?? [];

  if (!profile) {
    return (
      <div className="w-full space-y-8 p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl bg-white/5" />
          <Skeleton className="h-28 rounded-2xl bg-white/5" />
          <Skeleton className="h-28 rounded-2xl bg-white/5" />
        </div>
        <Skeleton className="h-96 rounded-4xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 p-5 md:p-8">
      {/* Header Section */}
      <DashboardHeader userName={profile.name} />

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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

      {/* Onboarding Callout (Story 11C.4) */}
      {projectsAwaitingOnboarding.length > 0 && (
        <ProjectOnboardingCard project={projectsAwaitingOnboarding[0] as any} />
      )}

      {/* Quotations Section */}
      <QuotationsSection />

      {/* Main Project List Section (Grouped by End Client) */}
      <GroupedProjectList />
    </div>
  );
}
