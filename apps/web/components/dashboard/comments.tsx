'use client';

import { Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SyntheticEvent, useState } from 'react';

import { Comment } from '@repo/contracts/comments';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';

interface CommentsProps {
  comments: Comment[];
  currentUserId?: string;
  onAddComment: (text: string) => void;
  onDeleteComment: (commentId: number) => void;
}

export default function Comments({
  comments,
  currentUserId,
  onAddComment,
  onDeleteComment,
}: CommentsProps) {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 max-h-64 overflow-y-auto">
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

      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <Input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1"
        />
        <Button type="submit" disabled={!commentText.trim()}>
          Post
        </Button>
      </form>
    </div>
  );
}
