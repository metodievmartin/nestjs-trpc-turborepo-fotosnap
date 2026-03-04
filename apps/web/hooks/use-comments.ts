import { trpc } from '@/lib/trpc/client';

export function useComments(postId: number) {
  const utils = trpc.useUtils();

  const createComment = trpc.comments.create.useMutation({
    onSuccess: (_, variables) => {
      utils.comments.findByPostId.invalidate({
        postId: variables.postId,
      });

      utils.posts.findAll.setData(undefined, (old) => {
        if (!old) return old;

        return old.map((post) => {
          if (post.id === variables.postId) {
            return { ...post, comments: post.comments + 1 };
          }
          return post;
        });
      });
    },
  });

  const deleteComment = trpc.comments.delete.useMutation({
    onSuccess: () => {
      utils.comments.findByPostId.invalidate({ postId });

      utils.posts.findAll.setData(undefined, (old) => {
        if (!old) return old;

        return old.map((post) => {
          if (post.id === postId) {
            return { ...post, comments: Math.max(0, post.comments - 1) };
          }
          return post;
        });
      });
    },
  });

  return {
    addComment: (text: string) => createComment.mutate({ postId, text }),
    removeComment: (commentId: number) =>
      deleteComment.mutate({ commentId }),
    isAddingComment: createComment.isPending,
  };
}