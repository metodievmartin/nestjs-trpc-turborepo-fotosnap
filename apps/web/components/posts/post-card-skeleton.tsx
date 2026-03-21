import { Skeleton } from '../ui/skeleton';

export function PostCardSkeleton() {
  return (
    <article className="border">
      <div className="flex items-center gap-3 p-4">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="h-3.5 w-24" />
      </div>
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2.5">
        <div className="flex gap-3">
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="size-6 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-3 w-20" />
      </div>
    </article>
  );
}