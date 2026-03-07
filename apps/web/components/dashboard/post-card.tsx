'use client';

import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle } from 'lucide-react';

import { Post } from '@repo/contracts/posts';
import { getImageUrl } from '@/lib/media';
import { useLikePost } from '@/hooks/use-like-post';

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import UserAvatar from '../ui/user-avatar';
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={likePost}
              disabled={isLiking}
              className="p-0 h-auto"
            >
              <Heart
                className={`w-6 h-6 ${post.isLiked ? 'fill-red-500 text-red-500' : 'text-foreground'}`}
              />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments((prev) => !prev)}
              className="p-0 h-auto"
            >
              <MessageCircle
                className={`w-6 h-6 ${showComments ? 'fill-primary text-primary' : 'text-foreground'}`}
              />
            </Button>
          </div>
        </div>

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
