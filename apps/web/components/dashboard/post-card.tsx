'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

import { Post } from '@repo/contracts/posts';

import { Card } from '../ui/card';
import { getImageUrl } from '@/lib/media';
import UserAvatar from '../ui/user-avatar';
import PostActions from '../posts/post-actions';
import { useLikePost } from '@/hooks/use-like-post';
import PostComments from '@/components/dashboard/post-comments';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const { likePost, isLiking } = useLikePost(post.id);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <UserAvatar
            size="md"
            src={post.user.avatar}
            alt={post.user.username}
          />

          <span className="font-semibold text-sm">{post.user.username}</span>
        </div>
      </div>

      <div className="aspect-square relative">
        <Image
          src={getImageUrl(post.image)}
          alt="Post"
          className="object-cover"
          fill
        />
      </div>

      <div className="p-4 space-y-3">
        <PostActions
          isLiked={post.isLiked}
          isLiking={isLiking}
          onLike={likePost}
          onComment={() => setShowComments((prev) => !prev)}
          commentActive={showComments}
        />

        <div className="text-sm font-semibold">{post.likes} likes</div>

        <div className="text-sm">
          <span className="font-semibold">{post.user.username} </span>
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
    </Card>
  );
}
