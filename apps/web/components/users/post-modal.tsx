'use client';

import Link from 'next/link';
import { useRef } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

import { Post } from '@repo/contracts/posts';

import { trpc } from '@/lib/trpc/client';
import { getImageUrl } from '@/lib/media';
import UserAvatar from '../ui/user-avatar';
import UserProfileLink from '../ui/user-profile-link';
import { authClient } from '@/lib/auth/client';
import PostActions from '../posts/post-actions';
import { useComments } from '@/hooks/use-comments';
import { useLikePost } from '@/hooks/use-like-post';
import CommentList from '../dashboard/comment-list';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import CommentForm, { CommentFormHandle } from '../dashboard/comment-form';

interface PostModalProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostModal({
  post: initialPost,
  open,
  onOpenChange,
}: PostModalProps) {
  const { data: fetchedPost } = trpc.posts.findById.useQuery(
    { postId: initialPost.id },
    { initialData: initialPost }
  );
  const post = fetchedPost ?? initialPost;
  const { data: comments = [] } = trpc.comments.findByPostId.useQuery({
    postId: post.id,
  });
  const { data: session } = authClient.useSession();
  const { likePost, isLiking } = useLikePost(post.id);
  const { addComment, removeComment } = useComments(post.id);
  const commentFormRef = useRef<CommentFormHandle>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-5xl! w-full h-[90vh] p-0 overflow-hidden flex flex-col"
      >
        <DialogTitle className="sr-only">
          Post by {post.user.username}
        </DialogTitle>
        <div className="grid md:grid-cols-[1.2fr_1fr] h-full flex-1 overflow-hidden">
          <div className="relative bg-black flex items-center justify-center min-h-0">
            <div className="relative w-full h-full">
              <Image
                src={getImageUrl(post.image)}
                alt={post.caption}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center px-4 py-3 border-b">
              <UserProfileLink
                userId={post.user.id}
                username={post.user.username}
                avatar={post.user.avatar}
              />
            </div>

            {/* Scrollable: caption + comments */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {/* Caption */}
              <div className="flex gap-3 mb-4">
                <Link
                  href={`/users/${post.user.id}`}
                  className="shrink-0 self-start hover:opacity-80"
                >
                  <UserAvatar src={post.user.avatar} alt={post.user.username} />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <Link
                      href={`/users/${post.user.id}`}
                      className="font-semibold mr-1 hover:opacity-80"
                    >
                      {post.user.username}
                    </Link>
                    {post.caption}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(post.timestamp), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              <CommentList
                comments={comments}
                currentUserId={session?.user?.id}
                onDeleteComment={removeComment}
              />
            </div>

            {/* Footer: actions + form */}
            <div className="border-t">
              <div className="px-4 pt-3 pb-2">
                <PostActions
                  isLiked={post.isLiked}
                  isLiking={isLiking}
                  onLike={likePost}
                  onComment={() => commentFormRef.current?.focus()}
                />
              </div>

              {/* Likes count */}
              <div className="px-4 pb-2">
                <p className="font-semibold text-sm">
                  {post.likes.toLocaleString()} likes
                </p>
              </div>

              {/* Timestamp */}
              <div className="px-4 pb-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {formatDistanceToNow(new Date(post.timestamp), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Comment input */}
              <div className="border-t px-4 py-2">
                <CommentForm
                  ref={commentFormRef}
                  onAddComment={addComment}
                  borderless
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
