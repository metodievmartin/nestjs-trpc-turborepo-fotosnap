'use client';

import Image from 'next/image';
import { Trash2, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SyntheticEvent, useState } from 'react';

import { getImageUrl } from '@/lib/media';
import { Comment } from '@repo/contracts/comments';

import { Input } from '../ui/input';
import { Button } from '../ui/button';

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
        {comments.map((comment) => {
          const avatarUrl = getImageUrl(comment.user.avatar);

          return (
            <div key={comment.id} className="flex items-start space-x-2">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={comment.user.username}
                  width={32}
                  height={32}
                  className="w-8 h-8 mt-2 rounded-full shrink-0"
                />
              ) : (
                <div className="w-8 h-8 mt-2 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
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
          );
        })}
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
