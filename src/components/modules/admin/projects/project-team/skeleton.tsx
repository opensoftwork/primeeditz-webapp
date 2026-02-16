"use client";

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading Skeleton for Project Team view
 */
export function ProjectTeamSkeleton() {
  return (
    <div className="flex-1 p-8 md:p-12 flex flex-col space-y-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-3 w-64 rounded-md" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      {/* Stats Skeleton */}
      <div className="flex items-center gap-6">
        <Skeleton className="h-4 w-32 rounded-md" />
      </div>

      {/* Toolbar / Search Skeleton */}
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-white/5">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/6" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/2 border border-white/5"
          >
            <div className="flex items-center gap-3 w-1/4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
