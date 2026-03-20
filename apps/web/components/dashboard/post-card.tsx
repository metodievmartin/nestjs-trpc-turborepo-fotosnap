'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { LinkIcon, ExternalLink, MoreHorizontal, User } from 'lucide-react';

import { Post } from '@repo/contracts/posts';

import { getImageUrl } from '@/lib/media';
import { Button } from '../ui/button';
import PostActions from '../posts/post-actions';
import UserProfileLink from '../ui/user-profile-link';
import { useLikePost } from '@/hooks/use-like-post';
import PostComments from '@/components/dashboard/post-comments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { likePost, isLiking } = useLikePost(post.id);
  const router = useRouter();

  return (
    <article className="border">
      <div className="flex items-center justify-between p-4">
        <UserProfileLink
          userId={post.user.id}
          username={post.user.username}
          avatar={post.user.avatar}
          avatarSize="md"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="cursor-pointer -mr-2"
            >
              <MoreHorizontal className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/posts/${post.id}`
                );
              }}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/posts/${post.id}`)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open post
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push(`/users/${post.user.id}`)}
            >
              <User className="h-4 w-4 mr-2" />
              Go to profile
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative aspect-square bg-background">
        <Image
          src={getImageUrl(post.image)}
          alt="Post"
          className="object-contain"
          fill
        />
      </div>

      <div className="p-4 space-y-1.5">
        <PostActions
          isLiked={post.isLiked}
          isLiking={isLiking}
          onLike={likePost}
          onComment={() => setShowComments((prev) => !prev)}
          commentActive={showComments}
        />

        <div className="text-sm font-semibold">{post.likes} likes</div>

        <div className="text-sm">
          <Link
            href={`/users/${post.user.id}`}
            className="font-semibold hover:opacity-80"
          >
            {post.user.username}{' '}
          </Link>
          {post.caption}
        </div>

        {post.comments > 0 && (
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            View all {post.comments} comments
          </button>
        )}

        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(post.timestamp), {
            addSuffix: true,
          })}
        </div>

        {showComments && (
          <div className="pt-4 border-t">
            <PostComments postId={post.id} />
          </div>
        )}
      </div>
    </article>
  );
}
