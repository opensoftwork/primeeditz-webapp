import { Skeleton } from "@/components/ui/skeleton";

export function AppSettingsSkeleton() {
  return (
    <div className="space-y-12 animate-pulse p-4">
      <div className="space-y-3 mb-8">
        <Skeleton className="h-8 w-64 bg-white/5 rounded-lg" />
        <Skeleton className="h-4 w-96 bg-white/5 rounded-lg" />
      </div>
      <div className="space-y-8">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <Skeleton className="h-4 w-48 bg-white/5 rounded-lg" />
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-32 bg-white/5 rounded" />
              <Skeleton className="h-10 w-full bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-48 bg-white/5 rounded" />
          <Skeleton className="h-32 w-full bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
