'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { getImageUrl } from '@/lib/media';
import { Button } from '../ui/button';
import UserProfileLink from '../ui/user-profile-link';
import { authClient } from '@/lib/auth/client';
import PostActions from './post-actions';
import { PostImage } from './post-image';
import { PostCaption } from './post-caption';
import { PostLikesCount } from './post-likes-count';
import { PostTimestamp } from './post-timestamp';
import { PostOptionsMenu } from './post-options-menu';
import { useComments } from '@/hooks/use-comments';
import { useLikePost } from '@/hooks/use-like-post';
import CommentList from '../dashboard/comment-list';
import CommentForm, { CommentFormHandle } from '../dashboard/comment-form';
import { PostDetailSkeleton } from './post-detail-skeleton';

interface PostDetailProps {
  postId: number;
}

export function PostDetail({ postId }: PostDetailProps) {
  const router = useRouter();
  const { data: post, isLoading } = trpc.posts.findById.useQuery({ postId });
  const { data: commentsData } = trpc.comments.findByPostId.useQuery({
    postId,
  });
  const comments = commentsData?.items ?? [];
  const { data: session } = authClient.useSession();
  const { likePost, isLiking } = useLikePost(postId);
  const { addComment, removeComment } = useComments(postId);
  const commentFormRef = useRef<CommentFormHandle>(null);

  if (isLoading) {
    return <PostDetailSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <p className="text-muted-foreground">This post doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  const caption = (
    <div className="mb-3">
      <PostCaption
        userId={post.user.id}
        username={post.user.username}
        caption={post.caption}
      />
    </div>
  );

  const actionButtons = (
    <div className="px-3 pt-2 pb-1 md:px-4 md:pt-3 md:pb-2">
      <PostActions
        isLiked={post.isLiked}
        isLiking={isLiking}
        onLike={likePost}
        onComment={() => commentFormRef.current?.focus()}
      />
    </div>
  );

  const likesCount = (
    <div className="px-3 pb-1 md:px-4 md:pb-2">
      <PostLikesCount likes={post.likes} />
    </div>
  );

  const timestamp = (
    <div className="px-3 pb-2 md:px-4 md:pb-3">
      <PostTimestamp
        timestamp={post.timestamp}
        className="text-[10px] uppercase tracking-wide"
      />
    </div>
  );

  const commentInput = (
    <div className="border-t px-4 py-2">
      <CommentForm ref={commentFormRef} onAddComment={addComment} borderless />
    </div>
  );

  /* ── Mobile: single-column natural scroll, sticky comment input ── */
  const mobileLayout = (
    <div className="md:hidden pb-28">
      {/* Header — back arrow + avatar + username + options */}
      <div className="flex items-center gap-2 px-2 py-1.5 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer h-8 w-8"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <UserProfileLink
          userId={post.user.id}
          username={post.user.username}
          avatar={post.user.avatar}
        />
        <PostOptionsMenu
          postId={post.id}
          userId={post.user.id}
          className="ml-auto -mr-2"
        />
      </div>

      {/* Image — aspect-ratio driven, no fixed height */}
      <PostImage
        src={post.image}
        alt={post.caption}
        sizes="100vw"
        className="bg-black"
      />

      {/* Actions → likes → caption → timestamp */}
      {actionButtons}
      {likesCount}
      <div className="px-3">{caption}</div>
      {timestamp}

      {/* Comments — natural page scroll */}
      <div className="px-3 pb-2 border-t pt-3">
        <CommentList
          comments={comments}
          currentUserId={session?.user?.id}
          onDeleteComment={removeComment}
        />
      </div>

      {/* Sticky comment input — sits above the mobile nav bar */}
      <div className="fixed bottom-[calc(theme(spacing.14)+1px)] left-0 right-0 bg-background border-t px-4 py-2 z-30">
        <CommentForm
          ref={commentFormRef}
          onAddComment={addComment}
          borderless
        />
      </div>
    </div>
  );

  /* ── Desktop: 2-column grid (image left, panel right) ── */
  const desktopLayout = (
    <div className="hidden md:grid md:grid-cols-[1.6fr_1fr] h-full flex-1 overflow-hidden">
      <div className="relative bg-black flex items-center justify-center min-h-0">
        <div className="relative w-full h-full">
          <Image
            src={getImageUrl(post.image)}
            alt={post.caption}
            fill
            className="object-contain"
            sizes="50vw"
          />
        </div>
      </div>

      <div className="flex flex-col h-full bg-background">
        <div className="flex items-center px-4 py-3 border-b">
          <UserProfileLink
            userId={post.user.id}
            username={post.user.username}
            avatar={post.user.avatar}
          />
          <PostOptionsMenu
            postId={post.id}
            userId={post.user.id}
            className="ml-auto -mr-2"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          <CommentList
            comments={comments}
            currentUserId={session?.user?.id}
            onDeleteComment={removeComment}
          />
        </div>

        {commentInput}

        <div className="border-t">
          {actionButtons}
          {likesCount}
          <div className="px-4">{caption}</div>
          {timestamp}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
