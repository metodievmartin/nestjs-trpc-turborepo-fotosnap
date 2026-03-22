'use client';

import { Search, TrendingUp, Compass } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { PageContainer } from '@/components/layout/page-container';
import { SuggestedUsers } from '@/components/users/suggested-users';

export default function ExplorePage() {
  return (
    <PageContainer maxWidth="2xl" className="space-y-10">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search" className="pl-10 h-10" disabled />
      </div>

      {/* Suggested for you */}
      <SuggestedUsers />

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
