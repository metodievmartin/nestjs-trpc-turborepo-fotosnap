'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Post } from '@repo/contracts/posts';

import PostActions from './post-actions';
import { PostImage } from './post-image';
import { PostCaption } from './post-caption';
import { PostLikesCount } from './post-likes-count';
import { PostTimestamp } from './post-timestamp';
import { PostOptionsMenu } from './post-options-menu';
import { PostCommentsPreview } from './post-comments-preview';
import UserProfileLink from '../ui/user-profile-link';
import { useLikePost } from '@/hooks/use-like-post';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const router = useRouter();
  const { likePost, isLiking } = useLikePost(post.id);
  const detailHref = `/posts/${post.id}`;

  return (
    <article className="border">
      <div className="flex items-center justify-between p-4">
        <UserProfileLink
          username={post.user.username}
          avatar={post.user.avatar}
          avatarSize="md"
        />
        <PostOptionsMenu
          postId={post.id}
          username={post.user.username}
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
          onComment={() => router.push(detailHref)}
        />

        <PostLikesCount likes={post.likes} />

        <PostCaption username={post.user.username} caption={post.caption} />

        {post.comments > 0 && (
          <>
            <Link
              href={detailHref}
              className="text-sm text-muted-foreground hover:opacity-80 block"
            >
              View all {post.comments} comments
            </Link>
            <PostCommentsPreview postId={post.id} />
          </>
        )}

        <PostTimestamp timestamp={post.timestamp} />
      </div>
    </article>
  );
}
