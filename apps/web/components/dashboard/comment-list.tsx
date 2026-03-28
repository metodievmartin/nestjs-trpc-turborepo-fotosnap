'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { Comment } from '@repo/contracts/comments';

import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';

interface CommentListProps {
  comments: Comment[];
  currentUserId?: string;
  onDeleteComment: (commentId: number) => void;
}

export default function CommentList({
  comments = [],
  currentUserId,
  onDeleteComment,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No comments yet. Start the conversation.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-2">
          <Link
            href={`/users/${comment.user.username}`}
            className="mt-2 shrink-0 hover:opacity-80"
          >
            <UserAvatar src={comment.user.avatar} alt={comment.user.username} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/users/${comment.user.username}`}
                  className="font-semibold text-sm hover:opacity-80"
                >
                  {comment.user.username}
                </Link>
                <p className="text-sm wrap-break-word">{comment.text}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
              {currentUserId === comment.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto shrink-0"
                  onClick={() => onDeleteComment(comment.id)}
                >
                  <Trash2 className="w-3 h-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
