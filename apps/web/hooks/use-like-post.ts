import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

import { Post, PaginatedPosts } from '@repo/contracts/posts';
import { trpc } from '@/lib/trpc/client';

type InfinitePaginatedPosts = {
  pages: PaginatedPosts[];
  pageParams: unknown[];
};

function isPaginatedPosts(value: unknown): value is PaginatedPosts {
  return (
    typeof value === 'object' &&
    value !== null &&
    'items' in value &&
    Array.isArray((value as { items: unknown }).items)
  );
}

function isInfinitePosts(value: unknown): value is InfinitePaginatedPosts {
  return (
    typeof value === 'object' &&
    value !== null &&
    'pages' in value &&
    Array.isArray((value as { pages: unknown }).pages)
  );
}

export function useLikePost(postId: number) {
  const utils = trpc.useUtils();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  // tRPC's setData() requires an exact input match, so it can only update
  // one findAll cache entry at a time (e.g. findAll({}) or findAll({ userId })).
  // We use the raw queryClient.setQueriesData() to optimistically update ALL
  // findAll variants (feed, profile grid, etc.) in a single pass via prefix matching.
  const findAllQueryKey = getQueryKey(trpc.posts.findAll);
  const feedQueryKey = getQueryKey(trpc.feed.getPostFeed);

  const toggleLike = (post: Post) => ({
    ...post,
    isLiked: !post.isLiked,
    likes: post.isLiked ? post.likes - 1 : post.likes + 1,
  });

  const likePost = trpc.posts.likePost.useMutation({
    onMutate: async () => {
      setPending(true);

      await Promise.all([
        utils.posts.findById.cancel({ postId }),
        utils.posts.findAll.cancel(),
        utils.feed.getPostFeed.cancel(),
      ]);

      const previousPost = utils.posts.findById.getData({ postId });
      const previousAllQueries = queryClient.getQueriesData({
        queryKey: findAllQueryKey,
      });
      const previousFeedQueries = queryClient.getQueriesData({
        queryKey: feedQueryKey,
      });

      // Optimistic update on findById (modal)
      utils.posts.findById.setData({ postId }, (old) => {
        if (!old) return old;
        return toggleLike(old);
      });

      // Optimistic update on ALL findAll/feed variants. Handles both the
      // plain useQuery cache shape { items, nextCursor, hasMore } and the
      // useInfiniteQuery cache shape { pages: [{ items, ... }], pageParams }.
      const mapItems = (items: Post[]) =>
        items.map((p) => (p.id === postId ? toggleLike(p) : p));

      const updatePaginated = (old: unknown) => {
        if (!old || typeof old !== 'object') return old;
        if (isInfinitePosts(old)) {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: mapItems(page.items),
            })),
          };
        }
        if (isPaginatedPosts(old)) {
          return { ...old, items: mapItems(old.items) };
        }
        return old;
      };

      queryClient.setQueriesData(
        { queryKey: findAllQueryKey },
        updatePaginated,
      );

      queryClient.setQueriesData(
        { queryKey: feedQueryKey },
        updatePaginated,
      );

      return { previousPost, previousAllQueries, previousFeedQueries };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousPost) {
        utils.posts.findById.setData({ postId }, context.previousPost);
      }
      // Restore each findAll variant from its snapshot
      context?.previousAllQueries?.forEach(([queryKey, data]) => {
        if (data) queryClient.setQueryData(queryKey, data);
      });
      context?.previousFeedQueries?.forEach(([queryKey, data]) => {
        if (data) queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      setPending(false);
      utils.posts.findById.invalidate({ postId });
      utils.posts.findAll.invalidate();
      utils.feed.getPostFeed.invalidate();
    },
  });

  const handleLike = () => {
    if (pending) return;
    likePost.mutate({ postId });
  };

  return {
    likePost: handleLike,
    isLiking: pending,
  };
}
