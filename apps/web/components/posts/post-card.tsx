'use client';

import { useState } from 'react';

import { Post } from '@repo/contracts/posts';

import PostActions from './post-actions';
import { PostImage } from './post-image';
import { PostCaption } from './post-caption';
import { PostLikesCount } from './post-likes-count';
import { PostTimestamp } from './post-timestamp';
import { PostOptionsMenu } from './post-options-menu';
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
        <PostOptionsMenu
          postId={post.id}
          userId={post.user.id}
          showOpenPost
          className="-mr-2"
        />
      </div>

      <PostImage src={post.image} alt="Post" className="bg-black" />

      <div className="p-4 space-y-1.5">
        <PostActions
          isLiked={post.isLiked}
          isLiking={isLiking}
          onLike={likePost}
          onComment={() => setShowComments((prev) => !prev)}
          commentActive={showComments}
        />

        <PostLikesCount likes={post.likes} />

        <PostCaption
          userId={post.user.id}
          username={post.user.username}
          caption={post.caption}
        />

        {post.comments > 0 && (
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="text-sm text-muted-foreground cursor-pointer"
          >
            View all {post.comments} comments
          </button>
        )}

        <PostTimestamp timestamp={post.timestamp} />

        {showComments && (
          <div className="pt-4 border-t">
            <PostComments postId={post.id} />
          </div>
        )}
      </div>
    </article>
  );
}
