'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PostDetail } from '@/components/posts/post-detail';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.postId);

  if (isNaN(postId)) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <p className="text-muted-foreground">Invalid post ID</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Desktop-only back bar — mobile header is inside PostDetail */}
      <div className="hidden md:flex items-center gap-1 px-4 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer h-8 w-8"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-base font-semibold">Post</h1>
      </div>
      <div className="md:h-[calc(100vh-8rem)]">
        <PostDetail postId={postId} />
      </div>
    </div>
  );
}
