'use client';

import Link from 'next/link';

import { trpc } from '@/lib/trpc/client';

interface PostCommentsPreviewProps {
  postId: number;
  limit?: number;
}

export function PostCommentsPreview({
  postId,
  limit = 2,
}: PostCommentsPreviewProps) {
  const { data } = trpc.comments.findByPostId.useQuery({ postId, limit });
  const comments = data?.items ?? [];

  if (comments.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {comments.map((comment) => (
        <div key={comment.id} className="text-sm">
          <Link
            href={`/users/${comment.user.username}`}
            className="font-semibold hover:opacity-80"
          >
            {comment.user.username}
          </Link>{' '}
          <span className="wrap-break-word">{comment.text}</span>
        </div>
      ))}
    </div>
  );
}
