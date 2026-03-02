import { useState } from 'react';

import { trpc } from '@/lib/trpc/client';

export function useLikePost() {
  const utils = trpc.useUtils();
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const likePost = trpc.posts.likePost.useMutation({
    // Optimistic update: toggle like instantly, rollback on failure
    onMutate: async ({ postId }) => {
      // Cancel in-flight fetches so they don't overwrite our optimistic state
      await utils.posts.findAll.cancel();
      const previous = utils.posts.findAll.getData();

      utils.posts.findAll.setData(undefined, (existingData) => {
        if (!existingData) return existingData;

        return existingData.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            };
          }

          return post;
        });
      });

      return { previous }; // passed as `context` to onError
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        utils.posts.findAll.setData(undefined, context.previous);
      }
    },
  });

  const handleLike = (postId: number) => {
    if (pendingIds.has(postId)) return;

    setPendingIds((prev) => new Set(prev).add(postId));
    likePost.mutate(
      { postId },
      {
        onSettled: () => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(postId);
            return next;
          });
        },
      }
    );
  };

  return {
    likePost: handleLike,
    isLikingPost: (postId: number) => pendingIds.has(postId),
  };
}
