'use client';

import { Feed } from '@/features/feed/components/feed';
import { PageContainer } from '@/components/layout/page-container';
import { Stories } from '@/features/stories/components/stories';

export default function Home() {
  return (
    <PageContainer maxWidth="3xl" className="space-y-6">
      <Stories />
      <div className="mx-auto max-w-[630px]">
        <Feed />
      </div>
    </PageContainer>
  );
}
