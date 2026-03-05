import { useState } from 'react';

import { trpc } from '@/lib/trpc/client';

export function useLikePost(postId: number) {
  const utils = trpc.useUtils();
  const [pending, setPending] = useState(false);

  const likePost = trpc.posts.likePost.useMutation({
    // Optimistic update: toggle like instantly, rollback on failure
    onMutate: async () => {
      setPending(true);
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

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        utils.posts.findAll.setData(undefined, context.previous);
      }
    },
    onSettled: () => {
      setPending(false);
      utils.posts.findAll.invalidate();
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
