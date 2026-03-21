'use client';

import { trpc } from '@/lib/trpc/client';
import PostCard from '@/components/posts/post-card';

export default function Feed() {
  const posts = trpc.posts.findAll.useQuery({});

  return (
    <div className="space-y-6">
      {(posts.data || []).map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
