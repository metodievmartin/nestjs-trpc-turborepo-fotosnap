import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQueryKey } from '@trpc/react-query';

import { Post, PaginatedPosts } from '@repo/contracts/posts';
import { trpc } from '@/lib/trpc/client';

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
      const previousAllQueries = queryClient.getQueriesData<PaginatedPosts>({
        queryKey: findAllQueryKey,
      });
      const previousFeedQueries = queryClient.getQueriesData<PaginatedPosts>({
        queryKey: feedQueryKey,
      });

      // Optimistic update on findById (modal)
      utils.posts.findById.setData({ postId }, (old) => {
        if (!old) return old;
        return toggleLike(old);
      });

      // Optimistic update on ALL findAll variants (feed, profile grid, etc.)
      // findAll returns paginated data: { items: Post[], nextCursor, hasMore }
      const updatePaginated = (old: PaginatedPosts | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) => (p.id === postId ? toggleLike(p) : p)),
        };
      };

      queryClient.setQueriesData<PaginatedPosts>(
        { queryKey: findAllQueryKey },
        updatePaginated,
      );

      queryClient.setQueriesData<PaginatedPosts>(
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
