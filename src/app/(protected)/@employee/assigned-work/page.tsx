"use client";

import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import { Briefcase, Database, Filter, Search } from "lucide-react";
import { columns } from "@/components/modules/employee/dashboard/columns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AssignedWorkPage() {
  const projects = useQuery(api.employees.getEmployeeRecentProjects, {
    limit: 50,
  });

  return (
    <div className="flex-1 p-8 md:p-12 space-y-10 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <Briefcase className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
              Production Pipeline
            </h1>
            <p className="text-xs font-bold text-white/40 uppercase tracking-[0.3em] mt-2">
              Viewing all assigned creative assets
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
            <Input
              placeholder="SEARCH ASSETS..."
              className="pl-11 h-12 bg-white/2 border-white/5 rounded-xl text-[10px] font-black tracking-widest uppercase placeholder:text-white/10"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 w-12 rounded-xl border-white/5 bg-white/2 p-0"
          >
            <Filter className="h-4 w-4 text-white/40" />
          </Button>
        </div>
      </div>

      {projects === undefined ? (
        <Skeleton className="h-[600px] w-full rounded-[2.5rem] bg-white/2" />
      ) : (
        <div className="rounded-[2.5rem] border border-white/5 bg-white/2 overflow-hidden backdrop-blur-xl">
          <DataTable
            columns={columns}
            data={projects}
            className="border-none bg-transparent"
          />
        </div>
      )}
    </div>
  );
}
