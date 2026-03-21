'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { FollowList } from '@/components/users/follow-list';
import { PageContainer } from '@/components/layout/page-container';

interface FollowListPageProps {
  type: 'followers' | 'following';
}

const labels = {
  followers: 'Followers',
  following: 'Following',
} as const;

export default function FollowListPage({ type }: FollowListPageProps) {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { data: profile } = trpc.users.getUserProfile.useQuery({ userId });

  const label = labels[type];

  return (
    <PageContainer maxWidth="lg">
      <div className="flex items-center gap-2 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <h1 className="text-lg font-semibold">
          {profile?.name ? `${profile.name}'s ${label}` : label}
        </h1>
      </div>
      <div className="px-4">
        <FollowList userId={userId} type={type} />
      </div>
    </PageContainer>
  );
}
