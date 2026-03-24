'use client';

import { trpc } from '@/lib/trpc/client';
import PostCard from '@/components/posts/post-card';
import { PostCardSkeleton } from '@/components/posts/post-card-skeleton';
import { SuggestedUsers } from '@/components/users/suggested-users';

const SUGGESTION_AFTER_POST = 2;

export default function Feed() {
  const { data: postsData, isLoading } = trpc.posts.findAll.useQuery({});
  const posts = postsData?.items;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="py-8 space-y-8">
        <p className="text-center text-muted-foreground">
          Your feed is empty. Follow people to see their posts here.
        </p>
        <SuggestedUsers title="People you might like" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <div key={post.id}>
          <PostCard post={post} />
          {index === SUGGESTION_AFTER_POST - 1 &&
            posts.length > SUGGESTION_AFTER_POST && (
              <SuggestedUsers className="mt-6" />
            )}
        </div>
      ))}
    </div>
  );
}
