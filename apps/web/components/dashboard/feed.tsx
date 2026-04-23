'use client';

import { Fragment } from 'react';
import { Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import PostCard from '@/components/posts/post-card';
import { PostCardSkeleton } from '@/components/posts/post-card-skeleton';
import { SuggestedUsers } from '@/components/users/suggested-users';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

const SUGGESTION_AFTER_POST = 2;

export default function Feed() {
  const {
    data,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.feed.getPostFeed.useInfiniteQuery(
    {},
    {
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialCursor: undefined,
    }
  );

  const sentinelRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    rootMargin: '400px 0px',
  });

  const posts = data?.pages.flatMap((page) => page.items);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="py-8 space-y-8">
        <p className="text-center text-muted-foreground">
          Your feed is empty. Follow people to see their posts here.
        </p>
        <SuggestedUsers title="People you might like" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <Fragment key={post.id}>
          <PostCard post={post} />
          {index === SUGGESTION_AFTER_POST - 1 &&
            posts.length > SUGGESTION_AFTER_POST && (
              <SuggestedUsers className="mt-6" />
            )}
        </Fragment>
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
