'use client';

import { trpc } from '@/lib/trpc/client';
import PostCard from '@/components/posts/post-card';
import { PostCardSkeleton } from '@/components/posts/post-card-skeleton';

export default function Feed() {
  const { data: posts, isLoading } = trpc.posts.findAll.useQuery({});

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(posts || []).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
