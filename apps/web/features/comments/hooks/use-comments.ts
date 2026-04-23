import { trpc } from '@/lib/trpc/client';

export function useComments(postId: number) {
  const utils = trpc.useUtils();

  const updatePostCommentCount = (delta: number) => {
    utils.posts.findById.setData({ postId }, (old) => {
      if (!old) return old;
      return { ...old, comments: Math.max(0, old.comments + delta) };
    });
  };

  const createComment = trpc.comments.create.useMutation({
    onSuccess: (_, variables) => {
      utils.comments.findByPostId.invalidate({
        postId: variables.postId,
      });
      updatePostCommentCount(1);
      utils.posts.findAll.invalidate();
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.findByPostId.invalidate({ postId });
      updatePostCommentCount(-1);
      utils.posts.findAll.invalidate();
    },
  });

  return {
    addComment: (text: string) => createComment.mutate({ postId, text }),
    removeComment: (commentId: number) =>
      deleteComment.mutate({ commentId }),
    isAddingComment: createComment.isPending,
  };
}