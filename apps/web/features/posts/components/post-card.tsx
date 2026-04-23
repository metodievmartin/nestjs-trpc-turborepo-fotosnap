'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Post } from '@repo/contracts/posts';

import { useLikePost } from '@/features/posts/hooks/use-like-post';
import { PostImage } from '@/features/posts/components/post-image';
import { PostActions } from '@/features/posts/components/post-actions';
import { PostCaption } from '@/features/posts/components/post-caption';
import { UserProfileLink } from '@/components/common/user-profile-link';
import { PostTimestamp } from '@/features/posts/components/post-timestamp';
import { PostLikesCount } from '@/features/posts/components/post-likes-count';
import { PostOptionsMenu } from '@/features/posts/components/post-options-menu';
import { PostCommentsPreview } from '@/features/posts/components/post-comments-preview';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
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
