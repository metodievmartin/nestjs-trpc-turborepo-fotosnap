'use client';

import { trpc } from '@/lib/trpc/client';
import { authClient } from '@/lib/auth/client';

import { Button } from '../ui/button';
import UserProfileLink from '../ui/user-profile-link';
import { useFollowUser } from '@/hooks/use-follow-user';

export type FollowListType = 'followers' | 'following';

interface FollowListProps {
  userId: string;
  type: FollowListType;
}

export function FollowList({ userId, type }: FollowListProps) {
  const { data: session } = authClient.useSession();
  const { data: followers = [] } = trpc.users.getFollowers.useQuery(
    { userId },
    { enabled: type === 'followers' }
  );
  const { data: following = [] } = trpc.users.getFollowing.useQuery(
    { userId },
    { enabled: type === 'following' }
  );
  const { toggleFollow, pendingUserId } = useFollowUser(userId, {
    invalidateOnSuccess: true,
  });

  const users = type === 'followers' ? followers : following;

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
            userId={user.id}
            username={user.name}
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
    </div>
  );
}
