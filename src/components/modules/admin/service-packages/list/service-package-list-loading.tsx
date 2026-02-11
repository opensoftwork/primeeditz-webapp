"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ServicePackageListLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Filters Skeleton */}
      <div className="flex flex-col md:flex-row gap-4 h-[74px] bg-white/2 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <Skeleton className="flex-1 h-10 rounded-xl bg-white/5" />
        <Skeleton className="w-[140px] h-10 rounded-xl bg-white/5" />
        <Skeleton className="w-[160px] h-10 rounded-xl bg-white/5" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="bg-white/2 border-white/5 p-6 rounded-3xl">
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl bg-white/5" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20 bg-white/5" />
                    <Skeleton className="h-3 w-12 bg-white/5" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg bg-white/5" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-6 w-3/4 bg-white/5" />
                <Skeleton className="h-3 w-1/4 bg-white/5" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-5/6 bg-white/5" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-white/5 space-y-2">
                  <Skeleton className="h-2 w-12 bg-white/5" />
                  <Skeleton className="h-4 w-20 bg-white/5" />
                </div>
                <div className="p-3 rounded-xl border border-white/5 space-y-2">
                  <Skeleton className="h-2 w-10 bg-white/5 ml-auto" />
                  <Skeleton className="h-4 w-16 bg-white/5 ml-auto" />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-white/5">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-lg bg-white/5" />
                  <Skeleton className="h-3 w-32 bg-white/5" />
                </div>
                <Skeleton className="h-8 w-24 rounded-lg bg-white/5" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
