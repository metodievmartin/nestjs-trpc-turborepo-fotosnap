'use client';

import Feed from '@/components/dashboard/feed';
import Stories from '@/components/dashboard/stories';
import { PageContainer } from '@/components/layout/page-container';

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
