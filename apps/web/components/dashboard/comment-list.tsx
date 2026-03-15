'use client';

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
  return (
    <>
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2">
            <UserAvatar
              src={comment.user.avatar}
              alt={comment.user.username}
              className="mt-2 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm">
                    {comment.user.username}
                  </span>
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

      {comments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      )}
    </>
  );
}
