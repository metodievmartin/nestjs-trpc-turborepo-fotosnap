import { Skeleton } from '../ui/skeleton';

export function ProfilePageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="mb-8">
        <div className="flex flex-row gap-6 md:gap-8 items-center">
          <Skeleton className="size-16 md:w-32 md:h-32 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
            <div className="flex gap-6 md:gap-8">
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-18" />
              <Skeleton className="h-4 w-18" />
            </div>
            <Skeleton className="hidden md:block h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-3 gap-0.5 md:gap-1">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-none" />
        ))}
      </div>
    </div>
  );
}