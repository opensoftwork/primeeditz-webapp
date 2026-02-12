"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Briefcase } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

import { DataTable, DataTableSkeleton } from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { getColumns } from "./columns";
import { AssignedWorkCard } from "./assigned-work-card";
import type { AssignedWorkItem } from "./types";

export function AssignedWorkList() {
  const router = useRouter();
  //@ts-ignore
  const projects = useQuery(api.employees.getEmployeeRecentProjects, {
    limit: 50,
  });

  const handleView = (id: string) => {
    router.push(`/assigned-work/${id}`);
  };

  const columns = useMemo(() => getColumns(handleView), [router]);

  // Loading State
  if (projects === undefined) {
    return (
      <div className="w-full px-6 pt-6 flex flex-col min-h-screen">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl bg-white/5" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-white/5" />
                <Skeleton className="h-10 w-64 bg-white/5" />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-12 w-64 rounded-xl bg-white/5" />
            <Skeleton className="h-12 w-12 rounded-xl bg-white/5" />
          </div>
        </div>
        <DataTableSkeleton rows={6} columns={4} viewMode="cards" />
      </div>
    );
  }

  return (
    <div className="w-full px-6 pt-6 min-h-screen flex flex-col">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10"
          >
            <Briefcase className="h-7 w-7 text-indigo-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1.5"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/50">
              PRODUCTION PIPELINE
            </span>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white xl:text-5xl">
              Assigned Work
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        className="flex-1"
        columns={columns}
        data={projects as AssignedWorkItem[]}
        emptyTitle="No assigned work found"
        emptyDescription="Your production pipeline is currently clear. Take a breather!"
        renderCard={(item) => (
          <AssignedWorkCard key={item._id} item={item} onView={handleView} />
        )}
        defaultView="cards"
        showViewToggle={true}
        toolbar={{
          search: {
            column: "eventName",
            placeholder: "Search projects...",
          },
          filters: [
            {
              column: "actionState",
              title: "Status",
              options: [
                { label: "Assigned", value: "assigned" },
                { label: "Work in Progress", value: "work_in_progress" },
                { label: "Deliverables Ready", value: "deliverables_ready" },
                { label: "Awaiting Review", value: "awaiting_review" },
                { label: "Versions Requested", value: "versions_requested" },
                { label: "Approved", value: "review_approved" },
              ],
            },
          ],
        }}
      />
    </div>
  );
}
