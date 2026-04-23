import { type RefObject, useEffect, useRef } from 'react';

type UseInfiniteScrollOptions = {
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
  root?: RefObject<HTMLElement | null>;
  rootMargin?: string;
  threshold?: number | number[];
};

export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  root,
  rootMargin,
  threshold,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchNextPageRef = useRef(fetchNextPage);
  useEffect(() => {
    fetchNextPageRef.current = fetchNextPage;
  }, [fetchNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (isFetchingNextPage) return;
        fetchNextPageRef.current();
      },
      {
        root: root?.current ?? null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, root, rootMargin, threshold]);

  return sentinelRef;
}
