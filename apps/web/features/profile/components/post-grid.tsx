'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';

import { Post } from '@repo/contracts/posts';

import { getImageUrl } from '@/lib/media';
import { useMediaQuery } from '@/hooks/use-media-query';

interface PostGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
}

export function PostsGrid({ posts, onPostClick }: PostGridProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <div className="grid grid-cols-3 gap-0.5 md:gap-1">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          onClick={(e) => {
            if (onPostClick && isDesktop) {
              e.preventDefault();
              onPostClick(post);
            }
          }}
          className="aspect-square relative group cursor-pointer overflow-hidden"
        >
          <Image
            src={getImageUrl(post.image)}
            alt={post.caption}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span className="font-semibold">{post.likes}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">{post.comments}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
