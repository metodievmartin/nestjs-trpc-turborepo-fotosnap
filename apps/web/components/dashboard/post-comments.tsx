'use client';

import { Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { useComments } from '@/hooks/use-comments';
import { authClient } from '@/lib/auth/client';

import Comments from './comments';

interface PostCommentsProps {
  postId: number;
}

export default function PostComments({ postId }: PostCommentsProps) {
  const { data: comments, isPending } = trpc.comments.findByPostId.useQuery({
    postId,
  });
  const { addComment, removeComment } = useComments(postId);
  const session = authClient.useSession();
  const currentUserId = session.data?.user?.id;

  if (isPending) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Comments
      comments={comments?.items ?? []}
      currentUserId={currentUserId}
      onAddComment={addComment}
      onDeleteComment={removeComment}
    />
  );
}