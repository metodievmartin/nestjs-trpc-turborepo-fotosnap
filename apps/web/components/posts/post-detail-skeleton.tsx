import { Skeleton } from '../ui/skeleton';

export function PostDetailSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 px-2 py-1.5 border-b">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="p-3 space-y-2.5">
          <div className="flex gap-3">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="size-6 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-48" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Desktop skeleton */}
      <div className="hidden md:grid md:grid-cols-[1.6fr_1fr] h-full flex-1 overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <Skeleton className="size-8 rounded-full" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex-1 px-4 py-3 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-4 space-y-2.5">
            <div className="flex gap-3">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-3.5 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </>
  );
}