"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";

export function Step1Loader() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 space-y-8"
    >
      {/* Title & Description Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-white/5 rounded-lg" />
        <Skeleton className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-4 space-y-4">
          {/* Filters Skeleton */}
          <div className="p-4 rounded-2xl border border-white/5 bg-white/2 space-y-3">
            <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
            <Skeleton className="h-10 w-full bg-white/5 rounded-xl" />
          </div>

          {/* List Skeleton */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/2 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-white/5 rounded-md" />
                <Skeleton className="h-3 w-1/2 bg-white/10 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="lg:col-span-8">
          <div className="rounded-3xl border border-white/5 bg-white/2 overflow-hidden h-[600px] flex flex-col">
            <div className="p-8 border-b border-white/5 space-y-4">
              <Skeleton className="h-10 w-1/2 bg-white/10 rounded-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 bg-white/5 rounded-full" />
                <Skeleton className="h-5 w-24 bg-white/5 rounded-full" />
              </div>
              <Skeleton className="h-20 w-full bg-white/5 rounded-xl" />
            </div>
            <div className="p-8 space-y-8">
              <div className="space-y-4">
                <Skeleton className="h-4 w-32 bg-white/5 rounded-md" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full bg-white/5 rounded-2xl" />
                  <Skeleton className="h-16 w-full bg-white/5 rounded-2xl" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-4 w-40 bg-white/5 rounded-md" />
                <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
