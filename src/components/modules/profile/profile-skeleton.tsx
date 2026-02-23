import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSettingsSkeleton() {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <header className="px-8 pt-8 pb-0">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20 bg-white/5" />
          <Skeleton className="h-10 w-64 bg-white/5" />
        </div>
      </header>

      <div className="flex flex-1 gap-0 mt-8">
        {/* Left sidebar skeleton */}
        <div className="w-[280px] shrink-0 border-r border-white/5 px-8 pb-8">
          <div className="flex flex-col items-center">
            <Skeleton className="size-28 rounded-full bg-white/5 mb-6" />
            <Skeleton className="h-6 w-32 bg-white/5 mb-2" />
            <Skeleton className="h-4 w-40 bg-white/5 mb-4" />
            <Skeleton className="h-7 w-20 rounded-full bg-white/5 mb-6" />
            <Skeleton className="h-11 w-full rounded-xl bg-white/5" />
          </div>
        </div>

        {/* Right content skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="px-8 border-b border-white/5 py-4">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-28 bg-white/5 rounded" />
              ))}
            </div>
          </div>
          <div className="p-8 space-y-6">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                className="h-20 w-full max-w-2xl rounded-2xl bg-white/5"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
