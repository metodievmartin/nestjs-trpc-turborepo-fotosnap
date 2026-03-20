'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { Button } from '@/components/ui/button';
import { FollowList } from '@/components/users/follow-list';

export default function FollowersPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const { data: profile } = trpc.users.getUserProfile.useQuery({ userId });

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
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
          {profile?.name ? `${profile.name}'s Followers` : 'Followers'}
        </h1>
      </div>
      <div className="px-4">
        <FollowList userId={userId} type="followers" />
      </div>
    </div>
  );
}
