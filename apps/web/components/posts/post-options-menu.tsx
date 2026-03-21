'use client';

import { useRouter } from 'next/navigation';
import { LinkIcon, ExternalLink, MoreHorizontal, User } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface PostOptionsMenuProps {
  postId: number;
  userId: string;
  showOpenPost?: boolean;
  className?: string;
}

export function PostOptionsMenu({
  postId,
  userId,
  showOpenPost = false,
  className,
}: PostOptionsMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('cursor-pointer', className)}
        >
          <MoreHorizontal className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            navigator.clipboard.writeText(
              `${window.location.origin}/posts/${postId}`
            );
          }}
        >
          <LinkIcon className="h-4 w-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        {showOpenPost && (
          <DropdownMenuItem onClick={() => router.push(`/posts/${postId}`)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Open post
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => router.push(`/users/${userId}`)}>
          <User className="h-4 w-4 mr-2" />
          Go to profile
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
