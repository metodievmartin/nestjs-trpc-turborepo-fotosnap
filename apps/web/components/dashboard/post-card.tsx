'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { Post } from '@repo/contracts/posts';

import { getImageUrl } from '@/lib/media';
import PostActions from '../posts/post-actions';
import UserProfileLink from '../ui/user-profile-link';
import { useLikePost } from '@/hooks/use-like-post';
import PostComments from '@/components/dashboard/post-comments';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { likePost, isLiking } = useLikePost(post.id);

  return (
    <article className="border">
      <div className="flex items-center justify-between p-4">
        <UserProfileLink
          userId={post.user.id}
          username={post.user.username}
          avatar={post.user.avatar}
          avatarSize="md"
        />
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
