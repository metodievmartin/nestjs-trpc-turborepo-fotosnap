'use client';

import { Loader2 } from 'lucide-react';

import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';

import { Button } from '../ui/button';
import UserProfileLink from '../ui/user-profile-link';
import { useFollowUser } from '@/hooks/use-follow-user';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';

export type FollowListType = 'followers' | 'following';

interface FollowListProps {
  userId: string;
  username: string;
  type: FollowListType;
}

export function FollowList({ userId, username, type }: FollowListProps) {
  const { data: session } = authClient.useSession();

  const followersQuery = trpc.users.getFollowers.useInfiniteQuery(
    { userId },
    {
      enabled: type === 'followers',
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialCursor: undefined,
    }
  );
  const followingQuery = trpc.users.getFollowing.useInfiniteQuery(
    { userId },
    {
      enabled: type === 'following',
      getNextPageParam: (last) => last.nextCursor ?? undefined,
      initialCursor: undefined,
    }
  );

  const activeQuery = type === 'followers' ? followersQuery : followingQuery;
  const users = activeQuery.data?.pages.flatMap((page) => page.items) ?? [];

  const { toggleFollow, pendingUserId } = useFollowUser(username, {
    invalidateOnSuccess: true,
  });

  const sentinelRef = useInfiniteScroll({
    hasNextPage: activeQuery.hasNextPage,
    isFetchingNextPage: activeQuery.isFetchingNextPage,
    fetchNextPage: activeQuery.fetchNextPage,
    rootMargin: '200px 0px',
  });

  if (users.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No {type === 'followers' ? 'followers' : 'following'} yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <UserProfileLink
            username={user.username}
            avatar={user.image}
            avatarSize="md"
            className="flex-1 min-w-0"
          />
          {session?.user.id !== user.id && (
            <Button
              variant={user.isFollowing ? 'outline' : 'default'}
              size="sm"
              onClick={() => toggleFollow(user.id, user.isFollowing)}
              disabled={pendingUserId === user.id}
              className="flex-shrink-0"
            >
              {user.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
      {activeQuery.isFetchingNextPage && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
