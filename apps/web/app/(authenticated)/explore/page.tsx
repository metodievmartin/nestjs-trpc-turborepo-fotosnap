'use client';

import Link from 'next/link';
import { Search, TrendingUp, Compass } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/user-avatar';
import { PageContainer } from '@/components/layout/page-container';
import { mockSuggestions } from '@/lib/mock-suggestions';

export default function ExplorePage() {
  return (
    <PageContainer maxWidth="2xl" className="space-y-10">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search" className="pl-10 h-10" disabled />
      </div>

      {/* Suggested for you */}
      <section>
        <h2 className="font-semibold text-base mb-5">Suggested for you</h2>
        <div className="max-w-sm mx-auto space-y-4">
          {mockSuggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link
                href={`/users/${user.id}`}
                className="hover:opacity-80 transition-opacity shrink-0"
              >
                <UserAvatar src={user.avatar} alt={user.username} size="md" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/users/${user.id}`}
                  className="font-semibold text-sm hover:opacity-80 transition-opacity"
                >
                  {user.username}
                </Link>
                {user.followedBy && (
                  <div className="text-xs text-muted-foreground">
                    Followed by {user.followedBy}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs cursor-pointer"
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Trending */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-base">Trending</h2>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Trending content coming soon
        </div>
      </section>

      {/* Discover */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <Compass className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-base">Discover</h2>
        </div>
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Discover new content coming soon
        </div>
      </section>
    </PageContainer>
  );
}
