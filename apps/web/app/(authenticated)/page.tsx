'use client';

import Feed from '@/components/dashboard/feed';
import Stories from '@/components/dashboard/stories';

export default function Home() {
  return (
    <div className="space-y-6 px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <Stories />
      </div>
      <div className="mx-auto max-w-[630px]">
        <Feed />
      </div>
    </div>
  );
}
