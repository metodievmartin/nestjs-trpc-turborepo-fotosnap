'use client';

import { Bookmark, Heart, MessageCircle, Send } from 'lucide-react';

import { Button } from '../ui/button';

interface PostActionsProps {
  isLiked?: boolean;
  isLiking: boolean;
  onLike: () => void;
  onComment: () => void;
  commentActive?: boolean;
}

export default function PostActions({
  isLiked,
  isLiking,
  onLike,
  onComment,
  commentActive = false,
}: PostActionsProps) {
  const iconButton = 'p-0 h-auto w-auto hover:opacity-60 hover:bg-transparent';

  return (
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onLike}
          disabled={isLiking}
          className={iconButton}
        >
          <Heart
            className={`size-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onComment}
          className={iconButton}
        >
          <MessageCircle
            className={`size-6 ${commentActive ? 'fill-primary text-primary' : ''}`}
          />
        </Button>

        <Button variant="ghost" size="icon" className={iconButton}>
          <Send className="size-6" />
        </Button>
      </div>

      <Button variant="ghost" size="icon" className={iconButton}>
        <Bookmark className="size-6" />
      </Button>
    </div>
  );
}
