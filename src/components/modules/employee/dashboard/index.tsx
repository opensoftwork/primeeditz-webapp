"use client";

import { Briefcase, Settings, UserCircle, Zap } from "lucide-react";
import { ActionButton } from "./action-button";
import { DashboardHeader } from "./dashboard-header";
import { RecentProjects } from "./recent-projects";
import { StatsGrid } from "./stats-grid";

export default function EmployeeDashboard() {
  return (
    <div className="w-full space-y-10 p-6 md:p-10">
      {/* Header Section */}
      <DashboardHeader />

      <div className="space-y-10">
        {/* Stats Section */}
        <StatsGrid />

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionButton
                href="/assigned-work"
                icon={<Briefcase className="h-4 w-4" />}
                label="My Assignments"
                sublabel="View active production work"
              />
              <ActionButton
                href="/settings"
                icon={<UserCircle className="h-4 w-4" />}
                label="My Profile"
                sublabel="Update your public info"
              />
              {/* <ActionButton
                href="/settings"
                icon={<Settings className="h-4 w-4" />}
                label="Preferences"
                sublabel="Configure portal settings"
              /> */}
            </div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] italic">
              New production tools and asset management modules are in
              development
            </p>
          </div>
        </div>

        {/* Content Section - Pipeline */}
        <RecentProjects />
      </div>
    </div>
  );
}
